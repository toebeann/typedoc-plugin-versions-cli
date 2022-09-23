import { join, resolve } from 'node:path';
import { cwd } from 'node:process';

import { findFile } from '../../src/utils';

describe('when path = undefined & filePaths = undefined', () => {
    test('should throw Error', async () => {
        try {
            await findFile();
            fail('must throw');
        } catch (e) {
            expect(e).toEqual(
                new Error(
                    'filePaths must contain at least one file path when path is a directory!'
                )
            );
        }
    });
});

describe('when path = undefined & filePaths = ["typedoc.json"]', () => {
    test('should find local package typedoc.json', async () => {
        expect(await findFile(undefined, ['typedoc.json'])).toBe(
            resolve(join(cwd(), 'typedoc.json'))
        );
    });
});

describe('when path = undefined & filePaths = ["foo.bar", "typedoc.json"]', () => {
    test('should find local package typedoc.json', async () => {
        expect(await findFile(undefined, ['foo.bar', 'typedoc.json'])).toBe(
            resolve(join(cwd(), 'typedoc.json'))
        );
    });
});

describe('when path = undefined & filePaths = ["foo.bar"]', () => {
    test('should throw Error', async () => {
        try {
            await findFile(undefined, ['foo.bar']);
            fail('must throw');
        } catch (e) {
            expect(e).toEqual(new Error('A matching file could not be found.'));
        }
    });
});

describe('when path = "typedoc.json"', () => {
    test('should find local package typedoc.json', async () => {
        expect(await findFile('typedoc.json')).toBe(
            resolve(join(cwd(), 'typedoc.json'))
        );
    });
});

describe('when path = "foo.bar"', () => {
    test('should throw Error', async () => {
        try {
            await findFile('foo.bar');
            fail('must throw');
        } catch (e) {
            expect(e).toEqual(new Error('Path does not exist: foo.bar'));
        }
    });
});
