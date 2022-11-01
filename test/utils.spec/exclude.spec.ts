import { describe, expect, it } from '@jest/globals';

import { exclude } from '../../src/utils';

describe('using predicate', () => {
    describe('when array = [-3, -2, -1, 0, 1, 2, 3] & predicate = (v) => v < 0)', () => {
        it('should return [0, 1, 2, 3]', () => {
            expect(exclude([-3, -2, -1, 0, 1, 2, 3], (v) => v < 0)).toEqual([
                0, 1, 2, 3,
            ]);
        });
    });
});

describe('using elements', () => {
    describe('when array = [-3, -2, -1, 0, 1, 2, 3] & elements = [-2, 3, 0]', () => {
        it('should return [-3, -1, 1, 2]', () => {
            expect(exclude([-3, -2, -1, 0, 1, 2, 3], [-2, 3, 0])).toEqual([
                -3, -1, 1, 2,
            ]);
        });
    });
});
