import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from '@jest/globals';

import { join, resolve } from 'node:path';
import { each } from 'async';
import { ensureDir, rm } from 'fs-extra';
import { version } from 'typedoc-plugin-versions';

import { getStaleVersionsToPurge } from '../../../src/commands/purge';

const out = 'test/.commands.purge.getStaleVersionsToPurge';
const options = {
    out,
    versions: { stable: 'auto', dev: 'auto', domLocation: 'false' },
} as const;
let versions: version[];

beforeAll(() => ensureDir(resolve(out)));
afterAll(() => rm(resolve(out), { recursive: true, force: true }));

beforeEach(() => each(versions, async (v) => ensureDir(resolve(join(out, v)))));

describe('when versions = []', () => {
    beforeAll(() => {
        versions = [];
    });

    it('should return []', async () => {
        expect(await getStaleVersionsToPurge(versions, options)).toEqual([]);
    });
});

describe('when versions = [ "v0.1.0" ]', () => {
    beforeAll(() => {
        versions = ['v0.1.0'];
    });

    it('should return []', async () => {
        expect(await getStaleVersionsToPurge(versions, options)).toEqual([]);
    });
});

describe('when versions = [ "v1.0.0-alpha.1", "v0.1.0" ]', () => {
    beforeAll(() => {
        versions = ['v1.0.0-alpha.1', 'v0.1.0'];
    });

    it('should return []', async () => {
        expect(await getStaleVersionsToPurge(versions, options)).toEqual([]);
    });
});

describe('when versions = [ "v1.0.0", "v1.0.0-alpha.1", "v0.1.0" ]', () => {
    beforeAll(() => {
        versions = ['v1.0.0', 'v1.0.0-alpha.1', 'v0.1.0'];
    });

    it('should return [ "v1.0.0-alpha.1", "v0.1.0" ]', async () => {
        expect(await getStaleVersionsToPurge(versions, options)).toEqual([
            'v1.0.0-alpha.1',
            'v0.1.0',
        ]);
    });
});
