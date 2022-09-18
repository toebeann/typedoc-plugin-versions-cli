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
import {
    gt,
    major,
    minor,
    patch,
    RangeOptions,
    rcompare,
    satisfies,
} from 'semver';
import { Argv } from 'yargs';
import { options, yes } from './builders';
import { coerceStringArray, drop, exclude, getOptions, isDir } from '../utils';
import { Args, Options, refreshedMetadata } from '../';

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
            major: {
                type: 'number',
                description:
                    'purge all but the specified number of major versions',
                default: Infinity,
                coerce: coercePurgeVersionsNum,
            },
            minor: {
                type: 'number',
                description:
                    'purge all but the specified number of minor versions per major version',
                default: Infinity,
                coerce: coercePurgeVersionsNum,
            },
            patch: {
                type: 'number',
                description:
                    'purge all but the specified number of patch versions per minor version',
                default: Infinity,
                coerce: coercePurgeVersionsNum,
            },
            exclude: {
                alias: 'e',
                type: 'string',
                array: true,
                description: 'exclude versions from being purged',
                coerce: coerceStringArray,
            },
            prerelease: {
                alias: 'pre',
                type: 'boolean',
                default: false,
                description:
                    'include prerelease versions when evaluating ranges',
            },
            yes,
            ...options,
        })
        .positional('versions', {
            type: 'string',
            array: true,
            description: 'versions to purge',
            coerce: coerceStringArray,
        });

export async function handler<T extends Args<ReturnType<typeof builder>>>(
    args: T
): Promise<void> {
    const options = await getOptions(args);
    const metadata = refreshMetadata(
        loadMetadata(options.out),
        options.out,
        options.versions.stable,
        options.versions.dev
    ) as refreshedMetadata;
    const includePrerelease = args.prerelease;
    const versions = exclude(metadata.versions, (v) =>
        shouldExclude(v, args.exclude, {
            loose: true,
            includePrerelease,
        })
    );

    // args.versions
    const pending = getVersionsToPurge(versions, args.versions, {
        loose: true,
        includePrerelease,
    });
    drop(versions, pending);

    // args.major
    if (args.major !== undefined) {
        const purge = getMajorVersionsToPurge(versions, args.major, {
            loose: true,
            includePrerelease,
        });
        pending.push(...purge);
        drop(versions, purge);
    }

    // args.minor
    if (args.minor !== undefined) {
        const purge = getMinorVersionsToPurge(versions, args.minor, {
            loose: true,
            includePrerelease,
        });
        pending.push(...purge);
        drop(versions, purge);
    }

    // args.patch
    if (args.patch !== undefined) {
        const purge = getPatchVersionsToPurge(versions, args.patch, {
            loose: true,
            includePrerelease,
        });
        pending.push(...purge);
        drop(versions, purge);
    }

    // args.stale
    if (args.stale) {
        const purge = await getStaleVersionsToPurge(versions, options);
        pending.push(...purge);
        drop(versions, purge);
    }

    if (pending.length === 0) {
        console.log('Nothing to purge!');
        return;
    }

    console.log(
        (args.yes ? 'Purging:' : 'Pending purge:').concat(EOL).concat(
            pending
                .filter((v, i, s) => s.indexOf(v) === i)
                .sort(rcompare)
                .map(
                    (v) => `- ${relative(process.cwd(), join(options.out, v))}`
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
    exclude: string[] = [],
    options: RangeOptions = {}
): boolean => exclude.some((e) => satisfies(version, e, options));
export const coercePurgeVersionsNum = (num: number | number[]) => {
    num = typeof num === 'number' ? num : num.at(-1) ?? Infinity;
    return shouldPurge(num) ? num : undefined;
};

export const getVersionsToPurge = (
    versions: readonly version[],
    versionsToPurge: readonly string[] = [],
    options: RangeOptions = {}
): version[] => [
    ...versions.filter((version) =>
        versionsToPurge.some((v) => satisfies(version, v, options))
    ),
];

export function getMajorVersionsToPurge(
    versions: readonly version[],
    number: number,
    options: RangeOptions = {}
): version[] {
    const majorVersions = versions
        .map((v) => `${major(v)}.x.x`)
        .filter((v, i, s) => s.indexOf(v) === i)
        .slice(number);

    return versions.filter((version) =>
        majorVersions.some((v) => satisfies(version, v, options))
    );
}

export function getMinorVersionsToPurge(
    versions: readonly version[],
    number: number,
    options: RangeOptions = {}
): version[] {
    const minorVersionsByMajor = new Map<string, string[]>();
    for (const version of versions) {
        const key = `${major(version)}`;
        minorVersionsByMajor.set(key, [
            ...(minorVersionsByMajor.get(key) ?? []),
            `${key}.${minor(version)}.x`,
        ]);
    }

    const minorVersions = sliceValues(minorVersionsByMajor, number).flat();
    return versions.filter((version) =>
        minorVersions.some((v) => satisfies(version, v, options))
    );
}

export function getPatchVersionsToPurge(
    versions: readonly version[],
    number: number,
    options: RangeOptions = {}
): version[] {
    const patchVersionsByMinor = new Map<string, string[]>();
    for (const version of versions) {
        const key = `${major(version)}.${minor(version)}`;
        patchVersionsByMinor.set(key, [
            ...(patchVersionsByMinor.get(key) ?? []),
            `${key}.${patch(version)}`,
        ]);
    }

    const patchVersions = sliceValues(patchVersionsByMinor, number).flat();
    return versions.filter((version) =>
        patchVersions.some((v) => satisfies(version, v, options))
    );
}

export const getStaleVersionsToPurge = (
    versions: version[],
    options: Options
): Promise<version[]> =>
    getStale(
        versions,
        options.out,
        options.versions.stable,
        options.versions.dev
    );

export const sliceValues = (
    map: Map<string, string[]>,
    number: number
): string[][] =>
    [...map.values()].map(
        (value) =>
            value.filter((v, i, s) => s.indexOf(v) === i).slice(number) ?? []
    );
