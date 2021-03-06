import ConfinodeError from '../../ConfinodeError'
import { InternalResult } from '../../ConfinodeResult'
import ConfigDescription, {
  ConfigDescriptionParameter,
  ParserContext,
  asDescription,
} from '../ConfigDescription'

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
    private readonly ifDescription: ConfigDescriptionParameter<I>,
    private readonly elseDescription: ConfigDescriptionParameter<E>
  ) {}

  public parse(data: unknown, context: ParserContext<I | E>): InternalResult<I | E> | undefined {
    const { parent, ...inheritableContext } = context
    if (data !== undefined && data !== null) {
      return this.predicate(data)
        ? asDescription(this.ifDescription).parse(data, inheritableContext)
        : asDescription(this.elseDescription).parse(data, inheritableContext)
    } else if (data === undefined && parent) {
      return parent
    } else if (!context.final) {
      return undefined
    } else {
      throw new ConfinodeError('missingMandatory', context.keyName)
    }
  }
}
