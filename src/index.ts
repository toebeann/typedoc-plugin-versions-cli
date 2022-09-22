import { argv } from 'node:process';
import { metadata, version, versionsOptions } from 'typedoc-plugin-versions';
import yargs, {
    ArgumentsCamelCase,
    Argv,
    InferredOptionTypes,
    Options as BuilderOptions,
} from 'yargs';
import { hideBin } from 'yargs/helpers';

export * as purge from './commands/purge';
export * as synchronize from './commands/synchronize';
export * from './utils';

/**
 * Options object parsed from typedoc configs.
 */
export interface Options {
    /**
     * The typedoc `out` directory.
     */
    out: string;
    /**
     * Options for {@link https://citkane.github.io/typedoc-plugin-versions typedoc-plugin-versions}.
     */
    versions: Required<versionsOptions>;
}

/**
 * Type guard for determining whether a given object implements the {@link Options} interface.
 * @param {unknown} obj The object.
 * @returns {obj is Options} Whether the object implements the {@link Options} interface.
 */
export const isOptions = (obj: unknown): obj is Options =>
    obj !== null &&
    typeof obj === 'object' &&
    'out' in obj &&
    'versions' in obj &&
    typeof (<Options>obj).out === 'string' &&
    typeof (<Options>obj).versions === 'object';

/**
 * The parsed {@link @types/yargs!yargs.Argv argv} which will be passed to a
 * {@link https://yargs.js.org/docs yargs} {@link https://yargs.js.org/docs/#api-reference-commandcmd-desc-builder-handler command's}
 * handler, its properties inferred from the builder used to compose the command.
 * @typeParam T The type of the builder used to compose the command.
 */
export type Args<T> = T extends Argv<infer R>
    ? ArgumentsCamelCase<R>
    : T extends { [key: string]: BuilderOptions }
    ? ArgumentsCamelCase<InferredOptionTypes<T>>
    : unknown;

/**
 * Type alias for once a {@link typedoc-plugin-versions!metadata metadata} object has been refreshed via
 * {@link typedoc-plugin-versions/etc/utils!refreshMetadata refreshMetadata}.
 */
export type refreshedMetadata = metadata & { versions: version[] } & (
        | { stable: version; dev: version }
        | { stable: version }
        | { dev: version }
    );

/**
 * {@link https://yargs.js.org/docs yargs} CLI builder.
 * @internal
 * Intended for internal use; may not be exported in future.
 * @returns A new {@link https://yargs.js.org/docs yargs} instance with default options and commands.
 */
export const cli = () =>
    yargs(hideBin(argv))
        .commandDir('./commands', { extensions: ['ts', 'js'] })
        .strictCommands()
        .demandCommand(1, '')
        .help()
        .version()
        .alias('h', 'help')
        .group(['help', 'version'], 'Help:');
