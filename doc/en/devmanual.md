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
- correctly merge an inherited configuration.

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

Note that the main `literal` object in description should not have an `extends` key. The `extends` key is used for inheritance by _confinode_ and removed from data before parsing.

The element descriptions lie in [this file](../../src/ConfigDescription/helpers.ts).

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

## “modulePaths” option

Loader modules are always searched based on current folder and on currently being read configuration files. In the event of your application importing some modules, you may want to add its folder. The `modulePaths` options accepts a single or an array of additional folders which will be provided to `require.resolve()` to search for modules.

Note that the current folder is always added and it is therefore useless to give it here.

## “logger” option

The library is regularly emitting some messages with different levels: _error_, _warning_, _information_ and _trace_. By default, _error_ messages are displayed on error output and _warning_ messages on standard output. Others are ignored.

With the `logger` option, you can specify a function taking a [Message](../../src/messages/Message.ts) single parameter and returning nothing. This can allow you, for example, to display more details or translate messages. The translation is eased by the fact that the `Message` object holds a message identifier of which you will find the list in [this file](../../src/messages/messages.ts), and the parameters to use.

## “files” option

By default, when _confinode_ is searching for a configuration file for the _gameofthrones_ application, it uses the following list:

- the `gameofthrones` entry in the `package.json` file;
- the file `.gameofthronesrc` formatted as _YAML_ or _JSON_;
- a file `.gameofthronesrc.*` with one of the [managed extensions](../extensions.md);
- a file `gameofthrones.config.*` with one of the [managed extensions](../extensions.md);
- a file `.gameofthrones/gameofthrones.config.*` with one of the [managed extensions](../extensions.md).

Even if this is not recommended, in order not to break user experience for your application, it is possible to modify this list with the `files` option in two ways:

- by giving an array of filter functions taking as input and returning an array of file descriptions — the pre-defined `noPackageJson` filter can be used to remove the `package.json` file from the list;
- by directly providing an array of file descriptions.

It is anyway not possible to merge file descriptions and filters in the parameter.

A file description is:

- either a file name without extension, but with a sub-folder if needed (e.g. `.gameofthrones/gameofthrones.config`), for which all managed extensions will be tested;
- either an object literal with the `name` property containing the exact name of the file (including extension) and a `loader` property containing an instance of the loader to use.

## “customLoaders” option

The default loaders list included in _confinode_ wants to be somehow exhaustive. There may anyway be cases where you want to use (very specific) file types which are not (yet) included in _confinode_. In this case, you can [create appropriate loaders](#loader) and specify them in the `customLoaders` options.

This option is an object literal which takes the name you wish to give to the loader as key. In order not to overwrite default loaders, the name you give will be prefixed by the application name followed by the `#` character. As value, the object takes another object literal conforming to the [LoaderDescription](../../src/Loader/Loader.ts) interface, i.e. containing:

- a `filetypes` entry with the extension or extensions managed by this loader (**without** the preceding `.` character) as a string or string array;
- an optional `module` entry containing the name of a module (or sub-module) to require for the loader to work — if the module is not found, the loader will be considered inexistent;
- a `Loader` entry containing the constructor function (the class name) of the loader.

If the loaders specified in this option manage the same extensions as default loaders, the former will replace the latter, which will then be no more usable. If you prefer adding your loaders to the default ones, you have to merge them by yourself:

```javascript
import { defaultLoaders } from 'confinode/Loader/loaders'
import MyCustomLoader from './MyCustomLoader'

const customLoaders = { ...defaultLoaders, { myCustomLoader: { filetypes: ['jsx', 'tsx'], Loader: MyCustomLoader } } }
const confinode = new Confinode('gameofthrones', description, { customLoaders })
```

Note that in this case, all loaders will have their name prefixed with the application name followed by the `#` character. It is therefore up to you to take care not to give your loader a name that conflicts with an existing loader.

## “mode” option

Configuration search or load methods are by default asynchronous and returning a promise. But it is possible to change to synchronous using the `mode` option. This option either take the value `async` (default) for an asynchronous behavior or `sync` for a synchronous behavior.

Note that even after specifying the default mode, it is still possible to use explicitly synchronous or asynchronous methods on a case by case basis.

# Search and load

## Search

Searching a configuration is done using the `search(searchStart)` method. The optional parameter `searchStart` is the folder where the search starts. If not provided, search will start in current folder.

By default, this method is asynchronous and returns a promise. In this case, there is a `search.sync(searchStart)` method doing the same but in synchronous mode.

If the `Confinode` object was parameterized in synchronous mode, this method directly returns the result. In this case, there is a `search.async(searchStart)` method doing the same but in asynchronous mode.

## Load

Loading a configuration is done using the `load(name)` method. The `name` parameter represents the file to load. The real file place will be searched using the `require.resolve()` function. It can then be a relative or absolute file name, or a reference to a module .

By default, this method is asynchronous and returns a promise. In this case, there is a `load.sync(name)` method doing the same but in synchronous mode.

If the `Confinode` object was parameterized in synchronous mode, this method directly returns the result. In this case, there is a `loan.async(name)` method doing the same but in asynchronous mode.

## Result

The result of search or load is a `ConfinodeResult` object. This object contains:

- the `configuration` property with the files extracted configuration;
- the `fileName` property, with the same structure as the configuration, but where each final element is actually a string containing the name of the file from which the configuration element was loaded;
- the `files` property of `ResultFile` type.

The `ResultFile` type itself contains 2 properties:

- `name` is the loaded file name;
- `extends` is an array of `ResultFile` containing the inherited configuration files.

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

In order to lighten the writing, delivered configuration descriptions are not directly exported because they are created through helper functions (see [this file](../../src/ConfigDescription/helpers.ts)). Of course, you can do the same for your own configuration descriptions.

## Loader

A loader is a class for which the constructor takes a parameter of an unknown type. It is the possible module required to make the loader work or, if no module, the `undefined` value. When _confinode_ will have to load a file which extension is managed by the loader, the library will first require the possible module, then, if successful, will call the loader constructor, giving it the loaded module as parameter.

The loader instance:

- must have the `load(fileName)` method to synchronously load the file and return the result or `undefined` if no result;
- can have the `asyncLoad(fileName)` method to asynchronously load the file and return a promise containing the result or `undefined` if no result.

Note that these methods might return `undefined` **when there is no result** (typically for the `package.json` file without an entry for the application). On the other hand, they must never return `undefined` in case of an error otherwise the error will be silently ignored. In case of error, the methods should throw an exception.

For _TypeScript_ users, loader classes should implement the [Loader](../../src/Loader/Loader.ts) interface.

# FAQ

## How can I make my application support the format [whichever] out-of-the-box?

If the format you want to support out-of-the-box is not managed at all by _confinode_, you will have to [write a loader](#loader) and to [add](#customloaders-option) it to _confinode_ constructor options.

But if you just want, for example, that your application support the _TOML_ format without the need for the user to have any manipulation to do, you just have to add one of the modules managing the format as a dependency of your application and to add your application folder to the constructor `modulePaths` option:

```javascript
const confinode = new Confinode('gameofthrones', description, { modulePaths: __dirname })
```

## Why aren't all formats supported out-of-the-box?

The library support _JavaScript_, _JSON_ and _YAML_ out-of-the-box. The first two because Node.js support them out-of-the-box, the last one because it is a standard that a file like `.gameofthronesrc` can be written in _JSON_ or in _YAML_.

No parser of any other format is included in the library in order to keep it light. Manipulations to do to use another format are simple enough, and most of the time, already done. Indeed, if, for example, you are used to write you projects in _TypeScript_, you probably already have in your project the required modules for _confinode_ can read the _TypeScript_ files.

## Why use the Node.js `require` method?

As far as possible _confinode_ **does not use** the `require` method to load the configuration files, and prefers to use the parsing methods of the available modules.

However, files written in a variant of _JavaScript_ can themselves directly import other files written in this variant without _confinode_ being able to control it. For this reason, the library uses the functionality of these modules to subscribe to `require` calls and in this case, actually uses this method to load files.

## Is it possible to use absolute path in “files” option?

It is totally possible to give an absolute path for a configuration file in the `files` option, whether without extension or with (directly providing loader). Pay attention however to the file search order. Indeed, as files are first searched in the start folder (current folder by default) before being searched in parent folders, it means that a file with an absolute path will have higher priority than a file with relative path but found in a higher folder than the start one.

Note that, as could be expected, files with an absolute name are searched only once, on the contrary of others which are first searched in start folder, and then again in each parent folder.
