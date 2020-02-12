import Loader, { LoaderDescription, LoaderType } from './Loader'

/**
 * Loader descriptions, automatically filled by `ts-transform-auto-require`.
 */
const loaderDescriptions: { [key: string]: LoaderType<any> } = {}

/**
 * The description, as internally used by the manager.
 */
type InternalDescription = { name: string } & Omit<LoaderDescription, 'filetypes'>

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
type LoaderOrDescription = InternalDescription | LoadedLoader

/**
 * Indicate if the description is a loader description.
 *
 * @param value - The description to check.
 * @returns True if loader description.
 */
function isLoaderDescription(
  value: { name: string } & LoaderType<any>
): value is { name: string } & LoaderDescription {
  return 'filetypes' in value
}

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
  if (!isLoadedLoader(description)) {
    throw new Error('Description should contain a loaded loader')
  }
}

/**
 * Try to resolve the module to see if it is available.
 *
 * @param moduleName - The name of the module.
 * @returns True if module found.
 */
function isModuleAvailable(moduleName: string): boolean {
  try {
    require.resolve(moduleName)
    return true
  } catch {
    return false
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
   * TODO Add the base path(s).
   * TODO Add the custom loaders.
   */
  public constructor() {
    this.descriptions = Object.entries(loaderDescriptions)
      .map(([name, description]) => ({ ...description, name }))
      .filter(isLoaderDescription)
      .reduce((previous, loaderDescription) => {
        const { filetypes, ...description } = loaderDescription
        new Array<string>().concat(filetypes).forEach(filetype => {
          if (!filetype) {
            throw new Error('Empty file type is forbidden')
          }
          if (!(filetype in previous)) {
            previous[filetype] = []
          }
          previous[filetype].push(description)
        })
        return previous
      }, {} as { [type: string]: LoaderOrDescription[] })
    this.availableTypes = Object.keys(this.descriptions).sort((a, b) => b.length - a.length)
  }

  /**
   * Get the loader for the given file name.
   *
   * @param filename - The (base) name of the file to search.
   * @param extension - The extension of the file if already known.
   * @returns The most appropriate loader or undefined if none found.
   */
  public getLoaderFor(filename: string, extension?: string): LoadedLoader | undefined {
    const loaderOrDescription = this.availableTypes
      .filter(availableType =>
        extension ? availableType === extension : filename.endsWith('.' + availableType)
      )
      .reduce((previous, type) => [...previous, ...this.descriptions[type]], [] as LoaderOrDescription[])
      .find(
        description =>
          isLoadedLoader(description) || !description.module || isModuleAvailable(description.module)
      )
    if (!loaderOrDescription) {
      return undefined
    }
    if (!isLoadedLoader(loaderOrDescription)) {
      // Load the loader and mutate the object
      const loader = new loaderOrDescription.Loader()
      ;((loaderOrDescription as unknown) as LoadedLoader).loader = loader
      'module' in loaderOrDescription && delete loaderOrDescription.module
      delete loaderOrDescription.Loader
    }
    assertIsLoadedLoader(loaderOrDescription)
    return loaderOrDescription
  }
}
