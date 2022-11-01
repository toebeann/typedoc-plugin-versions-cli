import { describe, expect, it } from '@jest/globals';

import { getVersionsToPurge } from '../../../src/commands/purge';

describe('when versionsToPurge is empty', () => {
    it('should return []', () => {
        expect(getVersionsToPurge([])).toEqual([]);
        expect(getVersionsToPurge(['v1.0.0'])).toEqual([]);
        expect(getVersionsToPurge(['v1.0.0', 'v2.0.0'])).toEqual([]);
    });
});

describe('when versionsToPurge contains no matches', () => {
    it('should return []', () => {
        expect(getVersionsToPurge([], ['v1.0.0'])).toEqual([]);
        expect(
            getVersionsToPurge(['v1.0.0'], ['v0.1.0'], {
                includePrerelease: true,
            })
        ).toEqual([]);
        expect(
            getVersionsToPurge(['v1.0.0', 'v2.0.0'], ['v0.1.0', 'v1.1.0'], {
                includePrerelease: true,
            })
        ).toEqual([]);
    });
});

describe('when versionsToPurge contains matches', () => {
    it('should return the matched versions', () => {
        expect(getVersionsToPurge(['v1.0.0'], ['v1.0.0'])).toEqual(['v1.0.0']);
        expect(getVersionsToPurge(['v1.0.0', 'v2.0.0'], ['>=1.5'])).toEqual([
            'v2.0.0',
        ]);
    });
});
