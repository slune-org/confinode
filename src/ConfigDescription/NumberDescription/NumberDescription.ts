import ConfinodeError from '../../ConfinodeError'
import { Level, Message } from '../../messages'
import { LeafItemDescription } from '../ConfigDescription'

/**
 * Description of a number item. Number parser tries to also convert strings.
 */
export default class NumberDescription extends LeafItemDescription<number> {
  protected parseValue(value: unknown, fileName: string, keyName: string): number {
    if (typeof value === 'number') {
      return value
    } else if (typeof value === 'string' && value !== '') {
      const result = Number(value)
      if (!isNaN(result)) {
        return result
      }
    }
    throw new ConfinodeError('expected', keyName, fileName, new Message(Level.Error, 'expectedNumber'))
  }
}
