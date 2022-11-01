import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { join, resolve } from 'node:path';
import { ensureSymlink, ensureDir, rm, stat, lstat, readlink } from 'fs-extra';

import { unlinkBrokenSymlinks } from '../../src/utils';

const testDir = resolve(join('test', '.utils.unlinkBrokenSymlinks'));
beforeAll(() => ensureDir(testDir));
afterAll(() => rm(testDir, { recursive: true, force: true }));

describe('when dir points to a file', () => {
    it('should throw error', async () => {
        try {
            await unlinkBrokenSymlinks(resolve('tsconfig.json'));
            fail('must throw');
        } catch (e) {
            expect(e).toHaveProperty('code', 'ENOTDIR');
        }
    });
});

describe('when dir points to an empty directory', () => {
    const dir = resolve(join(testDir, 'foo'));
    beforeAll(() => ensureDir(dir));

    it('should complete normally', () => {
        expect(unlinkBrokenSymlinks(testDir)).resolves.not.toThrow();
    });
});

describe('when dir points to a directory containing valid symlinks', () => {
    const dir = resolve(join(testDir, 'bar'));
    const src = resolve(join(dir, 'src'));
    const target = resolve(join(dir, 'target'));

    beforeAll(async () => {
        await ensureDir(src);
        await ensureSymlink(src, target, 'junction');
    });

    it('should complete normally without deleting any symlinks', async () => {
        await unlinkBrokenSymlinks(dir);
        expect((await stat(dir)).isDirectory()).toBe(true);
        expect((await stat(src)).isDirectory()).toBe(true);
        expect((await lstat(target)).isSymbolicLink()).toBe(true);
        expect(resolve(await readlink(target))).toBe(src);
    });
});

describe('when dir points to a directory containing invalid symlinks', () => {
    const dir = resolve(join(testDir, 'foobar'));
    const src = resolve(join(dir, 'src'));
    const target = resolve(join(dir, 'target'));

    beforeAll(async () => {
        await ensureDir(src);
        await ensureSymlink(src, target, 'junction');
        await rm(src, { recursive: true, force: true });
    });

    it('should complete and to have removed the broken symlink', async () => {
        await unlinkBrokenSymlinks(dir);
        expect((await stat(dir)).isDirectory()).toBe(true);
        expect(stat(src)).rejects.toThrow();
        expect(lstat(target)).rejects.toThrow();
    });
});
