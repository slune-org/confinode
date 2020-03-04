import { ConfigDescriptionParameter } from '../ConfigDescription'
import DefaultValueDescription from '../DefaultValueDescription'

/**
 * Description of an optional configuration part.
 */
export default class OptionalDescription<T> extends DefaultValueDescription<T, undefined> {
  public constructor(description: ConfigDescriptionParameter<T>) {
    super(description, undefined)
  }
}
