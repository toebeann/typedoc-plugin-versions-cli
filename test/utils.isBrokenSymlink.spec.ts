import { resolve } from 'node:path';

import { isBrokenSymlink } from '../src/utils';

// TODO: write tests against symbolic links!

describe('when path points to a file', () => {
    test('should return false', async () => {
        expect(await isBrokenSymlink(resolve('tsconfig.json'))).toBe(false);
    });
});

describe('when path points to a non-existant path', () => {
    test('should return false', async () => {
        expect(await isBrokenSymlink(resolve('foo.bar'))).toBe(false);
    });
});
