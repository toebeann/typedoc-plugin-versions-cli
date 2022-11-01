import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from '@jest/globals';

import { EOL } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { ensureDir, rm, emptyDir } from 'fs-extra';
import { inject } from 'prompts';
import { getSemanticVersion } from 'typedoc-plugin-versions/src/etc/utils';

import { cli } from '../../../src';

const out = resolve(join('test', '.commands.sync.handler'));
const consoleLogMockImplementation = (<unknown>undefined) as typeof console.log;
const consoleTimeMockImplementation = (<unknown>(
    undefined
)) as typeof console.time;
const processExitMockImplementation = (<unknown>(
    undefined
)) as typeof process.exit;

beforeAll(() => ensureDir(out));
afterAll(() => rm(out, { recursive: true, force: true }));

describe('when `out` points to empty directory', () => {
    beforeAll(() => emptyDir(out));

    it('should error: Missing docs for package.json version...', async () => {
        const error = jest
            .spyOn(console, 'error')
            .mockImplementation(consoleLogMockImplementation);
        const exit = jest
            .spyOn(process, 'exit')
            .mockImplementation(processExitMockImplementation);

        await cli().parse(`sync --out ${out}`);
        expect(error).toHaveBeenCalledTimes(1);
        expect(error).toHaveBeenCalledWith(
            `Missing docs for package.json version: ${getSemanticVersion()}${EOL}Did you forget to run typedoc?`
        );
        expect(exit).toHaveBeenCalledTimes(1);
        expect(exit).toHaveBeenCalledWith(1);
    });
});

describe('when `out` contains package.json version docs', () => {
    const dir = join(out, 'foo');
    const packageVersionDocs = resolve(join(dir, getSemanticVersion()));

    beforeEach(() => ensureDir(packageVersionDocs));
    afterEach(() => rm(dir, { recursive: true, force: true }));

    describe('when metadata out of date', () => {
        describe('when user chooses "no"', () => {
            it('should exit without making changes', async () => {
                const log = jest
                    .spyOn(console, 'log')
                    .mockImplementation(consoleLogMockImplementation);
                const time = jest
                    .spyOn(console, 'time')
                    .mockImplementation(consoleTimeMockImplementation);
                const timeEnd = jest
                    .spyOn(console, 'timeEnd')
                    .mockImplementation(consoleTimeMockImplementation);

                inject(['']);
                await cli().parse(`sync --out ${dir}`);
                expect(log).toHaveBeenCalledTimes(1);
                expect(time).not.toHaveBeenCalled();
                expect(timeEnd).not.toHaveBeenCalled();
            });

            describe('when user passes --symlinks', () => {
                it('should exit fixing symlinks only', async () => {
                    const log = jest
                        .spyOn(console, 'log')
                        .mockImplementation(consoleLogMockImplementation);
                    const time = jest
                        .spyOn(console, 'time')
                        .mockImplementation(consoleTimeMockImplementation);
                    const timeEnd = jest
                        .spyOn(console, 'timeEnd')
                        .mockImplementation(consoleTimeMockImplementation);

                    await cli().parse(`sync --out ${dir} --symlinks`);
                    expect(log).toHaveBeenCalledTimes(1);
                    expect(time).toHaveBeenCalledTimes(1);
                    expect(time).toHaveBeenCalledWith('symlinks');
                    expect(timeEnd).toHaveBeenCalledTimes(1);
                });
            });
        });

        describe('when user chooses "yes"', () => {
            it('should make all changes', async () => {
                const log = jest
                    .spyOn(console, 'log')
                    .mockImplementation(consoleLogMockImplementation);
                const time = jest
                    .spyOn(console, 'time')
                    .mockImplementation(consoleTimeMockImplementation);
                const timeEnd = jest
                    .spyOn(console, 'timeEnd')
                    .mockImplementation(consoleTimeMockImplementation);

                inject(['yes']);
                await cli().parse(`sync --out ${dir}`);
                expect(log).toHaveBeenCalledTimes(2);
                expect(time).toHaveBeenCalledTimes(4);
                expect(timeEnd).toHaveBeenCalledTimes(4);
                expect(time).toHaveBeenCalledWith('symlinks');
            });
        });

        describe('when user passes -y', () => {
            it('should make all changes', async () => {
                const log = jest
                    .spyOn(console, 'log')
                    .mockImplementation(consoleLogMockImplementation);
                const time = jest
                    .spyOn(console, 'time')
                    .mockImplementation(consoleTimeMockImplementation);
                const timeEnd = jest
                    .spyOn(console, 'timeEnd')
                    .mockImplementation(consoleTimeMockImplementation);

                await cli().parse(`sync --out ${dir} -y`);
                expect(log).toHaveBeenCalledTimes(1);
                expect(time).toHaveBeenCalledTimes(4);
                expect(timeEnd).toHaveBeenCalledTimes(4);
                expect(time).toHaveBeenCalledWith('symlinks');
            });
        });
    });

    describe('when metadata up-to-date', () => {
        it('should log: "Already up-to-date."', async () => {
            await cli().parse(`sync --out ${dir} -y`);

            const log = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);

            inject(['']);
            await cli().parse(`sync --out ${dir}`);
            expect(log).toHaveBeenCalledTimes(1);
            expect(log).toHaveBeenCalledWith('Already up-to-date.');
        });
    });
});
