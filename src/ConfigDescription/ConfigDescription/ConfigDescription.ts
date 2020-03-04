import { InternalResult } from '../../ConfinodeResult'
import ParserContext from './ParserContext'

/**
 * The description of the configuration.
 */
export default interface ConfigDescription<T> {
  parse(data: unknown, context: ParserContext<T>): InternalResult<T> | undefined
}

/**
 * A dynamic description.
 */
export type DynamicConfigDescription<T> = () => ConfigDescription<T>

/**
 * A configuration description parameter can be either static or dynamic.
 */
export type ConfigDescriptionParameter<T> = ConfigDescription<T> | DynamicConfigDescription<T>

/**
 * Get the description parameter as (static) description.
 *
 * @param description - The description parameter.
 * @returns The (static) description.
 */
export function asDescription<T>(description: ConfigDescriptionParameter<T>): ConfigDescription<T> {
  return typeof description === 'function' ? description() : description
}
