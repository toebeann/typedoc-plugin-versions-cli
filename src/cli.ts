#!/usr/bin/env node
import process from 'node:process';
import { cli } from './';

(async () => {
    try {
        await cli.argv;
    } catch (e) {
        process.exitCode = 1;
        console.error(e);
    }
})();
