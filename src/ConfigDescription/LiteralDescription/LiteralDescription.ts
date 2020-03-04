import ConfinodeError from '../../ConfinodeError'
import { ParentResult, InternalResult } from '../../ConfinodeResult'
import { Level, Message } from '../../messages'
import ConfigDescription, {
  ConfigDescriptionParameter,
  ParserContext,
  assertHasParentResult,
  asDescription,
} from '../ConfigDescription'

/**
 * An object literal internal description.
 */
export type ConfigDescriptionLiteral<T extends object> = {
  [P in keyof T]: ConfigDescriptionParameter<T[P]>
}

/**
 * Description of an object literal.
 */
export default class LiteralDescription<T extends object> implements ConfigDescription<T> {
  /**
   * Create a literal configuration description.
   *
   * @param description - The description of the object literal.
   */
  public constructor(private readonly description: ConfigDescriptionLiteral<T>) {}

  public parse(data: unknown, context: ParserContext<T>): InternalResult<T> | undefined {
    const { fileName, keyName, final } = context
    if ((data !== null && typeof data === 'object') || data === undefined) {
      const keyPrefix = keyName + (keyName.length > 0 ? '.' : '')
      const safeData: any = data ?? {}
      assertHasParentResult(context)
      const parent = (context.parent?.children as { [key: string]: InternalResult<any> }) ?? {}
      return new ParentResult(
        Object.entries<ConfigDescriptionParameter<any>>(this.description).reduce(
          (result, [key, description]) => {
            const parsed = asDescription(description).parse(safeData[key], {
              keyName: keyPrefix + key,
              fileName,
              parent: parent[key],
              final,
            })
            if (parsed) {
              result[key] = parsed
            }
            return result
          },
          {} as { [key: string]: InternalResult<any> }
        )
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
