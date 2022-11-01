import { describe, expect, it } from '@jest/globals';

import { shouldExclude } from '../../../src/commands/purge';

describe('when exclude is empty', () => {
    it('should return false', () => {
        expect(shouldExclude('v1.0.0')).toBe(false);
    });
});

describe('when version is an exact match for an element of exclude', () => {
    it('should return true', () => {
        expect(
            shouldExclude('v1.0.0', ['v1.0.0'], { includePrerelease: true })
        ).toBe(true);
        expect(
            shouldExclude('v1.0.0', ['v2.0.0', '1.0.0'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v1.0.0', ['v1.0.0', 'v2.0.0'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v2.0.0', ['v1.0.0', 'v2.0.0'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v2.0.0', ['v2.0.0', 'v1.0.0'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v2.0.0', ['2.0.0'], { includePrerelease: true })
        ).toBe(true);
    });
});

describe('when exclude includes a minor version which matches', () => {
    it('should return true', () => {
        expect(
            shouldExclude('v1.0.0', ['v1.0.x'], { includePrerelease: true })
        ).toBe(true);
        expect(
            shouldExclude('v1.0.0', ['v2.0.0', '1.0.x'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v1.0.0', ['v1.0.x', 'v2.0.0'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v2.0.0', ['v1.0.0', 'v2.0.x'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v2.0.0', ['v2.0.x', 'v1.0.0'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v2.0.0', ['2.0.x'], { includePrerelease: true })
        ).toBe(true);
    });
});

describe('when exclude includes a major version which matches', () => {
    it('should return true', () => {
        expect(
            shouldExclude('v1.0.0', ['v1.x.x'], { includePrerelease: true })
        ).toBe(true);
        expect(
            shouldExclude('v1.0.0', ['v2.0.0', '1.x.x'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v1.0.0', ['v1.x', 'v2.0.0'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v2.0.0', ['v1.0.0', 'v2.x'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v2.0.0', ['v2.x.x', 'v1.0.0'], {
                includePrerelease: true,
            })
        ).toBe(true);
        expect(
            shouldExclude('v2.0.0', ['2.x'], { includePrerelease: true })
        ).toBe(true);
    });
});
