import InternalResult from './InternalResult'

/**
 * A result based on real data and file name.
 */
export default class DirectResult<T> extends InternalResult<T> {
  public readonly configuration: T

  /**
   * Create the result.
   *
   * @param data - The result data.
   * @param fileName - The name of the file from which data have been extracted.
   */
  public constructor(data: T, public readonly fileName?: string) {
    super()
    this.configuration = data
    Object.freeze(this)
  }
}
