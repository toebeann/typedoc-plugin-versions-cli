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
import { readFileSync, writeFileSync } from 'fs-extra';
import { EOL } from 'os';
import { join, relative, resolve } from 'path';
import prompts from 'prompts';
import { options, yes } from './builders';
import { getOptions, isFile, isDir, unlinkBrokenSymlinks } from '../utils';
import { Args, refreshedMetadata } from '../';

export const command = ['synchronize', 'sync'];
export const description = 'synchronize metadata and symlinks';
export const builder = {
    symlinks: {
        type: 'boolean' as const,
        description: 'always synchronize symlinks',
        default: false,
    },
    yes,
    ...options,
};

export async function handler<T extends Args<typeof builder>>(
    args: T
): Promise<void> {
    const options = getOptions(args);

    const metadata = loadMetadata(options.out);
    const refreshedMetadata = refreshMetadata(
        metadata,
        options.out,
        options.versions.stable,
        options.versions.dev
    ) as refreshedMetadata;

    const packageVersion = getSemanticVersion();
    if (!isDir(resolve(join(options.out, packageVersion)))) {
        console.error(
            `Missing docs for package.json version: ${packageVersion}${EOL}Did you forget to run typedoc?`
        );
        process.exit(1);
    }

    const changes = getDiffs(options.out, metadata, refreshedMetadata);
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

        for (const change of changes) {
            console.time(change.label);
            change.save();
            console.timeEnd(change.label);
        }

        symlinks = true;
    }

    if (symlinks) {
        const symlinksLabel = 'symlinks';
        console.time(symlinksLabel);
        unlinkBrokenSymlinks(options.out);
        makeSymlinks(options.out, refreshedMetadata);
        console.timeEnd(symlinksLabel);
    }
}

export function getDiffs(
    docsPath: string,
    metadata: metadata,
    refreshedMetadata: refreshedMetadata
): {
    diff: ReturnType<typeof diff>;
    label: string;
    save: (output?: string) => void;
}[] {
    const versionsPath = resolve(join(docsPath, 'versions.js'));
    const versionsOutput = refreshVersionJs(refreshedMetadata);
    const indexPath = resolve(join(docsPath, 'index.html'));
    const indexOutput = refreshIndexHtml(refreshedMetadata);
    return [
        {
            diff: getMetadataDiff(metadata, refreshedMetadata),
            label: relative(process.cwd(), getMetadataPath(docsPath)),
            save: () => saveMetadata(refreshedMetadata, docsPath),
        },
        {
            diff: diff(
                isFile(versionsPath)
                    ? readFileSync(versionsPath, { encoding: 'utf8' })
                    : '',
                versionsOutput
            ),
            label: relative(process.cwd(), versionsPath),
            save: () => writeFileSync(versionsPath, versionsOutput),
        },
        {
            diff: diff(
                isFile(indexPath)
                    ? readFileSync(indexPath, { encoding: 'utf8' })
                    : '',
                refreshIndexHtml(refreshedMetadata)
            ),
            label: relative(process.cwd(), indexPath),
            save: () => writeFileSync(indexPath, indexOutput),
        },
    ].filter((x) => x.diff.length > 0);
}

export const getMetadataDiff = (
    left: metadata,
    right: metadata
): ReturnType<typeof diff> =>
    diff(
        JSON.stringify(left, undefined, 2).concat(EOL),
        JSON.stringify(right, undefined, 2).concat(EOL)
    );

export const refreshVersionJs = (metadata: refreshedMetadata) =>
    makeJsKeys(metadata);

export const refreshIndexHtml = (metadata: refreshedMetadata) =>
    `<meta http-equiv="refresh" content="0; url=${
        metadata.stable ? 'stable' : 'dev'
    }"/>`;

export function makeSymlinks(dir: string, metadata: refreshedMetadata): void {
    makeAliasLink('stable', dir, metadata.stable ?? metadata.dev);
    makeAliasLink('dev', dir, metadata.dev ?? metadata.stable);
    makeMinorVersionLinks(metadata.versions, dir);
}
