import { metadata, version, versionsOptions } from 'typedoc-plugin-versions';
import {
    ArgumentsCamelCase,
    Argv,
    InferredOptionTypes,
    Options as BuilderOptions,
} from 'yargs';

export * as purge from './commands/purge';
export * as synchronize from './commands/synchronize';
export * from './utils';

export interface Options {
    out: string;
    versions: Required<versionsOptions>;
}

export type Args<O> = O extends Argv<infer R>
    ? ArgumentsCamelCase<R>
    : O extends { [key: string]: BuilderOptions }
    ? ArgumentsCamelCase<InferredOptionTypes<O>>
    : unknown;

export type refreshedMetadata = metadata & { versions: version[] } & (
        | { stable: version; dev: version }
        | { stable: version }
        | { dev: version }
    );
