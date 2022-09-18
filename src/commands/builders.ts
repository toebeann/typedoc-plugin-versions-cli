import { findFile, findTsConfigFile, isDir } from '../utils';
import { join, resolve } from 'path';

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
            throw new Error(`Directory does not exist: ${path}`);

        return path;
    },
};

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

export const options = { out, typedoc, tsconfig };

export const yes = {
    alias: 'y',
    type: 'boolean' as const,
    description: 'automatically confirm prompts',
    default: false,
};
