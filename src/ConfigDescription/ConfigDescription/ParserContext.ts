import { InternalResult, ParentResult } from '../../ConfinodeResult'

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
  readonly parent?: InternalResult<T>

  /**
   * If true, this is the final parsing before giving the resulting configuration.
   */
  final: boolean
}

interface ParentResultContext<T> extends ParserContext<T> {
  readonly parent?: ParentResult<T>
}

/**
 * Assert that the context parent either is a `ParentResult` or does not exist. This may be useful for
 * descriptions always creating parent results to ensure they can use the result `children` property.
 *
 * @param context - The context to assert.
 */
export function assertHasParentResult<T>(
  context: ParserContext<T>
): asserts context is ParentResultContext<T> {
  const { parent } = context
  /* istanbul ignore if */
  if (parent !== undefined && !(parent instanceof ParentResult)) {
    throw new Error('Unexpected type for result' + Object.getPrototypeOf(parent))
  }
}
