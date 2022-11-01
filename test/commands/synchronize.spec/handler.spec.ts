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
let consoleLogMock: jest.SpiedFunction<typeof console.log>;
let consoleErrorMock: jest.SpiedFunction<typeof console.error>;
let consoleTimeMock: jest.SpiedFunction<typeof console.time>;
let consoleTimeEndMock: jest.SpiedFunction<typeof console.timeEnd>;
let processExitMock: jest.SpiedFunction<typeof process.exit>;
const consoleLogMockImplementation = <typeof console.log>(<unknown>undefined);
const consoleTimeMockImplementation = <typeof console.time>(
    consoleLogMockImplementation
);
const processExitMockImplementation = <typeof process.exit>(
    consoleLogMockImplementation
);

beforeAll(() => ensureDir(out));
afterAll(() => rm(out, { recursive: true, force: true }));

describe('when `out` points to empty directory', () => {
    beforeAll(() => emptyDir(out));
    beforeEach(() => {
        consoleErrorMock = jest
            .spyOn(console, 'error')
            .mockImplementation(consoleLogMockImplementation);
        processExitMock = jest
            .spyOn(process, 'exit')
            .mockImplementation(processExitMockImplementation);
    });
    afterEach(() => {
        consoleErrorMock.mockRestore();
        processExitMock.mockRestore();
    });

    it('should error: Missing docs for package.json version...', async () => {
        await cli().parse(`sync --out ${out}`);
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(
            `Missing docs for package.json version: ${getSemanticVersion()}${EOL}Did you forget to run typedoc?`
        );
        expect(process.exit).toHaveBeenCalledTimes(1);
        expect(process.exit).toHaveBeenCalledWith(1);
    });
});

describe('when `out` contains package.json version docs', () => {
    const dir = join(out, 'foo');
    const packageVersionDocs = resolve(join(dir, getSemanticVersion()));

    beforeEach(() => ensureDir(packageVersionDocs));
    afterEach(() => rm(dir, { recursive: true, force: true }));

    describe('when metadata out of date', () => {
        describe('when user chooses "no"', () => {
            beforeEach(() => {
                consoleLogMock = jest
                    .spyOn(console, 'log')
                    .mockImplementation(consoleLogMockImplementation);
                consoleTimeMock = jest
                    .spyOn(console, 'time')
                    .mockImplementation(consoleTimeMockImplementation);
                consoleTimeEndMock = jest
                    .spyOn(console, 'timeEnd')
                    .mockImplementation(consoleTimeMockImplementation);
            });

            afterEach(() => {
                consoleLogMock.mockRestore();
                consoleTimeMock.mockRestore();
                consoleTimeEndMock.mockRestore();
            });

            it('should exit without making changes', async () => {
                inject(['']);
                await cli().parse(`sync --out ${dir}`);
                expect(console.log).toHaveBeenCalledTimes(1);
                expect(console.time).not.toHaveBeenCalled();
                expect(console.timeEnd).not.toHaveBeenCalled();
            });

            describe('when user passes --symlinks', () => {
                it('should exit fixing symlinks only', async () => {
                    await cli().parse(`sync --out ${dir} --symlinks`);
                    expect(console.log).toHaveBeenCalledTimes(1);
                    expect(console.time).toHaveBeenCalledTimes(1);
                    expect(console.time).toHaveBeenCalledWith('symlinks');
                    expect(console.timeEnd).toHaveBeenCalledTimes(1);
                });
            });
        });

        describe('when user chooses "yes"', () => {
            beforeEach(() => {
                consoleLogMock = jest
                    .spyOn(console, 'log')
                    .mockImplementation(consoleLogMockImplementation);
                consoleTimeMock = jest
                    .spyOn(console, 'time')
                    .mockImplementation(consoleTimeMockImplementation);
                consoleTimeEndMock = jest
                    .spyOn(console, 'timeEnd')
                    .mockImplementation(consoleTimeMockImplementation);
            });

            afterEach(() => {
                consoleLogMock.mockRestore();
                consoleTimeMock.mockRestore();
                consoleTimeEndMock.mockRestore();
            });

            it('should make all changes', async () => {
                inject(['yes']);
                await cli().parse(`sync --out ${dir}`);
                expect(console.log).toHaveBeenCalledTimes(2);
                expect(console.time).toHaveBeenCalledTimes(4);
                expect(console.timeEnd).toHaveBeenCalledTimes(4);
                expect(console.time).toHaveBeenCalledWith('symlinks');
            });
        });

        describe('when user passes -y', () => {
            beforeEach(() => {
                consoleLogMock = jest
                    .spyOn(console, 'log')
                    .mockImplementation(consoleLogMockImplementation);
                consoleTimeMock = jest
                    .spyOn(console, 'time')
                    .mockImplementation(consoleTimeMockImplementation);
                consoleTimeEndMock = jest
                    .spyOn(console, 'timeEnd')
                    .mockImplementation(consoleTimeMockImplementation);
            });

            afterEach(() => {
                consoleLogMock.mockRestore();
                consoleTimeMock.mockRestore();
                consoleTimeEndMock.mockRestore();
            });

            it('should make all changes', async () => {
                await cli().parse(`sync --out ${dir} -y`);
                expect(console.log).toHaveBeenCalledTimes(1);
                expect(console.time).toHaveBeenCalledTimes(4);
                expect(console.timeEnd).toHaveBeenCalledTimes(4);
                expect(console.time).toHaveBeenCalledWith('symlinks');
            });
        });
    });

    describe('when metadata up-to-date', () => {
        beforeEach(async () => {
            consoleLogMock = jest
                .spyOn(console, 'log')
                .mockImplementation(consoleLogMockImplementation);
            consoleTimeMock = jest
                .spyOn(console, 'time')
                .mockImplementation(consoleTimeMockImplementation);
            consoleTimeEndMock = jest
                .spyOn(console, 'timeEnd')
                .mockImplementation(consoleTimeMockImplementation);
            await cli().parse(`sync --out ${dir} -y`);
            consoleLogMock.mockReset();
            consoleTimeMock.mockReset();
            consoleTimeEndMock.mockReset();
        });

        afterEach(() => {
            consoleLogMock.mockRestore();
            consoleTimeMock.mockRestore();
            consoleTimeEndMock.mockRestore();
        });

        it('should log: "Already up-to-date."', async () => {
            inject(['']);
            await cli().parse(`sync --out ${dir}`);
            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith('Already up-to-date.');
        });
    });
});
