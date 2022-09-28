import { join, relative, resolve } from 'node:path';
import { cwd } from 'node:process';
import { each, filter, find } from 'async';
import {
    pathExists,
    pathExistsSync,
    stat,
    lstat,
    readdir,
    readJson,
    readlink,
    unlink,
} from 'fs-extra';
import {
    findConfigFile,
    getParsedCommandLineOfConfigFile,
    sys,
    formatDiagnosticsWithColorAndContext,
} from 'typescript';
import { commonOptions, out } from './commands/builders';
import { Options, Args } from './';

/**
 * Compiles and parses common options from the config files and command line arguments into an {@link index!Options Options} object.
 * @param {Args<O>} args Command line arguments passed to the application.
 * @returns {Promise<Options>} The parsed {@link index!Options Options} object.
 * @typeParam O An object extending the {@link commands/builders!commonOptions commonOptions} object.
 * @throws {@link !Error Error} When the `out` option points to a directory which does not exist.
 */
export async function getOptions<O extends typeof commonOptions>(
    args: Args<O>
): Promise<Options> {
    // get tsconfig, using typescript's own methods for reliability
    const tsconfig = getParsedCommandLineOfConfigFile(
        args.tsconfig,
        {},
        {
            ...sys,
            onUnRecoverableConfigFileDiagnostic: (diagnostic) =>
                console.debug(
                    formatDiagnosticsWithColorAndContext([diagnostic], {
                        getCanonicalFileName: resolve,
                        getCurrentDirectory: () => cwd(),
                        getNewLine: () => sys.newLine,
                    })
                ),
        }
    );

    // load the typedoc config
    const typedoc = await readJson(await args.typedoc);

    // now attempt to discern the typedoc out docs from the given configs and command line args, reverting to './docs' if not specified
    const out = resolve(
        args.out ??
            typedoc.out ??
            tsconfig?.raw.typedocOptions?.out ??
            join(cwd(), 'docs')
    );

    // check directory exists and throw if not
    if (!(await isDir(out))) {
        throw new Error(`Directory does not exist: ${relative(cwd(), out)}`);
    }

    // everything looks good, return our options object with defaults overridden by configs
    return {
        out,
        versions: {
            stable: 'auto',
            dev: 'auto',
            domLocation: 'false',
            ...(tsconfig?.raw.typedocOptions?.versions ?? {}),
            ...(typedoc.versions ?? {}),
        },
    };
}

/**
 * Parses the `out` option from the given command line args, processing the user's config files if available.
 * @param {Args<O>} args Command line arguments passed to the application.
 * @returns {Promise<string>} The parsed {@link commands/builders!out out} option.
 * @typeParam O An object extending a relevant subset of the {@link commands/builders!commonOptions commonOptions} object.
 * @throws {@link !Error Error} when the `out` option could not be found.
 */
export async function getOut<O extends { out: typeof out }>(
    args: Args<O>
): Promise<string> {
    if (args.out) return args.out;
    else if (isOptionsArgs(args)) return (await getOptions(args))?.out;
    else throw new Error(`Could not parse 'out'`);
}

/**
 * Type guard for determining whether a given object is or extends {@link commands/builders!commonOptions commonOptions}.
 * @param {unknown} obj The object.
 * @returns {obj is Args<typeof commonOptions>} Whether the object is or extends {@link commands/builders!commonOptions commonOptions}.
 */
export const isOptionsArgs = (
    obj: unknown
): obj is Args<typeof commonOptions> =>
    obj !== null &&
    typeof obj === 'object' &&
    'typedoc' in obj &&
    'tsconfig' in obj;

/**
 * Attempts to find a tsconfig file at a given path.
 * @param {string} [path=cwd()] The path to the tsconfig or a directory containing it.
 * Defaults to {@link node:process!cwd process.cwd()}.
 * @returns {string} The fully resolved path to the tsconfig file if found.
 * @throws {@link !Error Error} if the path does not exist or tsconfig file is invalid or not found.
 */
export function findTsConfigFile(path: string = cwd()): string {
    path = resolve(path);

    if (!pathExistsSync(path))
        throw new Error(`Path does not exist: ${relative(cwd(), path)}`);

    const file = findConfigFile(path, sys.fileExists);

    if (!file)
        throw new Error(
            `Cannot find a valid tsconfig at path: ${relative(cwd(), path)}`
        );

    return resolve(file);
}

/**
 * Attempts to find a file at a given path. When a directory is passed as the first argument `path`, uses that directory
 * as a search path and searches for files passed in the second argument `filePaths`, resolving and returning the first hit.
 * @param {string} [path=cwd()] The path to the file or a directory containing it. When a directory is passed,
 * `filePaths` should contain at least one file path relative to the directory.
 * Defaults to {@link node:process!cwd process.cwd()}.
 * @param {readonly string[]} [filePaths=[]] An array of file paths to search for when `path` is a directory.
 * @returns {Promise<string>} The fully resolved path to the file if found.
 * @throws {@link !Error Error} if the path does not exist or the file was not found.
 */
export async function findFile(
    path: string = cwd(),
    filePaths: readonly string[] = []
): Promise<string> {
    path = resolve(path);

    if (!(await pathExists(path)))
        throw new Error(`Path does not exist: ${relative(cwd(), path)}`);

    const file = await find(
        [path, ...filePaths.map((p) => join(path, p))],
        isFile
    );

    if (!file && path === cwd() && filePaths.length === 0)
        throw new Error(
            'filePaths must contain at least one file path when path is a directory!'
        );
    else if (!file) throw new Error(`A matching file could not be found.`);

    return resolve(file);
}

/**
 * Determines whether a given path is a file.
 * @param {string} path The path.
 * @returns {Promise<boolean>} Whether the path is a file.
 */
export async function isFile(path: string): Promise<boolean> {
    try {
        return (await stat(path)).isFile();
    } catch {
        return false;
    }
}

/**
 * Determines whether a given path is a directory.
 * @param {string} path The path.
 * @returns {Promise<boolean>} Whether the path is a directory.
 */
export async function isDir(path: string): Promise<boolean> {
    try {
        return (await stat(path)).isDirectory();
    } catch {
        return false;
    }
}

/**
 * Determines whether a given path is a symbolic link.
 * @param {string} path The path.
 * @returns {Promise<string>} Whether the path is a symbolic link.
 */
export async function isSymlink(path: string): Promise<boolean> {
    try {
        return (await lstat(path)).isSymbolicLink();
    } catch {
        return false;
    }
}

/**
 * Determines whether a given path is a symbolic link which points to a path which does not exist.
 * @param {string} path The path.
 * @returns {Promise<string>} Whether the path is a broken symbolic link.
 */
export const isBrokenSymlink = async (path: string): Promise<boolean> =>
    (await isSymlink(path)) && !(await pathExists(await readlink(path)));

/**
 * Removes all broken symbolic links within a directory.
 * @param {string} dir The path to the directory.
 */
export async function unlinkBrokenSymlinks(dir: string): Promise<void> {
    const paths = (await readdir(dir)).map((path) => join(dir, path));
    const brokenSymLinks = await filter(paths, isBrokenSymlink);
    await each(brokenSymLinks, unlink);
}

/**
 * Removes elements from an array that meet the condition specified in a callback function, and returns the elements which were removed.
 * @remarks Changes the contents of the array by removing existing elements {@link https://en.wikipedia.org/wiki/In-place_algorithm in place}.
 * To retrieve a new array with the elements removed without modifying the original, see {@link exclude}.
 * @param {T[]} array The array.
 * @param {(T) => boolean} predicate A function which accepts a `typeof T` argument and returns a `boolean`. The drop function calls the
 * predicate function one time for each element in the array, and removes those elements for which the predicate returns `true`.
 * @returns {T[]} The elements which were removed from the array.
 * @typeParam T The type of the elements in the array.
 * @see {@link exclude}
 */
export function drop<T>(array: T[], predicate: (value: T) => boolean): T[];
/**
 * Removes elements from an array which are found in another array.
 * @remarks Changes the contents of the array by removing existing elements {@link https://en.wikipedia.org/wiki/In-place_algorithm in place}.
 * To retrieve a new array with the elements removed without modifying the original, see {@link exclude}.
 * @param {T[]} array The array.
 * @param {readonly unknown[]} elements An array of elements to remove from the array.
 * @returns {T[]} The elements which were removed from the array.
 * @typeParam T The type of the elements in the array.
 * @typeParam U The type of the elements in the array of elements to remove.
 * @see {@link exclude}
 */
export function drop<T extends U, U>(array: T[], elements: readonly U[]): T[];
export function drop<T extends U, U>(
    array: T[],
    elementsOrPredicate: readonly U[] | ((value: T) => boolean)
): T[] {
    const toBeDropped =
        typeof elementsOrPredicate === 'function'
            ? array.filter(elementsOrPredicate)
            : array.filter((v) => elementsOrPredicate.includes(v));

    const dropped = [];
    for (const value of toBeDropped) {
        const i = array.indexOf(value);
        if (i >= 0) {
            dropped.push(...array.splice(i, 1));
        }
    }
    return dropped;
}

/**
 * Creates and returns a {@link https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy shallow copy} of the given array,
 * with the elements that meet the condition specified in the provided callback function excluded.
 * @remarks For the equivalent function which acts on the array {@link https://en.wikipedia.org/wiki/In-place_algorithm in place}, see {@link drop}.
 * @param {readonly T[]} array The array.
 * @param {(T) => boolean} predicate A function which accepts a `typeof T` argument and returns a `boolean`. The exclude function calls the
 * predicate function one time for each element in the array, and excludes those elements for which the predicate returns `true` from the returned array.
 * @returns {T[]} A {@link https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy shallow copy} of the array, with the elements for which the predicate
 * function returns `true` excluded.
 * @typeParam T The type of the elements in the array.
 * @see {@link drop}
 */
export function exclude<T>(
    array: readonly T[],
    predicate: (value: T) => boolean
): T[];
/**
 * Creates and returns a {@link https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy shallow copy} of the given array,
 * with the elements from a second array excluded.
 * @remarks For the equivalent function which acts on the array {@link https://en.wikipedia.org/wiki/In-place_algorithm in place}, see {@link drop}.
 * @param {readonly T[]} array The array.
 * @param {readonly U[]} elements An array of elements to exclude from the returned array.
 * @returns {T[]} A {@link https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy shallow copy} of the array, with the elements which were found in the
 * `elements` array excluded.
 * @typeParam T The type of the elements in the array.
 * @typeParam U The type of the elements in the array of elements to exclude.
 * @see {@link drop}
 */
export function exclude<T extends U, U>(
    array: readonly T[],
    elements: readonly U[]
): T[];
export function exclude<T extends U, U>(
    array: readonly T[],
    elementsOrPredicate: readonly U[] | ((value: T) => boolean)
): T[] {
    return array.filter((v) =>
        typeof elementsOrPredicate === 'function'
            ? !elementsOrPredicate(v)
            : !elementsOrPredicate.includes(v)
    );
}

/**
 * Removes surrounding whitespace and enclosing quotation marks from all strings of an array.
 * @remarks Intended for use when handling string arrays passed by {@link http://yargs.js.org/ yargs} from the command line.
 * @param {string[]} array The array of strings.
 * @returns {string[]} The coerced array of strings.
 */
export const coerceStringArray = (array: string[]): string[] =>
    array.map((value) => {
        value = value.trim();
        return (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('`') && value.endsWith('`'))
            ? [...value].slice(1, -1).join('')
            : value;
    });
