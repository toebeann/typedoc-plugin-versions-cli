import { describe, expect, it } from '@jest/globals';

import { isStale } from '../../../src/commands/purge';

describe('when versions = [ "v0.1.0", "v1.0.0-alpha.1", "v1.0.0" ]', () => {
    const versions = ['v0.1.0', 'v1.0.0-alpha.1', 'v1.0.0'] as const;

    describe('when version = "v0.1.0"', () => {
        const version = 'v0.1.0';

        describe('when stable = "v0.1.0"', () => {
            const stable = 'v0.1.0';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });
        });

        describe('when stable = "v1.0.0-alpha.1"', () => {
            const stable = 'v1.0.0-alpha.1';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });
        });

        describe('when stable = "v1.0.0"', () => {
            const stable = 'v1.0.0';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });
        });

        describe('when stable = "auto"', () => {
            const stable = 'auto';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });
        });
    });

    describe('when version = "v1.0.0-alpha.1"', () => {
        const version = 'v1.0.0-alpha.1';

        describe('when stable = "v0.1.0"', () => {
            const stable = 'v0.1.0';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });
        });

        describe('when stable = "v1.0.0-alpha.1"', () => {
            const stable = 'v1.0.0-alpha.1';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });
        });

        describe('when stable = "v1.0.0"', () => {
            const stable = 'v1.0.0';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });
        });

        describe('when stable = "auto"', () => {
            const stable = 'auto';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return true', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(true);
                });
            });
        });
    });

    describe('when version = "v1.0.0"', () => {
        const version = 'v1.0.0';

        describe('when stable = "v0.1.0"', () => {
            const stable = 'v0.1.0';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });
        });

        describe('when stable = "v1.0.0-alpha.1"', () => {
            const stable = 'v1.0.0-alpha.1';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });
        });

        describe('when stable = "v1.0.0"', () => {
            const stable = 'v1.0.0';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });
        });

        describe('when stable = "auto"', () => {
            const stable = 'auto';

            describe('when dev = "v0.1.0"', () => {
                const dev = 'v0.1.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0-alpha.1"', () => {
                const dev = 'v1.0.0-alpha.1';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "v1.0.0"', () => {
                const dev = 'v1.0.0';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });

            describe('when dev = "auto"', () => {
                const dev = 'auto';

                it('should return false', () => {
                    expect(isStale(version, versions, stable, dev)).toBe(false);
                });
            });
        });
    });
});
