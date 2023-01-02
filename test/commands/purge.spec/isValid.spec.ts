import { describe, expect, it } from '@jest/globals';

import { isValid } from '../../../src/commands/purge';

describe('when number = undefined', () => {
    it('should return false', () => {
        // @ts-expect-error: Intentionally passing undefined to test the typeof check
        expect(isValid()).toBe(false);
    });
});

describe('when number is infinite', () => {
    it('should return false', () => {
        expect(isValid(+Infinity)).toBe(false);
        expect(isValid(-Infinity)).toBe(false);
    });
});

describe('when number is NaN', () => {
    it('should return false', () => {
        expect(isValid(NaN)).toBe(false);
    });
});

describe('when number < 0', () => {
    it('should return false', () => {
        expect(isValid(-1)).toBe(false);
        expect(isValid(-0.0000000001)).toBe(false);
    });
});

describe('when 0 <= number < Infinity', () => {
    it('should return true', () => {
        expect(isValid(0)).toBe(true);
        expect(isValid(100.32)).toBe(true);
        expect(isValid(3)).toBe(true);
    });
});
