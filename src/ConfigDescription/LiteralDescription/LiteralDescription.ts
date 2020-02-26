import ConfinodeError from '../../ConfinodeError'
import ConfinodeResult from '../../ConfinodeResult'
import { Level, Message } from '../../messages'
import ConfigDescription, { ParserContext } from '../ConfigDescription'

export type ConfigDescriptionLiteral<T extends object> = {
  [P in keyof T]: ConfigDescription<T[P]>
}

/**
 * Description of an object literal.
 */
export default class LiteralDescription<T extends object> implements ConfigDescription<T> {
  public constructor(private readonly description: ConfigDescriptionLiteral<T>) {}

  public parse(data: unknown, context: ParserContext<T>): ConfinodeResult<T> | undefined {
    const { fileName, keyName, final } = context
    if ((data !== null && typeof data === 'object') || data === undefined) {
      const keyPrefix = keyName + (keyName.length > 0 ? '.' : '')
      const safeData: any = data ?? {}
      const parent = (context.parent?.children as { [key: string]: ConfinodeResult<any> }) ?? {}
      return new ConfinodeResult(
        false,
        Object.entries(this.description).reduce((result, [key, description]) => {
          const parsed = (description as ConfigDescription<any>).parse(safeData[key], {
            keyName: keyPrefix + key,
            fileName,
            parent: parent[key],
            final,
          })
          if (parsed) {
            result[key] = parsed
          }
          return result
        }, {} as { [key: string]: ConfinodeResult<any> })
      )
    } else if (data !== null) {
      throw new ConfinodeError('expected', keyName, fileName, new Message(Level.Error, 'expectedObject'))
    } else if (!final) {
      return undefined
    } else {
      throw new ConfinodeError('missingMandatory', keyName)
    }
  }
}
