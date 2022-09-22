import { resolve } from 'node:path';

import { isSymlink } from '../src/utils';

// TODO: write tests against symbolic links!

describe('when path points to a file', () => {
    test('should return false', async () => {
        expect(await isSymlink(resolve('tsconfig.json'))).toBe(false);
    });
});

describe('when path points to a non-existant path', () => {
    test('should return false', async () => {
        expect(await isSymlink(resolve('foo.bar'))).toBe(false);
    });
});
