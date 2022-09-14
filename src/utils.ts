import {
    pathExistsSync,
    statSync,
    lstatSync,
    readdirSync,
    readJsonSync,
    readlinkSync,
    unlinkSync,
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

export function getOptions<O extends typeof options>(args: Args<O>): Options {
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
    const typedoc = readJsonSync(args.typedoc);

    const out = resolve(
        args.out ??
            typedoc.out ??
            tsconfig?.raw.typedocOptions?.out ??
            join(process.cwd(), 'docs')
    );

    if (!isDir(out)) {
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

export function getOut<O extends { out: typeof out }>(args: Args<O>): string {
    if (args.out) return args.out;
    else if (isOptionsArgs(args)) return getOptions(args).out;
    else throw new Error(`Could not parse 'out': ${JSON.stringify(args)}`);
}

export const isOptionsArgs = (obj: unknown): obj is Args<typeof options> =>
    typeof obj === 'object' &&
    obj !== null &&
    'typedoc' in obj &&
    'tsconfig' in obj;

export function findFile(path?: string, fallbackPaths?: string[]): string;
export function findFile(path?: string, tsconfig?: boolean): string;
export function findFile(
    path = process.cwd(),
    fallbackPathsOrTsConfig: string[] | boolean = []
): string {
    const tsconfig =
        typeof fallbackPathsOrTsConfig === 'boolean' && fallbackPathsOrTsConfig;
    const fallbackPaths =
        typeof fallbackPathsOrTsConfig !== 'boolean'
            ? fallbackPathsOrTsConfig
            : [];

    path = resolve(path);

    if (!pathExistsSync(path))
        throw new Error(
            `Path does not exist: ${relative(process.cwd(), path)}`
        );

    const file = tsconfig
        ? findConfigFile(path, isFile)
        : [path, ...fallbackPaths.map((p) => join(path, p))].find(isFile);

    if (!file)
        throw new Error(
            `File does not exist: ${relative(process.cwd(), path)}`
        );

    return resolve(file);
}

export const isFile = (path: string): boolean =>
    statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;

export const isDir = (path: string): boolean =>
    statSync(path, { throwIfNoEntry: false })?.isDirectory() ?? false;

export const isSymlink = (path: string): boolean =>
    lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink() ?? false;

export const isBrokenSymlink = (path: string): boolean =>
    isSymlink(path) && !pathExistsSync(readlinkSync(path));

export function unlinkBrokenSymlinks(dir: string): void {
    for (const path of readdirSync(dir)
        .map((p) => join(dir, p))
        .filter(isBrokenSymlink)) {
        unlinkSync(path);
    }
}
