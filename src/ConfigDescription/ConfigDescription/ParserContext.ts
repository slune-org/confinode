import ConfinodeResult from '../../ConfinodeResult'

/**
 * An object containing the parser context. This object is expected to be immutable.
 */
export default interface ParserContext<T> {
  /**
   * The name of the key currently being parsed.
   */
  readonly keyName: string

  /**
   * The name of the file currently being parsed.
   */
  readonly fileName: string

  /**
   * The parsing result of parent (extended) files, if any.
   */
  readonly parent?: ConfinodeResult<T>

  /**
   * If true, this is the final parsing before giving the resulting configuration.
   */
  final: boolean
}
