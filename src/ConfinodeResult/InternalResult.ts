/**
 * An internal result.
 */
export default abstract class InternalResult<T> {
  /**
   * The configuration.
   */
  public abstract readonly configuration: T

  /**
   * The name of the file containing the configuration. This object has the same hierarchy than the
   * configuration.
   */
  public abstract readonly fileName?: unknown
}
