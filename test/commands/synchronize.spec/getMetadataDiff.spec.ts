import { describe, expect, it } from '@jest/globals';

import { getMetadataDiff } from '../../../src/commands/synchronize';

describe('when left = {} & right = {}', () => {
    it('should return empty', () => {
        expect(getMetadataDiff({}, {})).toBe('');
    });
});

describe('when left = {} & right = { stable: "v1.0.0" }', () => {
    it('should return non-empty', () => {
        expect(
            getMetadataDiff({}, { stable: 'v1.0.0' }).length
        ).toBeGreaterThan(0);
    });
});
