/**
 * The loader class. A loader is able to load a file of a given type.
 */
export default interface Loader {
  /**
   * Load the given file.
   *
   * @param fileName - The name of the file to load.
   * @returns The content or undefined if content not found.
   */
  load(fileName: string): any | undefined

  /**
   * Asynchronously load the given file. May not exist on all loaders.
   *
   * @param fileName - The name of the file to load.
   * @returns The content or undefined if content not found.
   */
  asyncLoad?(fileName: string): Promise<any | undefined>
}

/**
 * A loader type. If it is not a `LoaderDescription`, it will not be automatically used by the loader
 * manager, but may be directly provided for a given file (e.g. the `package.json` entry loader).
 */
export interface LoaderType<T extends any[]> {
  Loader: new (required: any, ..._: T) => Loader
}

/**
 * The description of a loader.
 */
export interface LoaderDescription extends LoaderType<[]> {
  /**
   * Type of the files managed by this loader.
   */
  filetypes: string | string[]

  /**
   * The module needed, if any, to use the loader.
   */
  module?: string

  /**
   * The loader type (constructor).
   */
  Loader: new (required: any) => Loader
}

/**
 * A class for loaders based on register/require.
 */
export class RequiringLoader implements Loader {
  public load(fileName: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let result = require(fileName)
    if (result && result.__esModule && result.default) {
      result = result.default
    }
    return result
  }
}
