import { join, resolve } from 'node:path';
import { cwd } from 'node:process';
import { cli } from '../src';
import { commonOptions, out } from '../src/commands/builders';

import { getOut } from '../src/utils';

describe('local package', () => {
    const dir = cwd();

    describe('when no cli arguments passed', () => {
        describe('when parsing `commonOptions`', () => {
            test('return should be "./docs"', async () => {
                expect(
                    await getOut(
                        await cli()
                            .options(commonOptions)
                            .demandCommand(0)
                            .parse()
                    )
                ).toBe(resolve(join(dir, 'docs')));
            });
        });

        describe('when parsing only `out`', () => {
            test('should throw Error', async () => {
                try {
                    await getOut(
                        await cli().options({ out }).demandCommand(0).parse()
                    );
                    fail('must throw');
                } catch (e) {
                    expect(e).toEqual(new Error("Could not parse 'out'"));
                }
            });
        });
    });

    describe('when `--out docs', () => {
        describe('when parsing `commonOptions`', () => {
            test('return should be "./docs"', async () => {
                expect(
                    await getOut(
                        await cli()
                            .options(commonOptions)
                            .demandCommand(0)
                            .parse('--out docs')
                    )
                ).toBe(resolve(join(dir, 'docs')));
            });
        });

        describe('when parsing only `out`', () => {
            test('return should be "./docs"', async () => {
                expect(
                    await getOut(
                        await cli()
                            .options(commonOptions)
                            .demandCommand(0)
                            .parse('--out docs')
                    )
                ).toBe(resolve(join(dir, 'docs')));
            });
        });
    });
});
