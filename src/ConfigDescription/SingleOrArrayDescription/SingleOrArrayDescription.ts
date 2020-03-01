import { InternalResult } from '../../ConfinodeResult'
import { ensureArray } from '../../utils'
import ArrayDescription from '../ArrayDescription'
import { ParserContext } from '../ConfigDescription'

/**
 * Description of a configuration which can either be provided once directly or multiple times in an array.
 */
export default class SingleOrArrayDescription<T> extends ArrayDescription<T> {
  public parse(data: unknown, context: ParserContext<T[]>): InternalResult<T[]> | undefined {
    return super.parse(ensureArray(data), context)
  }
}
