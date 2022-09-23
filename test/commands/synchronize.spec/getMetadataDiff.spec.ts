import { getMetadataDiff } from '../../../src/commands/synchronize';

describe('when left = {} & right = {}', () => {
    test('should return empty', () => {
        expect(getMetadataDiff({}, {})).toBe('');
    });
});

describe('when left = {} & right = { stable: "v1.0.0" }', () => {
    test('should return non-empty', () => {
        expect(
            getMetadataDiff({}, { stable: 'v1.0.0' }).length
        ).toBeGreaterThan(0);
    });
});
