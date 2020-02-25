# User manual

The purpose of this manual is to help you to use an application integrating _confinode_. In this manual, we consider that the application is using _confinode_ with all default parameters. Please also refer to the application documentation in order to check possible specificities.

# Configuration format

The name of the configuration file provided to the application can be:

- an absolute path (e.g. `D:\\config.json`);
- a path relative to current folder (e.g. `../config/config.yaml`);
- a module accessible from the current folder (e.g. `tool-config`);
- a file of a module accessible from the current folder (e.g. `tool-config/recommended.js`).

Once the corresponding file found, the application will search for loader matching its extension. This loader may require that an additional module is accessible from the current folder.

The list of managed extensions with the required modules can be found in [this file](../extensions.md). You will see there that some extensions let you choose between multiple possible modules to use.

Once interpreted, your configuration file must return either an object literal or a string.

# Configuration search

If you don't provide a configuration file name, the application will search a file fro a list of standard names. For example, if your application is named _starwars_, its configuration will be searched, in this order:

- in a `starwars` entry of the `package.json` file;
- in the `.starwarsrc` file formatted as `YAML` or `JSON`;
- in the `.starwarsrc.*` file with one of the [managed extensions](../extensions.md);
- in the `starwars.config.*` file with one of the [managed extensions](../extensions.md);
- in the `.starwars/starwars.config.*` file with one of the [managed extensions](../extensions.md).

Please note that if multiple files with same priority are accessible (with different extensions), application will arbitrarily select one and display a warning.

The configuration file is first searched in the current folder then, if not found, in the parent folder, and so on until the user home folder.

# Indirection

It is possible to use indirections. If, for example, you put all your configuration files in a specific place, but you do not want to give this place each time you call the application, you can specify this place in one of the automatically searched files. For this, the file just have to return a string which will be used as true configuration file name.

Note that if you give a relative file name in your indirection, the file will be searched relative to the place of the current configuration file.

## Examples

In the following example, configuration will be in the file `/etc/starwars/config.yaml`:

```json
// package.json
{
  "starwars": "/etc/starwars/config.yaml"
}
```

In the following example, configuration will be in `/home/user/config/starwars.json`:

```javascript
// /home/user/starwars/application/.starwarsrc.js
module.exports = '../../config/starwars.json'
```

# Inheritance

It is possible to write a configuration file which inherit from one or more other files. This may be useful if, for example, you have a company global configuration to which you wish to add you specificities or, in the case of theme-oriented configuration files that you want to merge.

In order to do that, you have to add to your configuration object a key named `extends` which contains either directly the name of the file to inherit from or an array of file names to inherit from. If you inherit from multiple files, they are taken in the specified order, the data of the latter can replace the one of the formers.

Note that if you give a relative file name in your `extends` entry, the file will be searched relative to the place of the current configuration file.

## Example

In the following example, configuration will inherit in this order:

- from the main file of package `@stormtrooper/config`;
- from the file `laser.js` of package `deathstar` ;
- from the file `/home/user/starwars/rebel.json`.

The configuration will also overwrite the entry `apiKey` whether it is in one of the inherited files or not.

```yaml
# /home/user/starwars/application/.starwarsrc.yaml
extends:
  - '@stormtrooper/config'
  - 'deathstar/laser.js'
  - '../rebel.json'
apiKey: 'secret'
```

# FAQ

## Is it possible to create a module with my configuration?

It is of course possible to put a configuration file of any format in an external module. If this file is indicated as the main entry of the module (`main` key in `package.json` file), you will just have to give the module name to the application (using an indirection, for example). If not, you will have to indicate the file path inside the module, which allow to put many configurations for many applications inside the same module. For example, in order to load the `starwars.yaml` file which is inside the `config` folder of the `corporate-cfg` module, you will need to give: `corporate-cfg/config/starwars.yaml`.

## Is it possible to inherit from an indirection?

It is possible to mix inheritances and indirections up to infinity… Or at least, as far as the computer resources allow it. The only limit is that it is not possible to create cycles (recursion).

However, be careful that if too many files have to be read, this could saturate the library cache and therefore impact performance.
