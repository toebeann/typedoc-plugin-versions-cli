import { drop } from '../src/utils';

describe('using predicate', () => {
    describe('when array = [-3, -2, -1, 0, 1, 2, 3] & predicate = (v) => v < 0)', () => {
        test('should return [-3, -2, -1]', () => {
            expect(drop([-3, -2, -1, 0, 1, 2, 3], (v) => v < 0)).toEqual([
                -3, -2, -1,
            ]);
        });

        test('after the operation, the array should equal [0, 1, 2, 3]', () => {
            const arr = [-3, -2, -1, 0, 1, 2, 3];
            expect(drop(arr, (v) => v < 0)).toEqual([-3, -2, -1]);
            expect(arr).toEqual([0, 1, 2, 3]);
        });
    });
});

describe('using elements', () => {
    describe('when array = [-3, -2, -1, 0, 1, 2, 3] & elements = [-2, 3, 0]', () => {
        test('should return [-2, 0, 3]', () => {
            expect(drop([-3, -2, -1, 0, 1, 2, 3], [-2, 3, 0])).toEqual([
                -2, 0, 3,
            ]);
        });

        test('after the operation, the array should equal [-3, -1, 1, 2]', () => {
            const arr = [-3, -2, -1, 0, 1, 2, 3];
            expect(drop(arr, [-2, 3, 0])).toEqual([-2, 0, 3]);
            expect(arr).toEqual([-3, -1, 1, 2]);
        });
    });
});
