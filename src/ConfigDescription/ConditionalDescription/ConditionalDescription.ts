import ConfinodeError from '../../ConfinodeError'
import ConfinodeResult from '../../ConfinodeResult'
import ConfigDescription, { ParserContext } from '../ConfigDescription'

/**
 * Description of a conditional configuration.
 */
export default class ConditionalDescription<I, E> implements ConfigDescription<I | E> {
  /**
   * Create a conditional configuration description.
   *
   * @param predicate - The predicate to test the value against.
   * @param ifDescription - The description to use if predicate is true.
   * @param elseDescription - The description to use if predicate is false.
   */
  public constructor(
    private readonly predicate: (value: unknown) => boolean,
    private readonly ifDescription: ConfigDescription<I>,
    private readonly elseDescription: ConfigDescription<E>
  ) {}

  public parse(data: unknown, context: ParserContext<I | E>): ConfinodeResult<I | E> | undefined {
    const { parent, ...inheritableContext } = context
    if (data !== undefined && data !== null) {
      return this.predicate(data)
        ? this.ifDescription.parse(data, inheritableContext)
        : this.elseDescription.parse(data, inheritableContext)
    } else if (data === undefined && parent) {
      return parent
    } else if (!context.final) {
      return undefined
    } else {
      throw new ConfinodeError('missingMandatory', context.keyName)
    }
  }
}
