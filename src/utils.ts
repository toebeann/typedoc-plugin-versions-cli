import { each, filter, find } from 'async';
import {
    pathExists,
    pathExistsSync,
    stat,
    statSync,
    lstat,
    readdir,
    readJson,
    readlink,
    unlink,
} from 'fs-extra';
import { join, relative, resolve } from 'path';
import {
    findConfigFile,
    getParsedCommandLineOfConfigFile,
    sys,
    formatDiagnosticsWithColorAndContext,
} from 'typescript';
import { options, out } from './commands/builders';
import { Options, Args } from './';

export async function getOptions<O extends typeof options>(
    args: Args<O>
): Promise<Options> {
    const tsconfig = getParsedCommandLineOfConfigFile(
        args.tsconfig,
        {},
        {
            ...sys,
            onUnRecoverableConfigFileDiagnostic: (diagnostic) =>
                console.debug(
                    formatDiagnosticsWithColorAndContext([diagnostic], {
                        getCanonicalFileName: resolve,
                        getCurrentDirectory: () => process.cwd(),
                        getNewLine: () => sys.newLine,
                    })
                ),
        }
    );
    const typedoc = await readJson(await args.typedoc);

    const out = resolve(
        args.out ??
            typedoc.out ??
            tsconfig?.raw.typedocOptions?.out ??
            join(process.cwd(), 'docs')
    );

    if (!(await isDir(out))) {
        throw new Error(
            `Directory does not exist: ${relative(process.cwd(), out)}`
        );
    }

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

export async function getOut<O extends { out: typeof out }>(
    args: Args<O>
): Promise<string> {
    if (args.out) return args.out;
    else if (isOptionsArgs(args)) return (await getOptions(args)).out;
    else throw new Error(`Could not parse 'out': ${JSON.stringify(args)}`);
}

export const isOptionsArgs = (obj: unknown): obj is Args<typeof options> =>
    obj !== null &&
    typeof obj === 'object' &&
    'typedoc' in obj &&
    'tsconfig' in obj;

export function findTsConfigFile(path = process.cwd()): string {
    path = resolve(path);

    if (!pathExistsSync(path))
        throw new Error(
            `Path does not exist: ${relative(process.cwd(), path)}`
        );

    const file = findConfigFile(path, isFileSync);

    if (!file)
        throw new Error(
            `File does not exist: ${relative(process.cwd(), path)}`
        );

    return resolve(file);
}

export async function findFile(
    path = process.cwd(),
    fallbackPaths: readonly string[] = []
): Promise<string> {
    path = resolve(path);

    if (!(await pathExists(path)))
        throw new Error(
            `Path does not exist: ${relative(process.cwd(), path)}`
        );

    const file = await find(
        [path, ...fallbackPaths.map((p) => join(path, p))],
        isFile
    );

    if (!file)
        throw new Error(
            `File does not exist: ${relative(process.cwd(), path)}`
        );

    return resolve(file);
}

export const isFileSync = (path: string): boolean =>
    statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;

export async function isFile(path: string): Promise<boolean> {
    try {
        return (await stat(path)).isFile();
    } catch {
        return false;
    }
}

export async function isDir(path: string): Promise<boolean> {
    try {
        return (await stat(path)).isDirectory();
    } catch {
        return false;
    }
}

export async function isSymlink(path: string): Promise<boolean> {
    try {
        return (await lstat(path)).isSymbolicLink();
    } catch {
        return false;
    }
}

export const isBrokenSymlink = async (path: string): Promise<boolean> =>
    (await isSymlink(path)) && !(await pathExists(await readlink(path)));

export async function unlinkBrokenSymlinks(dir: string): Promise<void> {
    const paths = (await readdir(dir)).map((path) => join(dir, path));
    const brokenSymLinks = await filter(paths, isBrokenSymlink);
    await each(brokenSymLinks, unlink);
}

export function drop<T>(array: T[], predicate: (value: T) => boolean): T[];
export function drop<T>(array: T[], elements: readonly T[]): T[];
export function drop<T>(
    array: T[],
    elementsOrPredicate: readonly T[] | ((value: T) => boolean)
): T[] {
    const toBeDropped =
        typeof elementsOrPredicate === 'function'
            ? array.filter(elementsOrPredicate)
            : elementsOrPredicate;

    const dropped = [];
    for (const value of toBeDropped) {
        const i = array.indexOf(value);
        if (i >= 0) {
            dropped.push(...array.splice(i, 1));
        }
    }
    return dropped;
}

export function exclude<T>(
    array: readonly T[],
    predicate: (value: T) => boolean
): T[];
export function exclude<T>(array: readonly T[], elements: readonly T[]): T[];
export function exclude<T>(
    array: readonly T[],
    elementsOrPredicate: readonly T[] | ((value: T) => boolean)
): T[] {
    return array.filter((v) =>
        typeof elementsOrPredicate === 'function'
            ? !elementsOrPredicate(v)
            : !elementsOrPredicate.includes(v)
    );
}

export const coerceStringArray = (array: string[]) =>
    array.map((value) => {
        value = value.trim();
        return (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
            ? [...value].slice(1, -1).join('')
            : value;
    });
