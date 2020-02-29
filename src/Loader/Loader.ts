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
  load(fileName: string): unknown | undefined

  /**
   * Asynchronously load the given file. May not exist on all loaders.
   *
   * @param fileName - The name of the file to load.
   * @returns The content or undefined if content not found.
   */
  asyncLoad?(fileName: string): Promise<unknown | undefined>
}

/**
 * A loader type. If it is not a `LoaderDescription`, it will not be automatically used by the loader
 * manager, but may be directly provided for a given file (e.g. the `package.json` entry loader).
 */
export interface LoaderType<T extends any[]> {
  Loader: new (required: any, ..._: T) => Loader
}
