import { EOL } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { cwd } from 'node:process';
import { each, filter } from 'async';
import { version } from 'typedoc-plugin-versions';
import {
    loadMetadata,
    refreshMetadata,
    getSemanticVersion,
    getVersionAlias,
} from 'typedoc-plugin-versions/src/etc/utils';
import { rm } from 'fs-extra';
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
import { commonOptions, yes } from './builders';
import { coerceStringArray, drop, exclude, getOptions, isDir } from '../utils';
import { Args, Options, refreshedMetadata } from '../';

/**
 * The `purge` command string syntax.
 */
export const command = ['purge [versions..]'];
/**
 * Description of the `purge` command.
 */
export const description = 'purge old doc builds';

/**
 * {@link https://yargs.js.org/docs yargs} builder for the `purge` command.
 * @param {Argv} yargs A yargs instance used for building the command-specific options.
 * @returns The yargs instance.
 */
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
            ...commonOptions,
        })
        .positional('versions', {
            type: 'string',
            array: true,
            description: 'versions to purge',
            coerce: coerceStringArray,
        });

/**
 * {@link https://yargs.js.org/docs yargs} handler for the `purge` command.
 * @param {T} args The {@link @types/yargs!yargs.Argv argv} object parsed from the command line arguments.
 * @typeParam T The type of the parsed {@link @types/yargs!yargs.Argv argv} object.
 */
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
    if (isValid(args.major)) {
        const purge = getMajorVersionsToPurge(versions, args.major, {
            loose: true,
            includePrerelease,
        });
        pending.push(...purge);
        drop(versions, purge);
    }

    // args.minor
    if (isValid(args.minor)) {
        const purge = getMinorVersionsToPurge(versions, args.minor, {
            loose: true,
            includePrerelease,
        });
        pending.push(...purge);
        drop(versions, purge);
    }

    // args.patch
    if (isValid(args.patch)) {
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
                .map((v) => `- ${relative(cwd(), join(options.out, v))}`)
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

/**
 * Determines whether a given {@link typedoc-plugin-versions!version version} is considered `stable` by
 * {@link https://citkane.github.io/typedoc-plugin-versions typedoc-plugin-versions}.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {version} version The version.
 * @param {version | 'auto'} stable The {@link typedoc-plugin-versions!versionsOptions.stable versions.stable} option from the typedoc config.
 * @returns {boolean} Whether the version is considered `stable`.
 */
export const isStable = (version: version, stable: version | 'auto'): boolean =>
    getVersionAlias(version, stable) === 'stable';

/**
 * Determines whether a given {@link typedoc-plugin-versions!version version} is considered `dev` by
 * {@link https://citkane.github.io/typedoc-plugin-versions typedoc-plugin-versions}.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {version} version The version.
 * @param {version | 'auto'} dev The {@link typedoc-plugin-versions!versionsOptions.dev versions.dev} option from the typedoc config.
 * @returns {boolean} Whether the version is considered `dev`.
 */
export const isDev = (version: version, dev: version | 'auto'): boolean =>
    getVersionAlias(version, undefined, dev) === 'dev';

/**
 * Determines whether a given {@link typedoc-plugin-versions!version version} is "pinned" in the user's
 * {@link https://citkane.github.io/typedoc-plugin-versions typedoc-plugin-versions} configuration, i.e. marked as `stable` or `dev`.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {version} version The version.
 * @param {version | 'auto'} stable The {@link typedoc-plugin-versions!versionsOptions.stable versions.stable} option from the typedoc config.
 * @param {version | 'auto'} dev The {@link typedoc-plugin-versions!versionsOptions.dev versions.dev} option from the typedoc config.
 * @returns {boolean} Whether the version is pinned.
 */
export const isPinned = (
    version: version,
    stable: version | 'auto',
    dev: version | 'auto'
): boolean =>
    (stable !== 'auto' &&
        getSemanticVersion(version) === getSemanticVersion(stable)) ||
    (dev !== 'auto' && getSemanticVersion(version) === getSemanticVersion(dev));

/**
 * Determines whether a given {@link typedoc-plugin-versions!version version} is "stale," e.g. prerelease versions
 * that have been superseded by non-prerelease versions.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {version} version The version.
 * @param {readonly version[]} versions An array of relevant {@link typedoc-plugin-versions!version versions} for reference.
 * @param {version | 'auto'} stable The {@link typedoc-plugin-versions!versionsOptions.stable versions.stable} option from the typedoc config.
 * @param {version | 'auto'} dev The {@link typedoc-plugin-versions!versionsOptions.dev versions.dev} option from the typedoc config.
 * @returns {boolean} Whether the version is stale.
 */
export const isStale = (
    version: version,
    versions: readonly version[],
    stable: version | 'auto',
    dev: version | 'auto'
): boolean =>
    !isPinned(version, stable, dev) &&
    isDev(version, dev) &&
    versions.some((v) => isStable(v, stable) && gt(v, version, true));

/**
 * Determines whether a number passed is valid, i.e. is finite, non-NaN and greater than or equal to 0.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {number} number The number.
 * @returns Whether the number is valid.
 */
export const isValid = (number: number): boolean =>
    typeof number === 'number' &&
    isFinite(number) &&
    !isNaN(number) &&
    number >= 0;

/**
 * Coerces a passed argument to a number. If the argument is an array of numbers, coerces only the last element.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {number | number[]} number
 * @returns {number} The coerced number, or {@link !Infinity `Infinity`} if the number was invalid.
 */
export const coercePurgeVersionsNum = (number: number | number[]): number =>
    typeof number === 'number'
        ? isValid(number)
            ? number
            : Infinity
        : coercePurgeVersionsNum(number.at(-1) ?? Infinity);

/**
 * Determines whether a given {@link typedoc-plugin-versions!version version} should be excluded from purging based on
 * the given {@link http://yargs.js.org yargs} `exclude` argument.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {version} version The version.
 * @param {string[]} [exclude=[]] The {@link http://yargs.js.org yargs} `exclude` argument.
 * @param {RangeOptions} [options=\{\}] Options to pass to {@link https://github.com/npm/node-semver#readme semver.satisfies}.
 * @returns {boolean} Whether the version should be excluded from purging.
 */
export const shouldExclude = (
    version: version,
    exclude: string[] = [],
    options: RangeOptions = {}
): boolean => exclude.some((e) => satisfies(version, e, options));

/**
 * Filters an array of {@link typedoc-plugin-versions!version versions} to those which should be purged,
 * based on whether they match a given array of semantic version ranges.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {readonly version[]} versions The versions to filter.
 * @param {readonly string[]} [versionsToPurge=[]] The semantic version ranges to match.
 * @param {RangeOptions} [options=\{\}] Options to pass to {@link https://github.com/npm/node-semver#readme semver.satisfies}.
 * @returns {version[]} The filtered array consisting only of {@link typedoc-plugin-versions!version versions} which should be purged.
 */
export const getVersionsToPurge = (
    versions: readonly version[],
    versionsToPurge: readonly string[] = [],
    options: RangeOptions = {}
): version[] => [
    ...versions.filter((version) =>
        versionsToPurge.some((v) => satisfies(version, v, options))
    ),
];

/**
 * Filters an array of {@link typedoc-plugin-versions!version versions} to those which should be purged,
 * based on the given {@link http://yargs.js.org yargs} `major` argument.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {readonly version[]} versions The versions to filter.
 * @param {number} number The {@link http://yargs.js.org yargs} `major` argument.
 * @param {RangeOptions} [options=\{\}] Options to pass to {@link https://github.com/npm/node-semver#readme semver.satisfies}.
 * @returns {version[]} The filtered array consisting only of {@link typedoc-plugin-versions!version versions} which should be purged.
 */
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

/**
 * Filters an array of {@link typedoc-plugin-versions!version versions} to those which should be purged,
 * based on the given {@link http://yargs.js.org yargs} `minor` argument.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {readonly version[]} versions The versions to filter.
 * @param {number} number The {@link http://yargs.js.org yargs} `minor` argument.
 * @param {RangeOptions} [options=\{\}] Options to pass to {@link https://github.com/npm/node-semver#readme semver.satisfies}.
 * @returns {version[]} The filtered array consisting only of {@link typedoc-plugin-versions!version versions} which should be purged.
 */
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

/**
 * Filters an array of {@link typedoc-plugin-versions!version versions} to those which should be purged,
 * based on the given {@link http://yargs.js.org yargs} `patch` argument.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {readonly version[]} versions The versions to filter.
 * @param {number} number The {@link http://yargs.js.org yargs} `patch` argument.
 * @param {RangeOptions} [options=\{\}] Options to pass to {@link https://github.com/npm/node-semver#readme semver.satisfies}.
 * @returns {version[]} The filtered array consisting only of {@link typedoc-plugin-versions!version versions} which should be purged.
 */
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

/**
 * Filters an array of {@link typedoc-plugin-versions!version versions} to those which should be purged,
 * based on whether or not {@link isStale they are stale}.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {readonly version[]} versions The versions to filter.
 * @param {Options} options The parsed {@link index!Options Options} object.
 * @returns {version[]} The filtered array consisting only of {@link typedoc-plugin-versions!version versions} which should be purged.
 */
export const getStaleVersionsToPurge = (
    versions: version[],
    options: Options
): Promise<version[]> =>
    filter(
        versions,
        async (version) =>
            (await isDir(resolve(join(options.out, version)))) &&
            isStale(
                version,
                versions,
                options.versions.stable,
                options.versions.dev
            )
    );

/**
 * Parses a given {@link !Map Map}, filtering its values into unique values only, and returns them sliced by the given index.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {Map<K, V>} map The map.
 * @param {number} index The index.
 * @returns {V[][]} The map of values as an array.
 * @typeParam K The type of the {@link !Map Map}'s keys.
 * @typeParam V The type of the {@link !Map Map}'s values.
 */
export const sliceValues = <K, V>(map: Map<K, V[]>, index: number): V[][] =>
    [...map.values()].map((value) =>
        value.filter((v, i, s) => s.indexOf(v) === i).slice(index)
    );
