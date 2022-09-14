import { findFile, isDir } from '../utils';
import { join, resolve } from 'path';

export const out = {
    type: 'string' as const,
    normalize: true,
    description: 'path to your typedoc output directory',
    defaultDescription: `"docs" (if not set in config)`,
    coerce: (path: string) => {
        path = resolve(path);

        if (!isDir(path)) throw new Error(`Directory does not exist: ${path}`);

        return path;
    },
};

export const typedoc = {
    type: 'string' as const,
    normalize: true,
    description: 'path to your typedoc config',
    default: '.',
    coerce: (path: string) =>
        findFile(path, [
            'typedoc.json',
            'typedoc.js',
            join('.config', 'typedoc.js'),
            join('.config', 'typedoc.json'),
        ]),
};

export const tsconfig = {
    type: 'string' as const,
    normalize: true,
    description: 'path to your tsconfig',
    default: '.',
    coerce: (path: string) => findFile(path, true),
};

export const options = { out, typedoc, tsconfig };

export const yes = {
    alias: 'y',
    type: 'boolean' as const,
    description: 'automatically confirm prompts',
    default: false,
};
