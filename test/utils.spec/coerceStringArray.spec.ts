import { describe, expect, it } from '@jest/globals';

import { coerceStringArray } from '../../src/utils';

describe('when array = []', () => {
    it('should return []', () => {
        expect(coerceStringArray([])).toEqual([]);
    });
});

describe('when array = ["foo", "bar"]', () => {
    it('should return ["foo", "bar"]', () => {
        expect(coerceStringArray(['foo', 'bar'])).toEqual(['foo', 'bar']);
    });
});

describe('when array = ["`foo`", `"bar"`]', () => {
    it('should return ["foo", "bar"]', () => {
        expect(coerceStringArray(['`foo`', `"bar"`])).toEqual(['foo', 'bar']);
    });
});

describe('when array = [`\'foo\'`, "bar"]', () => {
    it('should return ["foo", "bar"]', () => {
        expect(coerceStringArray([`'foo'`, 'bar'])).toEqual(['foo', 'bar']);
    });
});
