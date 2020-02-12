import { relative, sep } from 'path'

/**
 * The loader class. A loader is able to load a file of a given type.
 */
export default interface Loader {
  /**
   * Load the given file.
   *
   * @param filename - The name of the file to load.
   * @returns The content or undefined if content not found.
   */
  load(filename: string): any | undefined

  /**
   * Asynchronously load the given file. May not exist on all loaders.
   *
   * @param filename - The name of the file to load.
   * @returns The content or undefined if content not found.
   */
  asyncLoad?(filename: string): Promise<any | undefined>
}

/**
 * A loader type. If it is not a `LoaderDescription`, it will not be automatically used by the loader
 * manager, but may be directly provided for a given file (e.g. the `package.json` entry loader).
 */
export interface LoaderType<T extends any[]> {
  Loader: new (..._: T) => Loader
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
  Loader: new () => Loader
}

/**
 * The babel files regular expression. Taken from the Gulp “interpret” project:
 * https://github.com/gulpjs/interpret.
 */
const endsInBabelJs = /\.babel\.[jt]s(x)$/

/**
 * Check if file is a babel or node module. Taken from the Gulp “interpret” project:
 * https://github.com/gulpjs/interpret.
 *
 * @param file - The file to test.
 * @returns False if file is babel or node module and should not be ignored.
 */
export function ignoreNonBabelAndNodeModules(file: string) {
  return (
    !endsInBabelJs.test(file) &&
    relative(process.cwd(), file)
      .split(sep)
      .indexOf('node_modules') >= 0
  )
}

/**
 * An abstract class for loaders based on register/require.
 */
export abstract class RequiringLoader implements Loader {
  public constructor(
    description: undefined | string | { moduleName: string; register: (required: any) => void }
  ) {
    if (description) {
      if (typeof description === 'string') {
        require(description)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const required = require(description.moduleName)
        description.register(required)
      }
    }
  }

  public load(filename: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let result = require(filename)
    if (result && result.__esModule && result.default) {
      result = result.default
    }
    return result
  }
}
