# Manuel du développeur

L'objectif de ce document est de vous aider à intégrer _confinode_ dans votre application Node.js.

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

Pour utiliser _confinode_, il suffit de construire un objet `Confinode`, puis de soit charger un fichier dont on connait le nom, soit rechercher le fichier de configuration le plus approprié. Même si cela n'est pas recommandé, il est possible de ne pas fournir de `description` au constructeur.

# Description

Fournir une description n'est pas obligatoire. Cela peut permettre d'intégrer progressivement _confinode_. Toutefois, cela ne devrait être qu'une étape transitoire, car l'absence de configuration empêchera _confinode_ de :

- vérifier la validité de la configuration fournie par l'utilisateur ;
- fusionner correctement une configuration héritée.

Pour un utilisateur de _TypeScript_, la description de la configuration devrait commencer par la définition de son type. Par exemple :

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

Une fois cela fait, on peut écrire la description correspondante. Grâce à son système de typage, _TypeScript_ va s'assurer que la description corresponde bien à la définition du type :

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

Si vous souhaitez coder en pure _JavaScript_, il faudra simplement retirer la référence à la définition de la configuration :

```diff
-const description = literal<Configuration>({
   server: literal({
+const description = literal({
   server: literal({
```

Notez que la description de configuration devrait toujours commencer par un `literal`. Dans le cas contraire, _confinode_ pourrait avoir un comportement inattendu.

Les différents éléments de description se trouvent dans [ce fichier](../../src/ConfigDescription/helpers.ts).

# Constructeur

Le constructeur de `Confinode` prend 3 paramètres :

- le nom « technique » de l'application, utilisé pour chercher les fichiers correspondants ;
- la description — si elle n'est pas fournie, `anyItem()` est utilisé, permettant de lire une configuration quelconque sans aucun contrôle ;
- les éventuelles options (voir ci-dessous) dans un littéral d'objet.

## Option « cache »

Lorsque le cache est activé, la bibliothèque enregistre la configuration trouvée pour un fichier ou un dossier donné, ainsi que les listes de fichiers dans chaque dossier visité.

L'option `cache` est un booléen permettant de contrôler si l'enregistrement en cache doit être actif. Par défaut, l'option est à `true` et le cache est activé.

En cas de problème, il est possible de vider le cache avec la méthode `clearCache()`.

## Option « searchStop »

L'option `searchStop` est une chaine de caractères indiquant le dossier au-delà duquel la recherche de fichier de configuration s'arrête. Par défaut, l'option est positionnée au dossier racine de l'utilisateur.

Lorsque _confinode_ recherche un fichier de configuration, si aucun fichier correspondant n'est trouvé dans le dossier en cours, il est recherché dans le dossier père, et ainsi de suite jusqu'à arriver soit au dossier indiqué par `searchStop`, soit à la racine du système de fichier.

## Option « modulePaths »

Les modules des chargeurs seront toujours recherchés par rapport au dossier courant et par rapport aux fichiers de configurations en cours de lecture. Dans le cas où votre application importe certains modules, vous voudrez peut-être ajouter son dossier. L'option `modulePaths` permet de donner une liste de dossier supplémentaires qui seront fournis à `require.resolve()` pour rechercher les modules.

Notez que le dossier courant est systématiquement ajouté et qu'il n'est donc pas utile de le préciser ici.

## Option « logger »

La bibliothèque émet régulièrement des messages de différents niveaux : _erreur_, _avertissement_, _information_ et _trace_. Par défaut, les messages de niveau _erreur_ sont affichés sur la sortie des erreurs et les messages de niveau _avertissement_ sur la sortie standard. Les autres sont ignorés.

Avec l'option `logger`, vous pouvez spécifier une fonction qui prend un paramètre unique [Message](../../src/messages/Message.ts) et ne renvoie rien. Cela peut vous permettre, par exemple, d'afficher plus de détails ou de traduire les messages. La traduction est facilité par le fait que l'objet `Message` se compose d'un identifiant de message dont vous trouverez la liste dans [ce fichier](../../src/messages/messages.ts), et des paramètres à utiliser.

## Option « files »

Par défaut, lorsque _confinode_ recherche un fichier de configuration pour l'application _gameofthrones_, il utilise la liste suivante :

- l'entrée `gameofthrones` du fichier `package.json` ;
- le fichier `.gameofthronesrc` au format `YAML` ou `JSON` ;
- un fichier `.gameofthronesrc` avec l'une des extensions gérées ;
- un fichier `gameofthrones.config` avec l'une des extensions gérées ;
- un fichier `.gameofthrones/gameofthrones.config` avec l'une des extensions gérées.

Même si cela est déconseillé pour ne pas perturber les utilisateurs de votre application, il est possible de modifier cette liste en définissant l'option `files` de deux façons :

- en donnant un tableau de fonctions de filtrage qui prennent en entrée et renvoie un tableau de descriptions de fichiers — le filtre pré-défini `noPackageJson` permet de retirer le fichier `package.json` de la liste ;
- en donnant directement un tableau de descriptions de fichiers.

Il n'est par contre pas possible de mélanger des descriptions de fichiers et des filtres dans le paramètre.

Une description de fichiers se présente :

- soit sous la forme d'un nom de fichier sans extension, mais avec un éventuel nom de sous-dossier (comme par exemple `.gameofthrones/gameofthrones.config`), auquel cas toutes les extensions gérées seront testées ;
- soit sous la forme d'un littéral d'objet avec la propriété `name` qui contient le nom exact du fichier (extension incluse) et la propriété `loader` qui contient une instance du chargeur à utiliser.

Pour la liste des extensions gérées, voir [ce fichier](../extensions.txt)

## Option « mode »

Les méthodes de recherche ou de chargement de la configuration fonctionnent par défaut en mode asynchrone et renvoient une promesse. Mais il est possible de passer en mode synchrone avec l'option `mode`. Cette option prend soit la valeur `async` (défaut) pour un fonctionnement asynchrone, soit la valeur `sync` pour un fonctionnement synchrone.

Notez que même après avoir spécifié le mode par défaut, il est possible d'utiliser les fonctions explicitement synchrones ou asynchrones au cas par cas.

# Recherche et chargement

## Recherche

La recherche d'une configuration se fait par la méthode `search(searchStart)`. Le paramètre optionnel `searchStart` est le dossier par lequel commence la recherche. Si ce paramètre n'est pas fourni, la recherche commence au dossier courant.

Par défaut, cette méthode fonctionne en mode asynchrone et renvoie une promesse. Dans ce cas, il existe la méthode `search.sync(searchStart)` qui aura la même fonctionnalité mais en mode synchrone.

Si l'objet `Confinode` a été configuré en mode synchrone, cette méthode renvoie directement le résultat. Dans ce cas, il existe la méthode `search.async(searchStart)` qui aura la même fonctionnalité mais en mode asynchrone.

## Chargement

Le chargement d'une configuration se fait par la méthode `load(name)`. Le paramètre `name` désigne le fichier à charger. L'emplacement réel du fichier sera cherché avec la fonction `require.resolve()`. Il peut donc s'agir d'un nom de fichier relatif ou absolu, ou d'une référence à un module.

Par défaut, cette méthode fonctionne en mode asynchrone et renvoie une promesse. Dans ce cas, il existe la méthode `load.sync(name)` qui aura la même fonctionnalité mais en mode synchrone.

Si l'objet `Confinode` a été configuré en mode synchrone, cette méthode renvoie directement le résultat. Dans ce cas, il existe la méthode `load.async(name)` qui aura la même fonctionnalité mais en mode asynchrone.

## Resultat

Le résultat de la recherche ou du chargement est un objet `ConfinodeResult`. Cet objet contient :

- la propriété `configuration` avec la configuration extraite des fichiers ;
- la propriété `fileName`, qui a la même structure que la configuration, sauf que chaque élément final est en réalité une chaine de caractère qui contient le nom du fichier duquel l'élément de configuration a été chargé ;
- la propriété `files` de type `ResultFile`.

Le type `ResultFile` contient lui-même deux propriétés :

- `name` est le nom du fichier qui a été chargé ;
- `extends` est un tableau de `ResultFile` contenant les fichiers de configuration hérités.

# Développer des outils supplémentaires

L'objectif de _confinode_ est d'être un chargeur de configuration universel. Si vous constatez qu'une fonctionnalité manque, n'hésitez pas à créer un incident ou à soumettre une _Pull Request_. Toutefois, en particulier si vous avez un besoin très spécifique, vous pourrez également créer des descriptions de configuration ou des chargeurs supplémentaires.

## Description de configuration

Une description de configuration est un objet qui accepte la méthode `parse(data, context)`. Cette méthode prend en paramètre la donnée à analyser et le contexte d'analyse et renvoie un objet `ConfinodeResult` ou `undefined` s'il n'y a pas de résultat. Attention à ne jamais renvoyer `undefined` lors de l'analyse finale, car celle-ci doit obligatoirement retourner un résultat à l'application. Il est par contre possible, le cas échéant, de créer un `ConfinodeResult` contenant la valeur `undefined`.

Vous pouvez bien sûr éventuellement étendre l'une des classes de description déjà existante afin d'en modifier le comportement. La classe [LeafItemDescription](../../src/ConfigDescription/ConfigDescription/LeafItemDescription.ts) est une classe abstraite prévue pour les analyses basiques. Elle effectue déjà un certain nombre de contrôles et laisse simplement les classes qui en héritent faire l'analyse par une méthode `parseValue(value, fileName, keyName)` qui doit renvoyer directement le résultat de l'analyse.

Le contexte d'analyse contient :

- le nom de la clé actuellement analysée `keyName` ;
- le nom du fichier actuellement analysé `fileName` ;
- les éventuels résultat d'analyse (`ConfinodeResult`) des fichiers hérités, dans la propriété `parent` ;
- un boolean `final` indiquant s'il s'agit de l'analyse finale.

L'objet `ConfinodeResult` :

- peut être créé par `new ConfinodeResult(true, data, fileName)` où `data` est le résultat direct de l'analyse et `fileName` le nom du fichier dans lequel cette donnée a été trouvée — ce nom de fichier peut être omis, en particulier si le résultat est, par exemple, une valeur par défaut ;
- peut être créé par `new ConfinodeResult(false, children)` où le résultat est en fait répartit entre les enfants indiqués dans `children` — ce paramètre doit être soit un littéral d'objet contenant des valeurs de type `ConfinodeResult`, soit un tableau de `ConfinodeResult` ;
- contient une donnée `children` référençant les éventuels enfants contenant le résultat — l'accès à cette donnée est prévu pour les cas de fusion de fichiers de configuration.

Si vous utilisez _TypeScript_, vos classes de description devraient implémenter l'interface [ConfigDescription](../../src/ConfigDescription/ConfigDescription/ConfigDescription.ts).

À titre d'exemples, vous pouvez regarder dans le dossier [ConfigDescription](../../src/ConfigDescription) comment les descriptions actuelles sont écrites.

Pour alléger l'écriture, les descriptions de configuration livrés ne sont pas directement exportés car elles sont créées par l'intermédiaire de fonctions d'aide (voir [ce fichier](../../src/ConfigDescription/helpers.ts)). Il vous est bien entendu possible de faire de même pour vos propres descriptions de configuration.

## Chargeur

:construction: TODO: WIP
