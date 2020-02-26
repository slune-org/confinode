import ConfinodeError from '../../ConfinodeError'
import ConfinodeResult from '../../ConfinodeResult'
import { Level, Message } from '../../messages'
import ConfigDescription, { ParserContext } from '../ConfigDescription'

/**
 * Description of a dictionary.
 */
export default class DictionaryDescription<T> implements ConfigDescription<{ [key: string]: T }> {
  public constructor(private readonly description: ConfigDescription<T>) {}

  public parse(
    data: unknown,
    context: ParserContext<{ [key: string]: T }>
  ): ConfinodeResult<{ [key: string]: T }> | undefined {
    const { fileName, keyName, final } = context
    if ((data !== null && typeof data === 'object') || (data === undefined && context.parent)) {
      const keyPrefix = keyName + (keyName.length > 0 ? '.' : '')
      const safeData: any = data ?? {}
      const parent = (context.parent?.children as { [key: string]: ConfinodeResult<T> }) ?? {}
      return new ConfinodeResult(false, {
        ...parent,
        ...Object.entries(safeData).reduce((result, [key, value]) => {
          const parsed = this.description.parse(value, {
            keyName: keyPrefix + key,
            fileName,
            parent: parent[key],
            final,
          })
          /* istanbul ignore else */
          if (parsed) {
            result[key] = parsed
          }
          return result
        }, {} as { [key: string]: ConfinodeResult<T> }),
      })
    } else if (data !== undefined && data !== null) {
      throw new ConfinodeError('expected', keyName, fileName, new Message(Level.Error, 'expectedObject'))
    } else if (!final) {
      return undefined
    } else {
      throw new ConfinodeError('missingMandatory', keyName)
    }
  }
}
