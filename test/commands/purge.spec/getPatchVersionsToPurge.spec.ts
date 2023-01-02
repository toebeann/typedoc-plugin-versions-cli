import { describe, expect, it } from '@jest/globals';

import { getPatchVersionsToPurge } from '../../../src/commands/purge';

describe('when versions = []', () => {
    it('should return []', () => {
        expect(getPatchVersionsToPurge([], 0)).toEqual([]);
        expect(getPatchVersionsToPurge([], 5)).toEqual([]);
    });
});

describe('when versions = [ "v2.1.0", "v2.0.1", "v2.0.0", "v1.2.2", "v1.2.1", "v1.2.0", "v1.1.0", "v1.0.0", "v0.1.0" ]', () => {
    const versions = [
        'v2.1.0',
        'v2.0.1',
        'v2.0.0',
        'v1.2.2',
        'v1.2.1',
        'v1.2.0',
        'v1.1.0',
        'v1.0.0',
        'v0.1.0',
    ] as const;

    describe('when number = 0', () => {
        const number = 0;

        it('should return [ "v2.1.0", "v2.0.1", "v2.0.0", "v1.2.2", "v1.2.1", "v1.2.0", "v1.1.0", "v1.0.0", "v0.1.0" ]', () => {
            expect(
                getPatchVersionsToPurge(versions, number, {
                    includePrerelease: true,
                })
            ).toEqual([
                'v2.1.0',
                'v2.0.1',
                'v2.0.0',
                'v1.2.2',
                'v1.2.1',
                'v1.2.0',
                'v1.1.0',
                'v1.0.0',
                'v0.1.0',
            ]);
        });
    });

    describe('when number = 1', () => {
        const number = 1;

        it('should return [ "v2.0.0", "v1.2.1", "v1.2.0" ]', () => {
            expect(
                getPatchVersionsToPurge(versions, number, {
                    includePrerelease: true,
                })
            ).toEqual(['v2.0.0', 'v1.2.1', 'v1.2.0']);
        });
    });

    describe('when number = 2', () => {
        const number = 2;

        it('should return [ "v1.2.0" ]', () => {
            expect(
                getPatchVersionsToPurge(versions, number, {
                    includePrerelease: true,
                })
            ).toEqual(['v1.2.0']);
        });
    });

    describe('when number >= 3', () => {
        const number = 3;

        it('should return []', () => {
            expect(
                getPatchVersionsToPurge(versions, number, {
                    includePrerelease: true,
                })
            ).toEqual([]);
        });
    });
});
