import ConfinodeError from '../../ConfinodeError'
import { Level, Message } from '../../messages'
import { LeafItemDescription } from '../ConfigDescription'

/**
 * Description of a choice item.
 */
export default class ChoiceDescription<T extends string | number> extends LeafItemDescription<T> {
  /**
   * Create the description of a choice item.
   *
   * @param choices - The available choices.
   * @param defaultValue - An optional default value.
   */
  public constructor(private readonly choices: T[], defaultValue?: T) {
    super(defaultValue)
  }

  protected parseValue(value: unknown, fileName: string, keyName: string): T {
    if ((this.choices as any[]).includes(value)) {
      return value as T
    } else {
      let parsedValue: any
      if (typeof value === 'boolean' || typeof value === 'number') {
        // Try as string
        parsedValue = String(value)
        if (this.choices.includes(parsedValue)) {
          return parsedValue
        }
      }
      if (typeof value === 'string' && value !== '') {
        // Try as number
        parsedValue = Number(value)
        if (!isNaN(parsedValue) && this.choices.includes(parsedValue)) {
          return parsedValue
        }
      }
    }
    throw new ConfinodeError(
      'expected',
      keyName,
      fileName,
      new Message(Level.Error, 'expectedChoice', this.choices)
    )
  }
}
