import { unique } from '../utils'

import Loader from './Loader'
import { LoaderDescription, analyzeLoaders, extensionsLoaders, loaderDescriptions } from './loaders'

/**
 * Replace the description when loader is loaded.
 */
interface LoadedLoader {
  loader__: Loader
}

/**
 * Either a loader description, or an already loaded loader.
 */
type LoaderOrDescription = LoaderDescription | LoadedLoader

/**
 * Indicate if the description is a loaded loader.
 *
 * @param description - The description to check.
 * @returns True if loaded loader.
 */
function isLoadedLoader(description: LoaderOrDescription): description is LoadedLoader {
  return 'loader__' in description
}

/**
 * Asserts that the description contains a loaded loader.
 *
 * @param description - The description to test.
 */
function assertIsLoadedLoader(description: LoaderOrDescription): asserts description is LoadedLoader {
  /* istanbul ignore if */
  if (!isLoadedLoader(description)) {
    throw new Error('Description should contain a loaded loader')
  }
}

/**
 * Try to resolve the module.
 *
 * @param moduleName - The name of the module.
 * @param paths - The paths where modules are searched.
 * @returns The path of the file to load.
 */
function searchModulePath(moduleName: string, paths: string[]): string | undefined {
  try {
    return require.resolve(moduleName, { paths })
  } catch {
    return undefined
  }
}

/**
 * Used to detect where there are no available loaders.
 */
class NoAvailableLoaderError extends Error {}

/**
 * The loader manager is responsible of selecting the appropriate loader for each file.
 */
export default class LoaderManager {
  /**
   * Loader descriptions per description name.
   */
  private readonly descriptions: { [name: string]: LoaderOrDescription }

  /**
   * The loaders for each extension.
   */
  private readonly extensionsLoaders: { [type: string]: ReadonlyArray<string> }

  /**
   * The file types, ordered from most precise to least.
   */
  public readonly availableTypes: ReadonlyArray<string>

  /**
   * Create the loader manager.
   *
   * @param applicationName - The application name, used to name custom loaders.
   * @param customLoaders - The custom loaders which will be added/replace the provided ones.
   */
  public constructor(applicationName: string, customLoaders: { [name: string]: LoaderDescription }) {
    const [customDescription, customExtensionsLoaders] = analyzeLoaders(
      customLoaders,
      applicationName + '#'
    )
    this.descriptions = { ...loaderDescriptions, ...customDescription }
    this.extensionsLoaders = { ...extensionsLoaders, ...customExtensionsLoaders }
    this.availableTypes = Object.keys(this.extensionsLoaders).sort((a, b) => b.length - a.length)
  }

  /**
   * Get the loader for the given file name.
   *
   * @param paths - The extra paths where modules are searched.
   * @param syncOnly - Do not use loaders if they cannot load synchronously.
   * @param fileName - The (base) name of the file to search.
   * @param extension - The extension of the file if already known.
   * @returns A generator of the most appropriate loader and its name, or undefined if none found.
   */
  public getLoaders(
    paths: string[],
    syncOnly: boolean,
    fileName: string,
    extension?: string
  ): Generator<[Loader, string], [Loader, string], void> | undefined {
    const loaderGenerator = this.createLoaders(
      paths,
      syncOnly,
      this.availableTypes
        .filter(availableType =>
          extension
            ? availableType === extension
            : fileName.length > availableType.length + 1 && fileName.endsWith('.' + availableType)
        )
        .reduce((previous, type) => [...previous, ...this.extensionsLoaders[type]], [] as string[])
        .filter(unique)
        .map<[string, LoaderOrDescription]>(loaderName => [loaderName, this.descriptions[loaderName]])
    )
    try {
      loaderGenerator.next()
      return loaderGenerator
    } catch (e) {
      /* istanbul ignore next */
      if (e instanceof NoAvailableLoaderError) {
        return undefined
      } else {
        throw e
      }
    }
  }

  /**
   * Create an iterator over the loaders. Throws if no available iterator found.
   *
   * @param paths - The extra paths where modules are searched.
   * @param syncOnly - Do not use loaders if they cannot load synchronously.
   * @param matching - The loaders matching the given file name.
   * @returns The most appropriate loader and its name.
   */
  private *createLoaders(
    paths: string[],
    syncOnly: boolean,
    matching: Array<[string, LoaderOrDescription]>
  ): Generator<[Loader, string], [Loader, string], void> {
    let lastLoader: [Loader, string] | undefined
    let nextLoader: [Loader, string] | undefined
    for (const [loaderName, description] of matching) {
      let path: string | undefined
      if (!isLoadedLoader(description) && description.module) {
        path = searchModulePath(description.module, paths)
      }
      if (isLoadedLoader(description) || !description.module || !!path) {
        if (!isLoadedLoader(description)) {
          // Load the loader and update the object
          const required: any = path ? require(path) : undefined
          this.descriptions[loaderName] = { loader__: new description.Loader(required) }
        }
        const loadedLoader = this.descriptions[loaderName]
        assertIsLoadedLoader(loadedLoader)
        if (!syncOnly || loadedLoader.loader__.syncLoad) {
          nextLoader = [loadedLoader.loader__, loaderName]
        }
      }
      if (nextLoader) {
        if (!lastLoader) {
          yield nextLoader // Only for the first call
        } else {
          yield lastLoader
        }
        lastLoader = nextLoader
        nextLoader = undefined
      }
    }
    if (lastLoader) {
      return lastLoader
    } else {
      throw new NoAvailableLoaderError('No available loader')
    }
  }
}
