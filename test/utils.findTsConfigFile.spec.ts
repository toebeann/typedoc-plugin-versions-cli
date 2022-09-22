import { join, resolve } from 'node:path';
import { cwd } from 'node:process';

import { findTsConfigFile } from '../src/utils';

describe('when path = undefined', () => {
    test('should find local package tsconfig.json', () => {
        expect(findTsConfigFile()).toBe(resolve(join(cwd(), 'tsconfig.json')));
    });
});

describe('when path = "./tsconfig.json"', () => {
    test('should find local package tsconfig.json', () => {
        expect(findTsConfigFile()).toBe(resolve(join(cwd(), 'tsconfig.json')));
    });
});

describe('when path = "./foo"', () => {
    test('should throw Error', () => {
        expect.assertions(1);
        try {
            findTsConfigFile('./foo');
        } catch (e) {
            expect(e).toEqual(new Error('Path does not exist: foo'));
        }
    });
});

describe('when path = "../"', () => {
    test('should throw Error', () => {
        expect.assertions(1);
        try {
            findTsConfigFile('../');
        } catch (e) {
            expect(e).toEqual(
                new Error('Cannot find a valid tsconfig at path: ..')
            );
        }
    });
});
