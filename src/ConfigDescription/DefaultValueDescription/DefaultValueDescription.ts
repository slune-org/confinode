import ConfinodeError from '../../ConfinodeError'
import { DirectResult, InternalResult } from '../../ConfinodeResult'
import ConfigDescription, {
  ConfigDescriptionParameter,
  ParserContext,
  asDescription,
} from '../ConfigDescription'

/**
 * Description of a default value.
 */
export default class DefaultValueDescription<T, D> implements ConfigDescription<T | D> {
  /**
   * Create a default value description.
   *
   * @param description - The description to “protect” by a default value.
   * @param defaultValue - The value to use if description does not exist.
   */
  public constructor(
    private readonly description: ConfigDescriptionParameter<T>,
    private readonly defaultValue: D
  ) {}

  public parse(data: unknown, context: ParserContext<T | D>): InternalResult<T | D> | undefined {
    const { keyName, parent, final } = context
    if (data !== undefined && data !== null) {
      return asDescription(this.description).parse(data, context as ParserContext<T>)
    } else if (data === undefined && parent) {
      return parent
    } else if (!final) {
      return undefined
    } else if (data === undefined) {
      return new DirectResult(this.defaultValue)
    } else {
      throw new ConfinodeError('missingMandatory', keyName)
    }
  }
}
