import { isDev } from '../../../src/commands/purge';

describe('when version = "v1.0.0"', () => {
    const version = 'v1.0.0';

    describe('when dev = "v1.0.0"', () => {
        const dev = 'v1.0.0';

        test('should return true', () => {
            expect(isDev(version, dev)).toBe(true);
        });
    });

    describe('when dev = "v2.0.0"', () => {
        const dev = 'v2.0.0';

        test('should return false', () => {
            expect(isDev(version, dev)).toBe(false);
        });
    });

    describe('when dev = "v0.1.0"', () => {
        const dev = 'v0.1.0';

        test('should return false', () => {
            expect(isDev(version, dev)).toBe(false);
        });
    });

    describe('when dev = "auto"', () => {
        const dev = 'auto';

        test('should return false', () => {
            expect(isDev(version, dev)).toBe(false);
        });
    });
});

describe('when version = "v0.1.0"', () => {
    const version = 'v0.1.0';

    describe('when dev = "v1.0.0"', () => {
        const dev = 'v1.0.0';

        test('should return true', () => {
            expect(isDev(version, dev)).toBe(true);
        });
    });

    describe('when dev = "v2.0.0"', () => {
        const dev = 'v2.0.0';

        test('should return true', () => {
            expect(isDev(version, dev)).toBe(true);
        });
    });

    describe('when dev = "v0.1.0"', () => {
        const dev = 'v0.1.0';

        test('should return true', () => {
            expect(isDev(version, dev)).toBe(true);
        });
    });

    describe('when dev = "auto"', () => {
        const dev = 'auto';

        test('should return true', () => {
            expect(isDev(version, dev)).toBe(true);
        });
    });
});
