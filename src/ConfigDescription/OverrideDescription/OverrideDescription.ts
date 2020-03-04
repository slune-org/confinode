import { InternalResult } from '../../ConfinodeResult'
import ConfigDescription, {
  ConfigDescriptionParameter,
  ParserContext,
  asDescription,
} from '../ConfigDescription'

/**
 * Description of an item for which parent value is overriden by children (and not merged).
 */
export default class OverrideDescription<T> implements ConfigDescription<T> {
  /**
   * Create the override description.
   *
   * @param description - The description of the element to override.
   */
  public constructor(protected readonly description: ConfigDescriptionParameter<T>) {}

  public parse(data: unknown, context: ParserContext<T>): InternalResult<T> | undefined {
    const { parent, ...inheritableContext } = context
    if (data === undefined && parent) {
      return parent
    } else {
      return asDescription(this.description).parse(data, inheritableContext)
    }
  }
}
