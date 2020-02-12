import ConfinodeError from '../../ConfinodeError'
import ConfinodeResult from '../../ConfinodeResult'
import { Level, Message } from '../../messages'
import { isExisting } from '../../utils'
import ConfigDescription, { ParserContext } from '../ConfigDescription'

/**
 * Description of an array.
 */
export default class ArrayDescription<T> implements ConfigDescription<T[]> {
  /**
   * Create the array description.
   *
   * @param description - The description to replicate for each array item.
   */
  public constructor(protected readonly description: ConfigDescription<T>) {}

  public parse(data: unknown, context: ParserContext<T[]>): ConfinodeResult<T[]> | undefined {
    const { fileName, keyName, parent, final } = context
    if (Array.isArray(data)) {
      return this.mergeArray(data, context)
    } else if (data !== undefined && data !== null) {
      throw new ConfinodeError('expected', keyName, fileName, new Message(Level.Error, 'expectedArray'))
    } else if (data === undefined && parent) {
      return parent
    } else if (!final) {
      return undefined
    } else {
      throw new ConfinodeError('missingMandatory', keyName)
    }
  }

  /**
   * Parse and merge the array content. The default behavior is to concatenate the child nodes to the parsed
   * parent ones.
   *
   * @param data - The array to parse and merge.
   * @param context - The parsing context.
   * @returns The parsed and merged array.
   */
  protected mergeArray(data: any[], context: ParserContext<T[]>): ConfinodeResult<T[]> {
    const parent = (context.parent?.children as ConfinodeResult<T>[]) ?? []
    return new ConfinodeResult(
      false,
      parent.concat(
        data
          .map((item, index) =>
            this.description.parse(item, {
              ...context,
              keyName: `${context.keyName}[${index}]`,
              parent: undefined,
            })
          )
          .filter(isExisting)
      )
    )
  }
}
