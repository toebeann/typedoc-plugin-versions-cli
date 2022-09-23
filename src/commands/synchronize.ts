import { EOL } from 'node:os';
import { join, relative, resolve } from 'node:path';
import process, { cwd } from 'node:process';
import { each } from 'async';
import { metadata } from 'typedoc-plugin-versions';
import {
    getMetadataPath,
    loadMetadata,
    refreshMetadata,
    saveMetadata,
    makeJsKeys,
    makeAliasLink,
    makeMinorVersionLinks,
    getSemanticVersion,
} from 'typedoc-plugin-versions/src/etc/utils';
import diff from 'cli-diff';
import { readFile, writeFile } from 'fs-extra';
import prompts from 'prompts';
import { commonOptions, yes } from './builders';
import { getOptions, isFile, isDir, unlinkBrokenSymlinks } from '../utils';
import { Args, refreshedMetadata } from '../';

/**
 * The `synchronize` command string syntax.
 */
export const command = ['synchronize', 'sync'];
/**
 * Description of the `synchronize` command.
 */
export const description = 'synchronize metadata and symlinks';

/**
 * {@link https://yargs.js.org/docs yargs} builder for the `purge` command.
 */
export const builder = {
    symlinks: {
        type: 'boolean' as const,
        description: 'always synchronize symlinks',
        default: false,
    },
    yes,
    ...commonOptions,
};

/**
 * {@link https://yargs.js.org/docs yargs} handler for the `synchronize` command.
 * @param {T} args The {@link @types/yargs!yargs.Argv argv} object parsed from the command line arguments.
 * @typeParam T The type of the parsed {@link @types/yargs!yargs.Argv argv} object.
 */
export async function handler<T extends Args<typeof builder>>(
    args: T
): Promise<void> {
    const options = await getOptions(args);

    const metadata = loadMetadata(options.out);
    const refreshedMetadata = refreshMetadata(
        metadata,
        options.out,
        options.versions.stable,
        options.versions.dev
    ) as refreshedMetadata;

    const packageVersion = getSemanticVersion();
    if (!(await isDir(resolve(join(options.out, packageVersion))))) {
        console.error(
            `Missing docs for package.json version: ${packageVersion}${EOL}Did you forget to run typedoc?`
        );
        process.exitCode = 1;
        return;
    }

    const changes = await getDiffs(options.out, metadata, refreshedMetadata);
    if (!args.symlinks && changes.length === 0) {
        console.log('Already up-to-date.');
        return;
    } else if (changes.length > 0) {
        console.log(
            (args.yes ? 'Synchonizing:' : 'Pending synchronization:')
                .concat(`${EOL}${EOL}`)
                .concat(
                    changes
                        .map((change) => `${change.label}:${EOL}${change.diff}`)
                        .join(EOL)
                )
        );
    }

    let symlinks = args.symlinks;
    if (
        changes.length > 0 &&
        (args.yes ||
            (
                await prompts({
                    name: 'confirm',
                    type: 'confirm',
                    initial: false,
                    message: 'Apply pending synchronizations?',
                })
            ).confirm)
    ) {
        if (!args.yes) console.log('');

        await each(changes, async (change) => {
            console.time(change.label);
            await change.save();
            console.timeEnd(change.label);
        });

        symlinks = true;
    }

    if (symlinks) {
        const symlinksLabel = 'symlinks';
        console.time(symlinksLabel);
        makeSymlinks(options.out, refreshedMetadata);
        await unlinkBrokenSymlinks(options.out);
        console.timeEnd(symlinksLabel);
    }
}

/**
 * An interface for diffs with a label and a callback for saving the changes.
 * @internal
 * Intended for internal use; may not be exported in future.
 */
export interface labelledDiff {
    /**
     * The diff generated by {@link cli-diff!diff cli-diff}.
     */
    diff: ReturnType<typeof diff>;
    /**
     * The label for the diff.
     */
    label: string;
    /**
     * A callback which saves the changes.
     */
    save: () => Promise<void>;
}

/**
 * Generates {@link cli-diff!diff diffs} for all relevant {@link https://citkane.github.io/typedoc-plugin-versions typedoc-plugin-versions}
 * metadata files between their current state and refreshed state, labelled by relative file path and generates callbacks to save the changes to disk.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {string} out The path to the user's typedoc `out` folder.
 * @param {metadata} metadata The {@link https://citkane.github.io/typedoc-plugin-versions typedoc-plugin-versions}
 * version {@link typedoc-plugin-versions!metadata metadata} currently saved to disk.
 * @param {refreshedMetadata} refreshedMetadata Version {@link typedoc-plugin-versions!metadata metadata} freshly generated by
 * {@link https://citkane.github.io/typedoc-plugin-versions typedoc-plugin-versions}, for comparison.
 * @returns {Promise<labelledDiff[]>} The generated {@link labelledDiff labelled diffs}.
 */
export async function getDiffs(
    out: string,
    metadata: metadata,
    refreshedMetadata: refreshedMetadata
): Promise<labelledDiff[]> {
    const versionsPath = resolve(join(out, 'versions.js'));
    const versionsOutput = refreshVersionJs(refreshedMetadata);
    const indexPath = resolve(join(out, 'index.html'));
    const indexOutput = refreshIndexHtml(refreshedMetadata);
    return [
        {
            diff: getMetadataDiff(metadata, refreshedMetadata),
            label: relative(cwd(), getMetadataPath(out)),
            save: async () => saveMetadata(refreshedMetadata, out),
        },
        {
            diff: diff(
                (await isFile(versionsPath))
                    ? await readFile(versionsPath, { encoding: 'utf8' })
                    : '',
                versionsOutput
            ),
            label: relative(cwd(), versionsPath),
            save: () => writeFile(versionsPath, versionsOutput),
        },
        {
            diff: diff(
                (await isFile(indexPath))
                    ? await readFile(indexPath, { encoding: 'utf8' })
                    : '',
                refreshIndexHtml(refreshedMetadata)
            ),
            label: relative(cwd(), indexPath),
            save: () => writeFile(indexPath, indexOutput),
        },
    ].filter((x) => x.diff.length > 0);
}

/**
 * Generates a {@link cli-diff!diff diff} between two {@link typedoc-plugin-versions!metadata metadata} objects.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {metadata} left The left side of the diff comparison.
 * @param {metadata} right The right side of the diff comparison.
 * @returns {ReturnType<typeof diff>} The generated {@link cli-diff!diff diff}.
 */
export const getMetadataDiff = (
    left: metadata,
    right: metadata
): ReturnType<typeof diff> =>
    diff(
        JSON.stringify(left, undefined, 2).concat(EOL),
        JSON.stringify(right, undefined, 2).concat(EOL)
    );

/**
 * Generates a {@link https://citkane.github.io/typedoc-plugin-versions typedoc-plugin-versions} `versions.js` string.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {metadata} metadata The {@link typedoc-plugin-versions!metadata metadata} object to use for generation.
 * @returns {ReturnType<typeof makeJsKeys>} The generated `versions.js` string.
 */
export const refreshVersionJs = (
    metadata: refreshedMetadata
): ReturnType<typeof makeJsKeys> => makeJsKeys(metadata);

/**
 * Generates a {@link https://citkane.github.io/typedoc-plugin-versions typedoc-plugin-versions} `index.html` string.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {metadata} metadata The {@link typedoc-plugin-versions!metadata metadata} object to use for generation.
 * @returns {string} The generated `index.html` string.
 */
export const refreshIndexHtml = (metadata: refreshedMetadata): string =>
    `<meta http-equiv="refresh" content="0; url=${metadata.stable ? 'stable' : 'dev'
    }"/>`;

/**
 * Generates all necessary symbolic links for {@link https://citkane.github.io/typedoc-plugin-versions typedoc-plugin-versions}.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @param {string} out The path to the user's typedoc `out` folder.
 * @param {metadata} metadata The {@link typedoc-plugin-versions!metadata metadata} object to use for generation.
 */
export function makeSymlinks(out: string, metadata: refreshedMetadata): void {
    makeAliasLink('stable', out, metadata.stable ?? metadata.dev);
    makeAliasLink('dev', out, metadata.dev ?? metadata.stable);
    makeMinorVersionLinks(metadata.versions, out);
}
