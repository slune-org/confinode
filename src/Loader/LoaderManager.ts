import Loader from './Loader'
import { LoaderDescription, loaderDescriptions } from './loaders'

/**
 * Replace the description when loader is loaded.
 */
interface LoadedLoader {
  name: string
  loader: Loader
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
  return 'loader' in description
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
  private readonly descriptions: { [type: string]: LoaderOrDescription[] }

  /**
   * The file types, ordered from most precise to least.
   */
  public readonly availableTypes: ReadonlyArray<string>

  /**
   * Create the loader manager.
   *
   * TODO Add the custom loaders.
   */
  public constructor() {
    // Copy the description because objects will be modified
    this.descriptions = Object.entries(loaderDescriptions).reduce((prev, [ext, descriptions]) => {
      prev[ext] = descriptions.map(description => ({ ...description }))
      return prev
    }, {} as { [type: string]: LoaderOrDescription[] })
    this.availableTypes = Object.keys(this.descriptions).sort((a, b) => b.length - a.length)
  }

  /**
   * Get the loader for the given file name.
   *
   * @param paths - The extra paths where modules are searched.
   * @param filename - The (base) name of the file to search.
   * @param extension - The extension of the file if already known.
   * @returns The most appropriate loader or undefined if none found.
   */
  public getLoaderFor(paths: string[], filename: string, extension?: string): LoadedLoader | undefined {
    const foundModuleOrDescription = this.availableTypes
      .filter(availableType =>
        extension ? availableType === extension : filename.endsWith('.' + availableType)
      )
      .reduce((previous, type) => [...previous, ...this.descriptions[type]], [] as LoaderOrDescription[])
      .map<[LoaderOrDescription, string | undefined]>(description => [
        description,
        isLoadedLoader(description) || !description.module
          ? undefined
          : searchModulePath(description.module, paths),
      ])
      .find(([description, path]) => isLoadedLoader(description) || !description.module || !!path)
    if (!foundModuleOrDescription) {
      return undefined
    }
    const [loaderOrDescription, modulePath] = foundModuleOrDescription
    if (!isLoadedLoader(loaderOrDescription)) {
      // Load the loader and mutate the object
      const required: any = modulePath ? require(modulePath) : undefined
      const loader = new loaderOrDescription.Loader(required)
      ;((loaderOrDescription as unknown) as LoadedLoader).loader = loader
      'module' in loaderOrDescription && delete loaderOrDescription.module
      delete loaderOrDescription.Loader
    }
    assertIsLoadedLoader(loaderOrDescription)
    return loaderOrDescription
  }
}
