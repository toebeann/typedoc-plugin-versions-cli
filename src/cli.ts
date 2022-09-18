#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const cli = yargs(hideBin(process.argv))
    .commandDir('commands', { extensions: ['ts', 'js'] })
    .strictCommands()
    .demandCommand(1, '')
    .help()
    .version()
    .alias('h', 'help')
    .group(['help', 'version'], 'Help:');

(async () => {
    try {
        await cli.argv;
    } catch (e) {
        process.exitCode = 1;
        console.error(e);
    }
})();
