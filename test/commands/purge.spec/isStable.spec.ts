import { describe, expect, it } from '@jest/globals';

import { isStable } from '../../../src/commands/purge';

describe('when version = "v1.0.0"', () => {
    const version = 'v1.0.0';

    describe('when stable = "v1.0.0"', () => {
        const stable = 'v1.0.0';

        it('should return true', () => {
            expect(isStable(version, stable)).toBe(true);
        });
    });

    describe('when stable = "v2.0.0"', () => {
        const stable = 'v2.0.0';

        it('should return true', () => {
            expect(isStable(version, stable)).toBe(true);
        });
    });

    describe('when stable = "v0.1.0"', () => {
        const stable = 'v0.1.0';

        it('should return true', () => {
            expect(isStable(version, stable)).toBe(true);
        });
    });

    describe('when stable = "auto"', () => {
        const stable = 'auto';

        it('should return true', () => {
            expect(isStable(version, stable)).toBe(true);
        });
    });
});

describe('when version = "v0.1.0"', () => {
    const version = 'v0.1.0';

    describe('when stable = "v1.0.0"', () => {
        const stable = 'v1.0.0';

        it('should return false', () => {
            expect(isStable(version, stable)).toBe(false);
        });
    });

    describe('when stable = "v2.0.0"', () => {
        const stable = 'v2.0.0';

        it('should return false', () => {
            expect(isStable(version, stable)).toBe(false);
        });
    });

    describe('when stable = "v0.1.0"', () => {
        const stable = 'v0.1.0';

        it('should return true', () => {
            expect(isStable(version, stable)).toBe(true);
        });
    });

    describe('when stable = "auto"', () => {
        const stable = 'auto';

        it('should return false', () => {
            expect(isStable(version, stable)).toBe(false);
        });
    });
});
