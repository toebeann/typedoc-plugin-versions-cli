import { coerceStringArray } from '../src/utils';

describe('when array = []', () => {
    test('should return []', () => {
        expect(coerceStringArray([])).toEqual([]);
    });
});

describe('when array = ["foo", "bar"]', () => {
    test('should return ["foo", "bar"]', () => {
        expect(coerceStringArray(['foo', 'bar'])).toEqual(['foo', 'bar']);
    });
});

describe('when array = ["`foo`", `"bar"`]', () => {
    test('should return ["foo", "bar"]', () => {
        expect(coerceStringArray(['`foo`', `"bar"`])).toEqual(['foo', 'bar']);
    });
});

describe('when array = [`\'foo\'`, "bar"]', () => {
    test('should return ["foo", "bar"]', () => {
        expect(coerceStringArray([`'foo'`, 'bar'])).toEqual(['foo', 'bar']);
    });
});
