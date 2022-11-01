import { describe, expect, it } from '@jest/globals';

import { coercePurgeVersionsNum } from '../../../src/commands/purge';

describe('when passing a number', () => {
    describe('when number is valid', () => {
        it('should return the same number', () => {
            expect(coercePurgeVersionsNum(5)).toBe(5);
            expect(coercePurgeVersionsNum(0)).toBe(0);
            expect(coercePurgeVersionsNum(100.25)).toBe(100.25);
        });
    });

    describe('when number is invalid', () => {
        it('should return Infinity', () => {
            expect(coercePurgeVersionsNum(-1)).toBe(Infinity);
            expect(coercePurgeVersionsNum(-0.00001)).toBe(Infinity);
            expect(coercePurgeVersionsNum(Infinity)).toBe(Infinity);
            expect(coercePurgeVersionsNum(-Infinity)).toBe(Infinity);
            expect(coercePurgeVersionsNum(NaN)).toBe(Infinity);
        });
    });
});

describe('when passing an array of numbers', () => {
    it('should only return the last number in the array, coerced', () => {
        expect(coercePurgeVersionsNum([5])).toBe(5);
        expect(coercePurgeVersionsNum([4, 5])).toBe(5);
        expect(coercePurgeVersionsNum([Infinity, 5])).toBe(5);
        expect(coercePurgeVersionsNum([NaN, 5])).toBe(5);
        expect(coercePurgeVersionsNum([3, 5, NaN])).toBe(Infinity);
        expect(coercePurgeVersionsNum([3, 5, Infinity])).toBe(Infinity);
        expect(coercePurgeVersionsNum([3, 5, -Infinity])).toBe(Infinity);
        expect(coercePurgeVersionsNum([3, 5, -1])).toBe(Infinity);
    });
});

describe('when passing an empty array', () => {
    it('should return Infinity', () => {
        expect(coercePurgeVersionsNum([])).toBe(Infinity);
    });
});
