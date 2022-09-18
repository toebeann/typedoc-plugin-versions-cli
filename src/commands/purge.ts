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
import { gt, satisfies } from 'semver';
import { Argv } from 'yargs';
import { options, yes } from './builders';
import { drop, getOptions, isDir } from '../utils';
import { Args, refreshedMetadata } from '../';

export const command = ['purge [versions..]'];
export const description = 'purge old doc builds';
export const builder = (yargs: Argv) =>
    yargs
        .options({
            stale: {
                alias: 's',
                type: 'boolean' as const,
                description: 'purge stale dev versions',
                default: true,
            },
            // major: {
            //     type: 'number',
            //     description:
            //         'purge all but the specified number of major versions',
            //     default: Infinity,
            //     coerce: coercePurgeVersionsNum,
            // },
            // minor: {
            //     type: 'number',
            //     description:
            //         'purge all but the specified number of minor versions per major version',
            //    default: Infinity,
            //    coerce: coercePurgeVersionsNum,
            // },
            // patch: {
            //     type: 'number',
            //     description:
            //         'purge all but the specified number of patch versions per minor version',
            //    default: Infinity,
            //    coerce: coercePurgeVersionsNum,
            // },
            exclude: {
                alias: ['e'],
                type: 'string',
                array: true,
                description: 'exclude versions from being purged',
                coerce: (exclude: string[]) =>
                    exclude.map((value) => {
                        value = value.trim();
                        return (value.startsWith('"') && value.endsWith('"')) ||
                            (value.startsWith("'") && value.endsWith("'"))
                            ? [...value].slice(1, -1).join('')
                            : value;
                    }),
            },
            yes,
            ...options,
        })
        .positional('versions', {
            type: 'string',
            description: 'versions to purge',
            array: true,
        });

export async function handler<T extends Args<ReturnType<typeof builder>>>(
    args: T
): Promise<void> {
    console.debug(args);
    const pending: version[] = [];
    const options = await getOptions(args);
    const metadata = refreshMetadata(
        loadMetadata(options.out),
        options.out,
        options.versions.stable,
        options.versions.dev
    ) as refreshedMetadata;

    if (args.stale) {
        pending.push(
            ...(await getStale(
                metadata.versions,
                options.out,
                options.versions.stable,
                options.versions.dev
            ))
        );
    }

    drop(pending, (v) => shouldExclude(v, args.exclude));

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
    versions: readonly version[],
    stable: version | 'auto',
    dev: version | 'auto'
): boolean =>
    !isPinned(version, stable, dev) &&
    isDev(version, dev) &&
    versions.some((v) => isStable(v, stable) && gt(v, version, true));

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

export const isInfinite = (n: number): boolean =>
    typeof n !== 'number' || !isFinite(n) || isNaN(n) || n < 0;
export const shouldPurge = (...nums: number[]): boolean =>
    nums.some((n) => !isInfinite(n));
export const shouldExclude = (
    version: version,
    exclude: string[] = []
): boolean =>
    exclude.some((e) =>
        satisfies(version, e, { loose: true, includePrerelease: true })
    );
export const coercePurgeVersionsNum = (num: number | number[]) => {
    num = typeof num === 'number' ? num : num.at(-1) ?? Infinity;
    return shouldPurge(num) ? num : undefined;
};
