# Developer manual

The purpose of this manual is to help you to integrate _confinode_ in your Node.js application.

# tl;dr

```javascript
import { Confinode } from 'confinode'
import { description } from './configDescription'

async function startUp(configFile) {
  const confinode = new Confinode('gameofthrones', description)
  const configResult =
    await (configFile ? confinode.load(configFile) : confinode.search())
  const configuration = configResult.configuration
  ...
}
```

In order to use _confinode_, you just have to create a `Confinode` object, then either load a known-named file or search the most accurate configuration file. Even if not recommended, it is possible to omit the `description` in the constructor.

# Description

Providing a description is not mandatory. This allow to gradually integrate _confinode_. Anyway, this should only be a transient step, because lack of configuration will prevent _confinode_ from:

- check user provided configuration validity;
- ~~correctly merge an inherited configuration.~~ (:construction: TODO: WIP)

For a _TypeScript_ user, configuration description should start with configuration type definition. For example:

```typescript
interface Configuration {
  server: {
    url: string
    port: number
  }
  apiId?: string
  rules: Array<
    | {
        name: string
        active: boolean
        mode: 'flat' | 'deep' | 'mixed' | 0 | 1
      }
    | string
  >
}
```

Once this step completed, you can write matching description. Thanks to its type-checking, _TypeScript_ will check that the description really matches the type definition:

```typescript
const description = literal<Configuration>({
  server: literal({
    url: stringItem('localhost'),
    port: numberItem(8080),
  }),
  apiId: optional(stringItem()),
  rules: singleOrArray(
    conditional(
      data => typeof data === 'string',
      stringItem(),
      literal({
        name: stringItem(),
        active: booleanItem(),
        mode: choiceItem(['flat', 'deep', 'mixed', 0, 1]),
      })
    )
  ),
})
```

If you want to code in plain _JavaScript_, you will just have to remove the configuration definition reference:

```diff
-const description = literal<Configuration>({
   server: literal({
+const description = literal({
   server: literal({
```

Note that configuration description should always start by a `literal`. Otherwise _confinode_ may have an unexpected behavior.

The element descriptions lies in [this file](../../src/ConfigDescription/helpers.ts).

# Constructor

The `Confinode` constructor takes 3 parameters:

- the “technical” application name, used to search for matching files;
- the description — if not provided, `anyItem()` will be used, which allow to read any configuration without any control;
- possible options (see below) in an object literal.

## “cache” option

When cache is active, the library records the configuration found for a given file or folder, and the file list in each visited folder.

The `cache` option is a boolean allowing to control if recording in the cache should be active. By default, this option is `true` and cache is active.

In case of problem, it is possible to clear the cache with the `clearCache()` method.

## “searchStop” option

The `searchStop` option is a string indicating the folder after which searching for a configuration file stops. By default, this option is set to the user home folder.

When _confinode_ searches for a configuration file, if no matching file is found in the current folder, it is searched in the parent folder, and so on, until it reach either the folder indicated by `searchStop` or the root of the file system.

## “logger” option

The library is regularly emitting some messages with different levels: _error_, _warning_, _information_ and _trace_. By default, _error_ messages are displayed on error output and _warning_ messages on standard output. Others are ignored.

With the `logger` option, you can specify a function taking a [Message](../../src/messages/Message.ts) single parameter and returning nothing. This can allow you, for example, to display more details or translate messages. The translation is eased by the fact that the `Message` object holds a message identifier of which you will find the list in [this file](../../src/messages/messages.ts), and the parameters to use.

## “files” option

By default, when _confinode_ is searching for a configuration file for the _gameofthrones_ application, it uses the following list:

- the `gameofthrones` entry in the `package.json` file;
- the file `.gameofthronesrc` formatted as `YAML` or `JSON`;
- a file `.gameofthronesrc` with one of the managed extension;
- a file `gameofthrones.config` with one of the managed extension;
- a file `.gameofthrones/gameofthrones.config` with one of the managed extension.

Even if this is not recommended, in order not to break user experience for your application, it is possible to modify this list by giving a `files` option in two ways:

- by giving an array of filter functions taking as input and returning an array of file descriptions — the pre-defined `noPackageJson` filter can be used to remove the `package.json` file from the list;
- by directly providing an array of file descriptions.

It is anyway not possible to merge file descriptions and filters in the parameter.

A file description is:

- either a file name without extension, but with a sub-folder if needed (e.g. `.gameofthrones/gameofthrones.config`), for which all managed extensions will be tested;
- either an object literal with the `name` property containing the exact name of the file (including extension) and a `loader` property containing an instance of the loader to use.

## “mode” option

Configuration search or load methods are by default asynchronous and returning a promise. But it is possible to change to synchronous using the `mode` option. This option either take the value `async` (default) for an asynchronous behavior or `sync` for a synchronous behavior.

Note that even after specifying the default mode, it is still possible to use explicitly synchronous or asynchronous methods on a case by case basis.

# Search and load

## Search

Searching a configuration is done using the `search(searchStart)` method. The optional parameter `searchStart` is the folder where the search starts. If not provided, search will start in current folder.

By default, this method is asynchronous and returns a promise. In this case, there is a `search.sync(searchStart)` method doing the same but in synchronous mode.

If the `Confinode` object was parameterized in synchronous mode, this method directly returns the result. In this case, there is a `search.async(searchStart)` method doing the same but in asynchronous mode.

## Load

Loading a configuration is done using the `load(name)` method. The `name` parameter represents the file to load. ~~The real file place will be search with the `require.resolve()` function~~ (:construction: TODO: WIP). It then can be a relative or absolute file name, ~~or a reference to a module~~ (:construction: TODO: WIP).

By default, this method is asynchronous and returns a promise. In this case, there is a `load.sync(name)` method doing the same but in synchronous mode.

If the `Confinode` object was parameterized in synchronous mode, this method directly returns the result. In this case, there is a `loan.async(name)` method doing the same but in asynchronous mode.

## Result

The result of search or load is a `ConfinodeResult` object. This object contains:

- the `configuration` property with the files extracted configuration;
- the `fileName` property, with the same structure as the configuration, but where each final element is actually a string containing the name of the file from which the configuration element was loaded;
- the `files` property of `ResultFile` type.

The `ResultFile` type itself contains 2 properties:

- `name` is the loaded file name;
- `extends` is an array of `ResultFile` ~~containing the inherited configuration files~~ (:construction: TODO: WIP).

# Create additional tools

The purpose of _confinode_ is to be an universal configuration loader. If you notice that a feature is missing, please do not hesitate and file an issue or submit a _Pull Request_. However, especially if you have a very specific need, you also can create additional configuration descriptions or loaders.

## Configuration description

A configuration description is an object accepting the `parse(data, context)` method. This method takes the data to parse and the parsing context as parameters and returns a `ConfinodeResult` object or `undefined` if there is no result. Beware to never return `undefined` during the final parse, because this one must return a result to the application. On the other hand, it is possible to return a `ConfinodeResult` containing the `undefined` value if needed.

You can, of course, eventually extend one of the already existing description class in order to modify its behavior. The [LeafItemDescription](../../src/ConfigDescription/ConfigDescription/LeafItemDescription.ts) class is an abstract class designed for basic parsings. It already does some controls and simply leave the inheriting classes process the parse in a `parseValue(value, fileName, keyName)` method which must directly return the parsing result.

The parsing context contains:

- the name of the key `keyName` currently being parsed;
- the name of the file `fileName` currently being parsed;
- the possible analysis results (`ConfinodeResult`) of the inherited files in the `parent` property;
- a `final` boolean indicating if it is the final analysis.

The `ConfinodeResult` object:

- may be created using `new ConfinodeResult(true, data, fileName)` where `data` is the direct result of the analysis and `fileName` the name of the file in which this data was found — this file name might be omitted, especially if the result is, for example, a default value;
- may be created using `new ConfinodeResult(false, children)` where the result is actually dispatched between `children` given as parameter — this parameter must either be an object literal containing `ConfinodeResult` values or an array of `ConfinodeResult`;
- contains a `children` data referencing the possible children containing the result — access to this data is designed for configuration file merges.

For _TypeScript_ users, description classes should implement the [ConfigDescription](../../src/ConfigDescription/ConfigDescription/ConfigDescription.ts) interface.

As examples, you can have a look at the [ConfigDescription](../../src/ConfigDescription) folder to see how current descriptions are written.

In order to lighten the writing, delivered configuration descriptions are not directly exported because the are created through helper functions (see [this file](../../src/ConfigDescription/helpers.ts)). Of course, you can do the same for your own configuration descriptions.

## Loader

:construction: TODO: WIP
