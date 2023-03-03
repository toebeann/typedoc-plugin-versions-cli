import { describe, expect, it } from '@jest/globals';

import { refreshIndexHtml } from '../../../src/commands/synchronize';

describe('when metadata = { versions: [ "v1.0.0" ], stable: "v1.0.0" }', () => {
    it('should redirect to stable', () => {
        expect(
            refreshIndexHtml({ versions: ['v1.0.0'], stable: 'v1.0.0' })
        ).toBe('<meta http-equiv="refresh" content="0; url=stable/"/>');
    });
});

describe('when metadata = { versions: [ "v0.1.0" ], dev: "v0.1.0" }', () => {
    it('should redirect to dev', () => {
        expect(refreshIndexHtml({ versions: ['v0.1.0'], dev: 'v0.1.0' })).toBe(
            '<meta http-equiv="refresh" content="0; url=dev/"/>'
        );
    });
});
