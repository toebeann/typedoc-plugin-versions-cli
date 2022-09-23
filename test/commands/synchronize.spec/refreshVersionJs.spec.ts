import { refreshVersionJs } from '../../../src/commands/synchronize';

describe('when metadata = { versions: [ "v1.0.0" ], stable: "v1.0.0" }', () => {
    test('should complete appropriately', () => {
        expect(
            refreshVersionJs({ versions: ['v1.0.0'], stable: 'v1.0.0' })
        ).toBe(
            [
                '"use strict"',
                'export const DOC_VERSIONS = [',
                "	'stable',",
                "	'v1.0',",
                '];',
            ]
                .join('\n')
                .concat('\n')
        );
    });
});
