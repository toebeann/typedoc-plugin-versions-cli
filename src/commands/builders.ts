import { join, relative, resolve } from 'node:path';
import { cwd } from 'node:process';
import { findFile, findTsConfigFile, isDir } from '../utils';

/**
 * `out` option builder for {@link https://yargs.js.org/docs yargs} commands.
 * @internal
 * Intended for internal use; may not be exported in future.
 */
export const out = {
    type: 'string' as const,
    normalize: true,
    description: 'path to your typedoc output directory',
    defaultDescription: `"docs" (if not set in config)`,
    coerce: async (path: string | string[]): Promise<string> => {
        path = resolve(
            typeof path === 'string' ? path : (path.at(-1) as string)
        );

        if (!(await isDir(path)))
            throw new Error(
                `Directory does not exist: ${relative(cwd(), path)}`
            );

        return path;
    },
};

/**
 * `typedoc` option builder for {@link https://yargs.js.org/docs yargs} commands.
 * @internal
 * Intended for internal use; may not be exported in future.
 */
export const typedoc = {
    type: 'string' as const,
    normalize: true,
    description: 'path to your typedoc config',
    default: '.',
    coerce: (path: string | string[]): Promise<string> => {
        path = typeof path === 'string' ? path : (path.at(-1) as string);
        return findFile(path, [
            'typedoc.json',
            'typedoc.js',
            join('.config', 'typedoc.js'),
            join('.config', 'typedoc.json'),
        ]);
    },
};

/**
 * `tsconfig` option builder for {@link https://yargs.js.org/docs yargs} commands.
 * @internal
 * Intended for internal use; may not be exported in future.
 */
export const tsconfig = {
    type: 'string' as const,
    normalize: true,
    description: 'path to your tsconfig',
    default: '.',
    coerce: (path: string | string[]): string => {
        path = typeof path === 'string' ? path : (path.at(-1) as string);
        return findTsConfigFile(path);
    },
};

/**
 * Commonly used option builders for {@link https://yargs.js.org/docs yargs} commands.
 * @internal
 * Intended for internal use; may not be exported in future.
 */
export const commonOptions = { out, typedoc, tsconfig };

/**
 * `yes` option builder for {@link https://yargs.js.org/docs yargs} commands.
 * @internal
 * Intended for internal use; may not be exported in future.
 */
export const yes = {
    alias: 'y',
    type: 'boolean' as const,
    description: 'automatically confirm prompts',
    default: false,
};
