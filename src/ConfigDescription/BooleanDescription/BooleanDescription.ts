import ConfinodeError from '../../ConfinodeError'
import { Level, Message } from '../../messages'
import { LeafItemDescription } from '../ConfigDescription'

/**
 * Description of a boolean item. Boolean parser tries also to convert some numbers and strings.
 */
export default class BooleanDescription extends LeafItemDescription<boolean> {
  /**
   * Create the description of a boolean item.
   *
   * @param defaultValue - The value to use for inexistent value.
   */
  public constructor(defaultValue: boolean) {
    super(defaultValue)
  }

  protected parseValue(value: unknown, fileName: string, keyName: string): boolean {
    if (typeof value === 'boolean') {
      return value
    } else if (typeof value === 'number') {
      if (value === 0) {
        return false
      } else if (value === 1) {
        return true
      }
    } else if (typeof value === 'string') {
      if (/^(?:f(?:alse)?|n(?:o)?|0)$/i.test(value)) {
        return false
      } else if (/^(?:t(?:rue)?|y(?:es)?|1)$/i.test(value)) {
        return true
      }
    }
    throw new ConfinodeError('expected', keyName, fileName, new Message(Level.Error, 'expectedBoolean'))
  }
}
