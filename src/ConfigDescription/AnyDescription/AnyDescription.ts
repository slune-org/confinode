import { LeafItemDescription } from '../ConfigDescription'

/**
 * Description of an unidentified item, parsing with the identity function.
 */
export default class AnyDescription extends LeafItemDescription<any> {
  protected parseValue(value: unknown): any {
    return value
  }
}
