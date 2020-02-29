import Loader, { LoaderType } from './Loader'

/**
 * The description of a loader.
 */
export default interface LoaderDescription extends LoaderType<[]> {
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
