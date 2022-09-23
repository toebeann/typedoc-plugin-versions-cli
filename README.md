<center>

# typedoc-plugin-versions-cli 🧑‍💻

A companion CLI tool for working with [typedoc-plugin-versions](https://citkane.github.io/typedoc-plugin-versions).

[![npm package version](https://img.shields.io/npm/v/typedoc-plugin-versions-cli.svg?logo=npm&label&labelColor=222&style=flat-square)](https://npmjs.org/package/typedoc-plugin-versions-cli "View typedoc-plugin-versions-cli on npm") [![npm package downloads](https://img.shields.io/npm/dw/typedoc-plugin-versions-cli.svg?logo=npm&labelColor=222&style=flat-square)](https://npmjs.org/package/typedoc-plugin-versions-cli "View typedoc-plugin-versions-cli on npm") [![typedocs](https://img.shields.io/badge/docs-informational.svg?logo=typescript&labelColor=222&style=flat-square)](https://toebeann.github.io/typedoc-plugin-versions-cli "Read the documentation on Github Pages") [![coverage](https://img.shields.io/codecov/c/github/toebeann/typedoc-plugin-versions-cli.svg?logo=codecov&labelColor=222&style=flat-square)](https://codecov.io/gh/toebeann/typedoc-plugin-versions-cli "View code coverage on Codecov") [![code quality](https://img.shields.io/codefactor/grade/github/toebeann/typedoc-plugin-versions-cli.svg?logo=codefactor&labelColor=222&style=flat-square)](https://www.codefactor.io/repository/github/toebeann/typedoc-plugin-versions-cli "View code quality on CodeFactor") [![license](https://img.shields.io/github/license/toebeann/typedoc-plugin-versions-cli.svg?color=informational&labelColor=222&style=flat-square)](https://github.com/toebeann/typedoc-plugin-versions-cli/blob/main/LICENSE "View the license on GitHub")

[![npm test](https://img.shields.io/github/workflow/status/toebeann/typedoc-plugin-versions-cli/npm%20test.svg?logo=github&logoColor=aaa&label=npm%20test&labelColor=222&style=flat-square)](https://github.com/toebeann/typedoc-plugin-versions-cli/actions/workflows/npm-test.yml "View npm test on GitHub Actions") [![publish code coverage](https://img.shields.io/github/workflow/status/toebeann/typedoc-plugin-versions-cli/publish%20code%20coverage.svg?logo=github&logoColor=aaa&label=publish%20code%20coverage&labelColor=222&style=flat-square)](https://github.com/toebeann/typedoc-plugin-versions-cli/actions/workflows/publish-code-coverage.yml "View publish code coverage on GitHub Actions") [![publish package](https://img.shields.io/github/workflow/status/toebeann/typedoc-plugin-versions-cli/publish%20package.svg?logo=github&logoColor=aaa&label=publish%20package&labelColor=222&style=flat-square)](https://github.com/toebeann/typedoc-plugin-versions-cli/actions/workflows/publish-package.yml "View publish package on GitHub Actions") [![publish docs](https://img.shields.io/github/workflow/status/toebeann/typedoc-plugin-versions-cli/publish%20docs.svg?logo=github&logoColor=aaa&label=publish%20docs&labelColor=222&style=flat-square)](https://github.com/toebeann/typedoc-plugin-versions-cli/actions/workflows/publish-docs.yml "View publish docs on GitHub Actions")

[![github](https://img.shields.io/badge/source-informational.svg?logo=github&labelColor=222&style=flat-square)](https://github.com/toebeann/typedoc-plugin-versions-cli "View typedoc-plugin-versions-cli on GitHub") [![twitter](https://img.shields.io/badge/follow-blue.svg?logo=twitter&label&labelColor=222&style=flat-square)](https://twitter.com/toebean__ "Follow @toebean__ on Twitter") [![GitHub Sponsors donation button](https://img.shields.io/badge/sponsor-e5b.svg?logo=github%20sponsors&labelColor=222&style=flat-square)](https://github.com/sponsors/toebeann "Sponsor typedoc-plugin-versions-cli on GitHub") [![PayPal donation button](https://img.shields.io/badge/donate-e5b.svg?logo=paypal&labelColor=222&style=flat-square)](https://paypal.me/tobeyblaber "Donate to typedoc-plugin-versions-cli with PayPal")

</center>

## Table of contents

- [typedoc-plugin-versions-cli 🧑‍💻](#typedoc-plugin-versions-cli-)
  - [Table of contents](#table-of-contents)
  - [Install](#install)
    - [npm](#npm)
  - [Usage](#usage)
    - [Commands](#commands)
      - [purge](#purge)
        - [Options](#options)
      - [synchronize](#synchronize)
        - [Options](#options-1)
  - [License](#license)

## Install

### [npm](https://www.npmjs.com/package/toebean/typedoc-plugin-versions-cli "npm is a package manager for JavaScript")

```text
npm i -D typedoc-plugin-versions-cli typedoc-plugin-versions
```

## Usage

Run any of the following from the command line:

```text
tpv <command> [options..]
```

```text
typedoc-plugin-versions-cli <command> [options..]
```

```text
typedoc-plugin-versions <command> [options..]
```

```text
typedoc-versions <command> [options..]
```

See details about the various [commands](#commands) and their options via the `--help` flag:

```text
tpv --help
```

All `boolean` flags which are `true` by default can be negated by prefixing with `no-`, e.g., the following are equivalent:

```text
tpv purge --no-stale
tpv purge --stale false
```

On Windows, you may need to prefix the commands with `npx`, e.g.:

```text
npx tpv <command> [options..]
```

### Commands

#### purge

Deletes old doc builds and/or versions matching semver ranges. To synchronize metadata and symbolic links after, run [`tpv sync`](#synchronize).

```text
tpv purge [versions..] [flags]
```

Displays a confirmation prompt before performing changes.

##### Options

- **`--stale [boolean] [default: true]`**<br/>Purge stale doc builds, e.g. `v1.0.0-alpha.1` is considered stale once `v1.0.0` has been built.<br/><br/>
- **`--major <number> [default: Infinity]`**<br/>Purge all but the specified number of major versions.<br/><br/>
- **`--minor <number> [default: Infinity]`**<br/>Purge all but the specified number of minor versions per major version.<br/><br/>
- **`--patch <number> [default: Infinity]`**<br/>Purge all but the specified number of patch versions per minor version.<br/><br/>
- **`--exclude <versions..>`**<br/>Exclude versions matching the specified semver ranges from the purge operation.<br/><br/>
- **`--pre`**, **`--prerelease [boolean] [default: false]`**<br/>Include prerelease versions when evaluating semver ranges.<br/><br/>
- **`-y`**, **`--yes [boolean] [default: false]`**<br/>Automatically confirms prompts.<br/><br/>
- **`--out <string>`**<br/>The path to your typedoc output directory. By default this is inferred from your typedoc configuration.<br/><br/>
- **`--typedoc <string> [default: "."]`**<br/>The path to your typedoc configuration file, e.g. `typedoc.json`. By default this is searched for in the current working directory.<br/><br/>
- **`--tsconfig <string> [default: "."]`**<br/>The path to your TypeScript tsconfig file, e.g. `tsconfig.json`. By default this is searched for in the current working directory.

#### synchronize

Ensures your [typedoc-plugin-versions](https://citkane.github.io/typedoc-plugin-versions) metadata and symbolic links are up-to-date. Useful after deleting old doc builds.

```text
tpv synchronize [flags]
```

```text
tpv sync [flags]
```

Displays a confirmation prompt before performing changes.

##### Options

- **`-y`**, **`--yes [boolean] [default: false]`**<br/>Automatically confirms prompts.<br/><br/>
- **`--symlink [boolean] [default: false]`**<br/>Always ensures symbolic links are up-to-date, regardless of confirmation prompts.<br/><br/>
- **`--out <string>`**<br/>The path to your typedoc output directory. By default this is inferred from your typedoc configuration.<br/><br/>
- **`--typedoc <string> [default: "."]`**<br/>The path to your typedoc configuration file, e.g. `typedoc.json`. By default this is searched for in the current working directory.<br/><br/>
- **`--tsconfig <string> [default: "."]`**<br/>The path to your TypeScript tsconfig file, e.g. `tsconfig.json`. By default this is searched for in the current working directory.

## License

typedoc-plugin-versions-cli is licensed under [MIT](https://github.com/toebeann/typedoc-plugin-versions-cli/blob/main/LICENSE) © 2022 Tobey Blaber.
