import { join, resolve } from 'node:path';
import { each } from 'async';
import { ensureDir, rm, stat, lstat, readlink, pathExists } from 'fs-extra';
import { refreshedMetadata } from '../../../src';

import { makeSymlinks } from '../../../src/commands/synchronize';

const testDir = resolve(join('test', '.commands.sync.makeSymlinks'));
beforeAll(() => ensureDir(testDir));
afterAll(() => rm(testDir, { recursive: true, force: true }));

describe('when metadata = { versions: [ "v1.0.0" ], stable: "v1.0.0" }', () => {
    const dir = resolve(join(testDir, 'foo'));
    const metadata: refreshedMetadata = {
        versions: ['v1.0.0'],
        stable: 'v1.0.0',
    };

    beforeAll(() =>
        each(
            metadata.versions,
            async (v) => await ensureDir(resolve(join(dir, v)))
        )
    );

    test('should create symlinks appropriately', async () => {
        makeSymlinks(dir, metadata);
        expect((await stat(dir)).isDirectory()).toBe(true);

        for (const version of metadata.versions) {
            expect((await stat(join(dir, version))).isDirectory()).toBe(true);
        }

        for (const symlink of ['stable', 'dev', 'v1.0']) {
            const path = join(dir, symlink);
            expect((await lstat(path)).isSymbolicLink()).toBe(true);
            expect(await pathExists(await readlink(path))).toBe(true);
        }
    });
});

describe('when metadata = { versions: [ "v0.1.0" ], dev: "v0.1.0" }', () => {
    const dir = resolve(join(testDir, 'bar'));
    const metadata: refreshedMetadata = {
        versions: ['v0.1.0'],
        dev: 'v0.1.0',
    };

    beforeAll(() =>
        each(
            metadata.versions,
            async (v) => await ensureDir(resolve(join(dir, v)))
        )
    );

    test('should create symlinks appropriately', async () => {
        makeSymlinks(dir, metadata);
        expect((await stat(dir)).isDirectory()).toBe(true);

        for (const version of metadata.versions) {
            expect((await stat(join(dir, version))).isDirectory()).toBe(true);
        }

        for (const symlink of ['stable', 'dev', 'v0.1']) {
            const path = join(dir, symlink);
            expect((await lstat(path)).isSymbolicLink()).toBe(true);
            expect(await pathExists(await readlink(path))).toBe(true);
        }
    });
});
