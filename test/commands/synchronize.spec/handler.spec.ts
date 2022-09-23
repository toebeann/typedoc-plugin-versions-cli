import { EOL } from 'node:os';
import { join, resolve } from 'node:path';
import { ensureDir, rm } from 'fs-extra';
import { getSemanticVersion } from 'typedoc-plugin-versions/src/etc/utils';

import { cli } from '../../../src';

const testDir = resolve(join('test', '.commands.sync.handler'));
beforeAll(() => ensureDir(testDir));
afterAll(() => rm(testDir, { recursive: true, force: true }));

describe('local package', () => {
    describe('when no arguments passed', () => {
        let consoleErrorMock: jest.SpyInstance;

        beforeEach(() => consoleErrorMock = jest.spyOn(console, 'error').mockImplementation());
        afterEach(() => consoleErrorMock.mockRestore());


        test('should error: Missing docs for package.json version...', async () => {
            await cli().parse(`sync --out ${testDir}`);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith(`Missing docs for package.json version: ${getSemanticVersion()}${EOL}Did you forget to run typedoc?`);
            expect(process.exitCode).toBe(1);
        })
    });
});
