import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from '@jest/globals';

import { join, resolve } from 'node:path';
import { each } from 'async';
import { emptyDir, ensureDir, pathExists, rm, stat } from 'fs-extra';
import { inject } from 'prompts';
import { version } from 'typedoc-plugin-versions';

import { cli, exclude } from '../../../src';

const out = 'test/.commands.purge.handler';
let versions: version[];
const consoleLogMockImplementation = <typeof console.log>(<unknown>undefined);

beforeAll(() => ensureDir(resolve(out)));
afterAll(() => rm(resolve(out), { recursive: true, force: true }));

describe('when `out` points to empty directory', () => {
    beforeAll(() => emptyDir(out));
    beforeEach(() => {
        versions = [];
    });

    it('should log: Nothing to purge!', async () => {
        const log = jest
            .spyOn(console, 'log')
            .mockImplementation(consoleLogMockImplementation);
        await cli().parse(`purge --out ${out}`);
        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith('Nothing to purge!');
    });
});

describe('when versions = [ "v2.1.0", "v2.0.1", "v2.0.0", "v2.0.0-alpha.1", "v1.2.2", "v1.2.1", "v1.2.0", "v1.1.0", "v1.0.0", "v0.1.0" ]', () => {
    beforeEach(async () => {
        versions = [
            'v2.1.0',
            'v2.0.1',
            'v2.0.0',
            'v2.0.0-alpha.1',
            'v1.2.2',
            'v1.2.1',
            'v1.2.0',
            'v1.1.0',
            'v1.0.0',
            'v0.1.0',
        ];

        await each(
            versions,
            async (v) => await ensureDir(resolve(join(out, v)))
        );
    });

    describe('when user chooses "no"', () => {
        it('should exit without making changes', async () => {
            const log = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);

            inject(['']);
            await cli().parse(`purge --out ${out}`);
            expect(log).toHaveBeenCalledTimes(1);

            await each(versions, async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(true)
            );
        });
    });

    describe('when user chooses "yes"', () => {
        it('should purge stale versions', async () => {
            const log = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);

            inject(['yes']);
            await cli().parse(`purge --out ${out}`);
            expect(log).toHaveBeenCalledTimes(2);

            const stale = ['v2.0.0-alpha.1', 'v0.1.0'];

            await each(exclude(versions, stale), async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(true)
            );

            await each(stale, async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(false)
            );
        });
    });

    describe('when user passes -y', () => {
        it('should purge stale versions', async () => {
            const log = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);

            await cli().parse(`purge --out ${out} -y`);
            expect(log).toHaveBeenCalledTimes(1);

            const stale = ['v2.0.0-alpha.1', 'v0.1.0'];

            await each(exclude(versions, stale), async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(true)
            );

            await each(stale, async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(false)
            );
        });
    });

    describe('when user passes -y --exclude ">=2.0.0"', () => {
        it('should purge stale versions', async () => {
            const log = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);

            await cli().parse(`purge --out ${out} -y --exclude ">=2.0.0"`);
            expect(log).toHaveBeenCalledTimes(1);

            const stale = ['v0.1.0'];

            await each(exclude(versions, stale), async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(true)
            );

            await each(stale, async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(false)
            );
        });
    });

    describe('when user passes --no-stale', () => {
        it('should log: Nothing to purge!', async () => {
            const log = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);

            await cli().parse(`purge --out ${out} --no-stale`);
            expect(log).toHaveBeenCalledTimes(1);
            expect(log).toHaveBeenCalledWith('Nothing to purge!');

            log.mockReset();
            await cli().parse(`purge --out ${out} --stale false`);
            expect(log).toHaveBeenCalledTimes(1);
            expect(log).toHaveBeenCalledWith('Nothing to purge!');

            log.mockReset();
            await cli().parse(`purge --out ${out} --stale=false`);
            expect(log).toHaveBeenCalledTimes(1);
            expect(log).toHaveBeenCalledWith('Nothing to purge!');
        });
    });

    describe('when user passes 2.0.1 -y', () => {
        it('should purge stale versions & 2.0.1', async () => {
            const log = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);

            await cli().parse(`purge --out ${out} 2.0.1 -y`);
            expect(log).toHaveBeenCalledTimes(1);

            const stale = ['v2.0.0-alpha.1', 'v0.1.0'];
            const purge = ['v2.0.1'];

            await each(exclude(versions, [...purge, ...stale]), async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(true)
            );

            await each([...purge, ...stale], async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(false)
            );
        });
    });

    describe('when user passes --major 1 -y', () => {
        it('should purge stale versions & all but the last major version', async () => {
            const log = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);

            await cli().parse(`purge --out ${out} --major 1 -y`);
            expect(log).toHaveBeenCalledTimes(1);

            const stale = ['v2.0.0-alpha.1', 'v0.1.0'];
            const major = ['v1.2.2', 'v1.2.1', 'v1.2.0', 'v1.1.0', 'v1.0.0'];

            await each(exclude(versions, [...major, ...stale]), async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(true)
            );

            await each([...major, ...stale], async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(false)
            );
        });
    });

    describe('when user passes --minor 1 -y', () => {
        it('should purge stale versions & all but the last minor version per major version', async () => {
            const log = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);

            await cli().parse(`purge --out ${out} --minor 1 -y`);
            expect(log).toHaveBeenCalledTimes(1);

            const stale = ['v2.0.0-alpha.1', 'v0.1.0'];
            const minor = ['v2.0.1', 'v2.0.0', 'v1.1.0', 'v1.0.0'];

            await each(exclude(versions, [...minor, ...stale]), async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(true)
            );

            await each([...minor, ...stale], async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(false)
            );
        });
    });

    describe('when user passes --patch 1 -y', () => {
        it('should purge stale versions & all but the last patch version per minor version', async () => {
            const log = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);

            await cli().parse(`purge --out ${out} --patch 1 -y`);
            expect(log).toHaveBeenCalledTimes(1);

            const stale = ['v2.0.0-alpha.1', 'v0.1.0'];
            const patch = ['v2.0.0', 'v1.2.1', 'v1.2.0'];

            await each(exclude(versions, [...patch, ...stale]), async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(true)
            );

            await each([...patch, ...stale], async (v) =>
                expect(
                    (await pathExists(resolve(join(out, v)))) &&
                        (await stat(resolve(join(out, v)))).isDirectory()
                ).toBe(false)
            );
        });
    });
});
