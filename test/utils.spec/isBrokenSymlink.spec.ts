import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { join, resolve } from 'node:path';
import { ensureSymlink, ensureDir, rm } from 'fs-extra';

import { isBrokenSymlink } from '../../src/utils';

const testDir = resolve(join('test', '.utils.isBrokenSymlink'));
beforeAll(() => ensureDir(testDir));
afterAll(() => rm(testDir, { recursive: true, force: true }));

describe('when path points to a file', () => {
    it('should return false', async () => {
        expect(await isBrokenSymlink(resolve('tsconfig.json'))).toBe(false);
    });
});

describe('when path points to a non-existant path', () => {
    it('should return false', async () => {
        expect(await isBrokenSymlink(resolve('foo.bar'))).toBe(false);
    });
});

describe('when path points to a valid symbolic link', () => {
    const src = resolve(join(testDir, 'foo'));
    const target = resolve(join(testDir, 'bar'));

    beforeAll(async () => {
        await ensureDir(src);
        await ensureSymlink(src, target, 'junction');
    });

    it('should return false', async () => {
        expect(await isBrokenSymlink(target)).toBe(false);
    });
});

describe('when path points to a broken symbolic link', () => {
    const src = resolve(join(testDir, 'foobar'));
    const target = resolve(join(testDir, 'barfoo'));

    beforeAll(async () => {
        await ensureDir(src);
        await ensureSymlink(src, target, 'junction');
        await rm(src, { recursive: true, force: true });
    });

    it('should return false', async () => {
        expect(await isBrokenSymlink(target)).toBe(true);
    });
});
