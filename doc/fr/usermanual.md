# Manuel de l'utilisateur

L'objectif de ce document est de vous aider à utiliser une application qui intègre _confinode_. Ce document considère que l'application utilise _confinode_ avec le paramétrage par défaut. Consultez également la documentation de votre application afin d'en vérifier les éventuelles spécificités.

# Format de la configuration

Le nom du fichier de configuration que vous indiquez à votre application peut être :

- un chemin absolu (par exemple `D:\\config.json`) ;
- un chemin relatif au dossier courant (par exemple `../config/config.yaml`) ;
- un module accessible depuis le dossier courant (par exemple `tool-config`) ;
- un fichier d'un module accessible depuis le dossier courant (par exemple `tool-config/recommended.js`).

Une fois le fichier correspondant trouvé, l'application va rechercher un chargeur correspondant à son extension. Ce chargeur peut requérir qu'un module supplémentaire soit accessible depuis le dossier courant.

La liste des extensions gérées avec les modules requis se trouve dans [ce fichier](../extensions.txt). Vous y constaterez que certaines extensions vous laissent le choix entre plusieurs possibilités de modules à utiliser.

Une fois interprété, votre fichier de configuration doit renvoyer soit un littéral d'objet, soit une chaine de caractères.

# Recherche de la configuration

Si vous ne fournissez pas de nom de fichier de configuration, l'application va rechercher un fichier parmi une liste de noms standards. Par exemple, si votre application est nommée _starwars_, sa configuration sera recherchée dans cet ordre :

- dans une entrée `starwars` du fichier `package.json` ;
- dans le fichier `.starwarsrc` au format `YAML` ou `JSON` ;
- dans le fichier `.starwarsrc` avec l'une des extensions gérées ;
- dans le fichier `starwars.config` avec l'une des extensions gérées ;
- dans le fichier `.starwars/starwars.config` avec l'une des extensions gérées.

Notez que si plusieurs fichiers de même priorité sont accessibles (avec des extensions différentes), l'application en sélectionnera un de manière arbitraire et affichera un avertissement.

Le fichier de configuration est d'abord recherché dans le dossier courant puis, s'il n'est pas trouvé, dans le dossier père, et ainsi de suite jusqu'au dossier racine de l'utilisateur.

# Indirection

Il est possible d'utiliser des indirections. Si, par exemple, vous mettez tous vos fichiers de configuration dans un emplacement spécifique, mais que vous ne souhaitez pas préciser cet emplacement à chaque appel de l'application, vous pouvez indiquer cet emplacement dans l'un des fichiers automatiquement recherchés. Il suffit pour cela que le fichier renvoie une chaine de caractères. Celle-ci sera utilisée comme nom du véritable fichier de configuration.

Ainsi, pour l'application _starwars_, vous pouvez utiliser l'entrée `starwars` de `package.json` non pas pour y mettre l'intégralité de la configuration, mais juste l'emplacement du fichier de configuration à utiliser.

Notez que si vous indiquez un nom de fichier relatif dans votre indirection, le fichier sera recherché par rapport à l'emplacement du fichier de configuration actuel.

# Héritage

Il est possible d'écrire un fichier de configuration qui hérite d'un ou plusieurs autres. Cela peut être pratique si, par exemple, vous avez une configuration globale d'entreprise à laquelle vous souhaitez ajouter vos spécificités, ou encore, dans le cas de fichiers de configuration thématiques que vous souhaitez fusionner.

Pour ce faire, vous devez ajouter à votre objet de configuration une entrée `extends` qui contiendra soit directement le nom du fichier à hériter, soit un tableau de noms des fichiers à hériter. Si vous héritez de plusieurs fichiers, ceux-ci sont pris en compte dans l'ordre spécifié, les données du dernier pouvant écraser celles des précédents.

Notez que si vous indiquez un nom de fichier relatif dans votre entrée `extends`, le fichier sera recherché par rapport à l'emplacement du fichier de configuration actuel.
