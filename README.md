[![npm package](https://badge.fury.io/js/confinode.svg)](https://www.npmjs.com/package/confinode)
[![License](https://img.shields.io/github/license/slune-org/confinode.svg)](https://github.com/slune-org/confinode/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/slune-org/confinode.svg?branch=master)](https://travis-ci.org/slune-org/confinode)
[![Coverage Status](https://coveralls.io/repos/github/slune-org/confinode/badge.svg?branch=master)](https://coveralls.io/github/slune-org/confinode?branch=master)
[![Issues](https://img.shields.io/github/issues/slune-org/confinode.svg)](https://github.com/slune-org/confinode/issues)

# confinode - Node.js application configuration management

This package provides a library whose purpose is to be a standard and universal configuration file manager for Node.js applications. Its main features are:

- synchronous or asynchronous… or both;
- file system access cache;
- appropriate configuration file searching;
- configuration file loading, based on its name or on a module name;
- a lot of file type supported (out-of-the-box support for _JavaScript_, _JSON_, _YAML_, support for other types if appropriate modules can be loaded);
- indirection management (if configuration is a string, it is the real path to the file to load);
- inheritance management (a configuration can extend another one);
- configuration analysis and errors control;
- for _TypeScript_ users, fully typed, including the configuration itself.

# Language/langue

Because Slune is French firm, you will find all documents and messages in French. Other translations are welcome.

Anyway, because English is the language of programming, the code, including variable names and comments, are in English.

:fr: Une version française de ce document se trouve [ici](doc/fr/README.md).

# Installation

Installation is done using `npm install` command:

```bash
$ npm install --save confinode
```

If you prefer using `yarn`:

```bash
$ yarn add confinode
```

# Usage

Choose your manual:

- Node.js application developers, you will be interested in the [developer manual](doc/en/devmanual.md);
- final user of an application including _confinode_, you will be interested in the [user manual](doc/en/usermanual.md).

# Issues, questions, contributions

Even though we cannot guarantee a response time, please feel free to file an issue if you have any question or problem using the package. _Pull Requests_ are also welcome.
