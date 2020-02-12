import ConfinodeError from '../../ConfinodeError'
import { Level, Message } from '../../messages'
import { LeafItemDescription } from '../ConfigDescription'

/**
 * Description of a string item. The parser also tries to convert booleans and numbers.
 */
export default class StringDescription extends LeafItemDescription<string> {
  protected parseValue(value: unknown, fileName: string, keyName: string): string {
    if (typeof value === 'string') {
      return value
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      return String(value)
    }
    throw new ConfinodeError('expected', keyName, fileName, new Message(Level.Error, 'expectedString'))
  }
}
