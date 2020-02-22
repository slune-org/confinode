import { unique } from '../utils'

import Loader from './Loader'
import { LoaderDescription, extensionsLoaders, loaderDescriptions } from './loaders'

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
 * The loader manager is responsible of selecting the appropriate loader for each file.
 */
export default class LoaderManager {
  /**
   * Loader descriptions per file type.
   */
  private readonly descriptions: { [type: string]: LoaderOrDescription } = { ...loaderDescriptions }

  /**
   * The file types, ordered from most precise to least.
   */
  public readonly availableTypes: ReadonlyArray<string> = Object.keys(extensionsLoaders).sort(
    (a, b) => b.length - a.length
  )

  // TODO Add the custom loaders to public constructor() { }

  /**
   * Get the loader for the given file name.
   *
   * @param paths - The extra paths where modules are searched.
   * @param fileName - The (base) name of the file to search.
   * @param extension - The extension of the file if already known.
   * @returns The most appropriate loader and its name, or undefined if none found.
   */
  public getLoaderFor(paths: string[], fileName: string, extension?: string): [Loader, string] | undefined {
    const foundModuleOrDescription = this.availableTypes
      .filter(availableType =>
        extension
          ? availableType === extension
          : fileName.length > availableType.length + 1 && fileName.endsWith('.' + availableType)
      )
      .reduce((previous, type) => [...previous, ...extensionsLoaders[type]], [] as string[])
      .filter(unique)
      .map<[string, LoaderOrDescription]>(loaderName => [loaderName, this.descriptions[loaderName]])
      .map<[string, LoaderOrDescription, string | undefined]>(([loaderName, description]) => [
        loaderName,
        description,
        isLoadedLoader(description) || !description.module
          ? undefined
          : searchModulePath(description.module, paths),
      ])
      .find(([_, description, path]) => isLoadedLoader(description) || !description.module || !!path)
    if (!foundModuleOrDescription) {
      return undefined
    }
    const [name, loaderOrDescription, modulePath] = foundModuleOrDescription
    if (!isLoadedLoader(loaderOrDescription)) {
      // Load the loader and update the object
      const required: any = modulePath ? require(modulePath) : undefined
      this.descriptions[name] = { loader__: new loaderOrDescription.Loader(required) }
    }
    const loadedLoader = this.descriptions[name]
    assertIsLoadedLoader(loadedLoader)
    return [loadedLoader.loader__, name]
  }
}
