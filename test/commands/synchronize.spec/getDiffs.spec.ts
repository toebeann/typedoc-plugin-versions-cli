import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { join, resolve } from 'node:path';
import { ensureDir, rm, stat, writeFile } from 'fs-extra';
import { metadata } from 'typedoc-plugin-versions';
import { refreshedMetadata } from '../../../src';

import { getDiffs } from '../../../src/commands/synchronize';
import { each } from 'async';

const testDir = resolve(join('test', '.commands.sync.getDiffs'));
beforeAll(() => ensureDir(testDir));
afterAll(() => rm(testDir, { recursive: true, force: true }));

describe('when `out` points to an empty directory', () => {
    const dir = resolve(join(testDir, 'foo'));
    beforeAll(() => ensureDir(dir));

    describe('when metadata = {} & refreshedMetadata = { versions: [ "v1.0.0" ], stable: "v1.0.0" }', () => {
        const metadata: metadata = {};
        const refreshedMetadata: refreshedMetadata = {
            versions: ['v1.0.0'],
            stable: 'v1.0.0',
        };

        it('should complete appropriately', async () => {
            const diffs = getDiffs(dir, metadata, refreshedMetadata);
            expect(diffs).resolves.not.toThrow();

            await each(await diffs, async (diff) => {
                expect(diff.save()).resolves.not.toThrow();
            });

            expect(
                (await stat(join(dir, '.typedoc-plugin-versions'))).isFile()
            ).toBe(true);
            expect((await stat(join(dir, 'versions.js'))).isFile()).toBe(true);
            expect((await stat(join(dir, 'index.html'))).isFile()).toBe(true);
        });
    });
});

describe('when `out` points to a directory containing metadata', () => {
    const dir = resolve(join(testDir, 'bar'));
    beforeAll(async () => {
        await ensureDir(dir);
        await writeFile(join(dir, '.typedoc-plugin-versions'), 'foo');
        await writeFile(join(dir, 'versions.js'), 'foo');
        await writeFile(join(dir, 'index.html'), 'foo');
    });

    describe('when metadata = {} & refreshedMetadata = { versions: [ "v1.0.0" ], stable: "v1.0.0" }', () => {
        const metadata: metadata = {};
        const refreshedMetadata: refreshedMetadata = {
            versions: ['v1.0.0'],
            stable: 'v1.0.0',
        };

        it('should complete appropriately', async () => {
            const diffs = getDiffs(dir, metadata, refreshedMetadata);
            expect(diffs).resolves.not.toThrow();

            await each(await diffs, async (diff) => {
                expect(diff.save()).resolves.not.toThrow();
            });

            expect(
                (await stat(join(dir, '.typedoc-plugin-versions'))).isFile()
            ).toBe(true);
            expect((await stat(join(dir, 'versions.js'))).isFile()).toBe(true);
            expect((await stat(join(dir, 'index.html'))).isFile()).toBe(true);
        });
    });
});
