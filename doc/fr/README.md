# confinode - Gestion de la configuration des applications Node.js

Ce paquet fourni une bibliothèque qui se veut standard et universelle de gestion de fichiers de configuration pour les applications Node.js. Ces principales fonctionnalités sont :

- synchrone ou asynchrone… ou les deux ;
- cache des accès au système de fichiers ;
- recherche du fichier de configuration adéquat ;
- chargement du fichier de configuration à partir de son nom ~~ou d'un nom de module~~ (:construction: TODO: WIP) ;
- support d'un grand nombre de types de fichiers (support direct de _JavaScript_, _JSON_, _YAML_, support d'autres types si les modules adéquats peuvent être chargés) ;
- ~~gestion d'indirections (si la configuration est une chaine de caractère, il s'agit de l'emplacement réel du fichier à charger)~~ (:construction: TODO: WIP) ;
- ~~gestion d'héritage (une configuration peut en étendre une autre)~~ (:construction: TODO: WIP) ;
- analyse de la configuration et contrôle des erreurs ;
- pour les utilisateurs de _TypeScript_, complètement typé, y compris pour la configuration elle-même.

# Langue

Slune étant une entreprise française, vous trouverez tous les documents et messages en français. Les autres traductions sont bienvenues.

Cependant, l'anglais étant la langue de la programmation, le code, y compris les noms de variable et commentaires, sont en anglais.

# Installation

L'installation se fait avec la commande `npm install` :

```bash
$ npm install --save confinode
```

Si vous préférez utiliser `yarn` :

```bash
$ yarn add confinode
```

# Utilisation

Choisissez votre mode d'emploi :

- développeur d'une application Node.js, vous serez intéressé par le [manuel du développeur](devmanual.md) ;
- utilisateur final d'une application incluant _confinode_, vous serez intéressé par le [manuel de l'utilisateur](usermanual.md).

# Incidents, questions, contributions

Bien que nous ne puissions pas garantir un temps de réponse, n'hésitez pas à ouvrir un incident si vous avez une question ou un problème pour utiliser ce paquet. Les _Pull Requests_ sont également bienvenues.
