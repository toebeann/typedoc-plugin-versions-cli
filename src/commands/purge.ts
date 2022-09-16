import { each, filter } from 'async';
import { version } from 'typedoc-plugin-versions';
import {
    loadMetadata,
    refreshMetadata,
    getSemanticVersion,
    getVersionAlias,
} from 'typedoc-plugin-versions/src/etc/utils';
import { rm } from 'fs-extra';
import { join, relative, resolve } from 'path';
import { EOL } from 'os';
import prompts from 'prompts';
import { gt } from 'semver';
import { Argv } from 'yargs';
import { options, yes } from './builders';
import { getOptions, isDir } from '../utils';
import { Args, refreshedMetadata } from '../';

export const command = ['purge [ranges..]'];
export const description = 'purge old doc builds';
export const builder = (yargs: Argv) =>
    yargs.options({
        stale: {
            alias: 's',
            type: 'boolean' as const,
            description: 'purge stale dev versions',
            default: true,
        },
        // sync: {
        //     alias: 's',
        //     type: 'boolean',
        //     description: 'synchronize metadata and symlinks',
        //     default: true,
        // },
        // 'symlinks': {
        //     alias: 'symlinks',
        //     type: 'boolean',
        //     description: 'always synchronize symlinks even if no metadata changes detected',
        //     default: false
        // },
        // 'major-versions': {
        //     alias: 'major',
        //     type: 'number',
        //     description: 'keep only the specified number of major versions',
        // },
        // 'minor-versions': {
        //     alias: 'minor',
        //     type: 'number',
        //     description:
        //         'keep only the specified number of minor versions per major version',
        // },
        // 'patch-versions': {
        //     alias: 'patch',
        //     type: 'number',
        //     description:
        //         'keep only the specified number of patch versions per minor version',
        // },
        yes,
        ...options,
    });
// .positional('ranges', {
//     type: 'string',
//     description: 'version ranges to purge',
//     array: true,
// });

export async function handler<T extends Args<ReturnType<typeof builder>>>(
    args: T
): Promise<void> {
    const pending: version[] = [];
    const options = await getOptions(args);
    const metadata = refreshMetadata(
        loadMetadata(options.out),
        options.out,
        options.versions.stable,
        options.versions.dev
    ) as refreshedMetadata;

    if (args.stale)
        pending.push(
            ...(await getStale(
                metadata.versions,
                options.out,
                options.versions.stable,
                options.versions.dev
            ))
        );

    if (pending.length === 0) {
        console.log('Nothing to purge!');
        return;
    }

    console.log(
        (args.yes ? 'Purging:' : 'Pending purge:')
            .concat(EOL)
            .concat(
                pending
                    .map(
                        (v) =>
                            `- ${relative(process.cwd(), join(options.out, v))}`
                    )
                    .join(EOL)
            )
    );

    if (
        args.yes ||
        (
            await prompts({
                name: 'confirm',
                type: 'confirm',
                initial: false,
                message: 'Purge docs for these versions?',
            })
        ).confirm
    ) {
        if (!args.yes) console.log('');

        await each(pending, async (version) => {
            const dir = resolve(join(options.out, version));
            await rm(dir, { recursive: true, force: true });
        });
    }
}

export const isStable = (version: version, stable: version | 'auto'): boolean =>
    getVersionAlias(version, stable) === 'stable';

export const isDev = (version: version, dev: version | 'auto'): boolean =>
    getVersionAlias(version, undefined, dev) === 'dev';

export const isPinned = (
    version: version,
    stable: version | 'auto',
    dev: version | 'auto'
): boolean =>
    (stable !== 'auto' &&
        getSemanticVersion(version) === getSemanticVersion(stable)) ||
    (dev !== 'auto' && getSemanticVersion(version) === getSemanticVersion(dev));

export const isStale = (
    version: version,
    versions: version[],
    stable: version | 'auto',
    dev: version | 'auto'
): boolean =>
    !isPinned(version, stable, dev) &&
    isDev(version, dev) &&
    !!versions
        .filter((v) => isStable(v, stable))
        .find((s) => gt(s, version, true));

export const getStale = (
    versions: version[],
    docsPath: string,
    stable: version | 'auto',
    dev: version | 'auto'
): Promise<version[]> =>
    filter(
        versions,
        async (version) =>
            (await isDir(resolve(join(docsPath, version)))) &&
            isStale(version, versions, stable, dev)
    );
