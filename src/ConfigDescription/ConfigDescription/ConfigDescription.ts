import { InternalResult } from '../../ConfinodeResult'
import ParserContext from './ParserContext'

/**
 * The description of the configuration.
 */
export default interface ConfigDescription<T> {
  parse(data: unknown, context: ParserContext<T>): InternalResult<T> | undefined
}
