import { describe, expect, it } from '@jest/globals';

import { sliceValues } from '../../../src/commands/purge';

describe('when map = { foo: [ "1", "2", "1" ], bar: [ "4", "3", "2" ] }', () => {
    const map = new Map(
        Object.entries({ foo: ['1', '2', '1'], bar: ['4', '3', '2'] })
    );

    describe('when index = 0', () => {
        const index = 0;

        it('should return: [ [ "1", "2" ], [ "4", "3", "2" ] ]', () => {
            expect(sliceValues(map, index)).toEqual([
                ['1', '2'],
                ['4', '3', '2'],
            ]);
        });
    });

    describe('when index = 2', () => {
        const index = 2;

        it('should return: [ [], [ "2" ] ]', () => {
            expect(sliceValues(map, index)).toEqual([[], ['2']]);
        });
    });
});
