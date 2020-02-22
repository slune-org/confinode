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
- in the `.starwarsrc` file with one of the managed extensions;
- in the `starwars.config` file with one of the managed extensions;
- in the `.starwars/starwars.config` file with one of the managed extensions.

Please note that if multiple files with same priority are accessible (with different extensions), application will arbitrarily select one and display a warning.

The configuration file is first searched in the current folder then, if not found, in the parent folder, and so on until the user home folder.

# Indirection

It is possible to use indirections. If, for example, you put all your configuration files in a specific place, but you do not want to give this place each time you call the application, you can specify this place in one of the automatically searched files. For this, the file just have to return a string which will be used as true configuration file name.

So, for _starwars_ application, you can use the `starwars` entry of `package.json` not to put the full configuration, but to give the real path to the configuration file to use.

Note that if you give a relative file name in your indirection, the file will be searched relative to the place of the current configuration file.

# Inheritance

It is possible to write a configuration file which inherit from one or more other files. This may be useful if, for example, you have a company global configuration to which you wish to add you specificities or, in the case of theme-oriented configuration files that you want to merge.

In order to do that, you have to add to your configuration object a key named `extends` which contains either directly the name of the file to inherit from or an array of file names to inherit from. If you inherit from multiple files, they are taken in the specified order, the data of the latter can replace the one of the formers.

Note that if you give a relative file name in your `extends` entry, the file will be searched relative to the place of the current configuration file.
