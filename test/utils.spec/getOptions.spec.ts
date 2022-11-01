import { beforeAll, describe, expect, it } from '@jest/globals';

import { join } from 'node:path';
import { cwd } from 'node:process';
import { cli, isOptions, Options } from '../../src';
import { commonOptions } from '../../src/commands/builders';

import { getOptions } from '../../src/utils';

describe('local package', () => {
    const dir = cwd();
    let options: Options;

    describe('when no cli arguments passed', () => {
        beforeAll(async () => {
            options = await getOptions(
                await cli()
                    .options({ ...commonOptions })
                    .demandCommand(0)
                    .parse()
            );
        });

        it('return should implement the Options interface', () => {
            expect(isOptions(options)).toBe(true);
        });

        it('return.out should be "./docs"', () => {
            expect(options.out).toBe(join(dir, 'docs'));
        });

        it('return.versions should equal {stable: "auto", dev: "auto", domLocation: "false"}', () => {
            expect(options.versions).toEqual({
                stable: 'auto',
                dev: 'auto',
                domLocation: 'false',
            });
        });
    });

    describe('when `--out docs`', () => {
        beforeAll(async () => {
            options = await getOptions(
                await cli()
                    .options({ ...commonOptions })
                    .demandCommand(0)
                    .parse('--out docs')
            );
        });

        it('return should implement the Options interface', () => {
            expect(isOptions(options)).toBe(true);
        });

        it('return.out should be "./docs"', () => {
            expect(options.out).toBe(join(dir, 'docs'));
        });

        it('return.versions should equal {stable: "auto", dev: "auto", domLocation: "false"}', () => {
            expect(options.versions).toEqual({
                stable: 'auto',
                dev: 'auto',
                domLocation: 'false',
            });
        });
    });

    describe('when `--out foo`', () => {
        it('should throw Error', async () => {
            try {
                await getOptions(
                    await cli()
                        .options({ ...commonOptions })
                        .demandCommand(0)
                        .parse('--out foo')
                );
                fail('must throw');
            } catch (e) {
                expect(e).toEqual(new Error('Directory does not exist: foo'));
            }
        });
    });

    describe('when `--tsconfig .`', () => {
        beforeAll(async () => {
            options = await getOptions(
                await cli()
                    .options({ ...commonOptions })
                    .demandCommand(0)
                    .parse('--tsconfig .')
            );
        });

        it('return should implement the Options interface', () => {
            expect(isOptions(options)).toBe(true);
        });

        it('return.out should be "./docs"', () => {
            expect(options.out).toBe(join(dir, 'docs'));
        });

        it('return.versions should equal {stable: "auto", dev: "auto", domLocation: "false"}', () => {
            expect(options.versions).toEqual({
                stable: 'auto',
                dev: 'auto',
                domLocation: 'false',
            });
        });
    });

    describe('when `--tsconfig="tsconfig.json"`', () => {
        beforeAll(async () => {
            options = await getOptions(
                await cli()
                    .options({ ...commonOptions })
                    .demandCommand(0)
                    .parse('--tsconfig="tsconfig.json"')
            );
        });

        it('return should implement the Options interface', () => {
            expect(isOptions(options)).toBe(true);
        });

        it('return.out should be "./docs"', () => {
            expect(options.out).toBe(join(dir, 'docs'));
        });

        it('return.versions should equal {stable: "auto", dev: "auto", domLocation: "false"}', () => {
            expect(options.versions).toEqual({
                stable: 'auto',
                dev: 'auto',
                domLocation: 'false',
            });
        });
    });

    describe('when `--tsconfig ./foobar`', () => {
        it('should throw Error', async () => {
            try {
                await getOptions(
                    await cli()
                        .options({ ...commonOptions })
                        .demandCommand(0)
                        .parse('--tsconfig ./foobar')
                );
                fail('must throw');
            } catch (e) {
                expect(e).toEqual(new Error('Path does not exist: foobar'));
            }
        });
    });

    describe('when `--typedoc .`', () => {
        beforeAll(async () => {
            options = await getOptions(
                await cli()
                    .options({ ...commonOptions })
                    .demandCommand(0)
                    .parse('--typedoc .')
            );
        });

        it('return should implement the Options interface', () => {
            expect(isOptions(options)).toBe(true);
        });

        it('return.out should be "./docs"', () => {
            expect(options.out).toBe(join(dir, 'docs'));
        });

        it('return.versions should equal {stable: "auto", dev: "auto", domLocation: "false"}', () => {
            expect(options.versions).toEqual({
                stable: 'auto',
                dev: 'auto',
                domLocation: 'false',
            });
        });
    });

    describe('when `--typedoc=typedoc.json`', () => {
        beforeAll(async () => {
            options = await getOptions(
                await cli()
                    .options({ ...commonOptions })
                    .demandCommand(0)
                    .parse('--typedoc=typedoc.json')
            );
        });

        it('return should implement the Options interface', () => {
            expect(isOptions(options)).toBe(true);
        });

        it('return.out should be "./docs"', () => {
            expect(options.out).toBe(join(dir, 'docs'));
        });

        it('return.versions should equal {stable: "auto", dev: "auto", domLocation: "false"}', () => {
            expect(options.versions).toEqual({
                stable: 'auto',
                dev: 'auto',
                domLocation: 'false',
            });
        });
    });

    describe('when `--typedoc ./bar`', () => {
        it('should throw Error', async () => {
            try {
                await getOptions(
                    await cli()
                        .options({ ...commonOptions })
                        .demandCommand(0)
                        .parse('--typedoc ./bar')
                );
                fail('must throw');
            } catch (e) {
                expect(e).toEqual(new Error('Path does not exist: bar'));
            }
        });
    });
});
