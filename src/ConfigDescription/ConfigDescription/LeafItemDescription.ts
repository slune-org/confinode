import ConfinodeError from '../../ConfinodeError'
import ConfinodeResult from '../../ConfinodeResult'
import ConfigDescription from './ConfigDescription'
import ParserContext from './ParserContext'

/**
 * Description of a configuration leaf item.
 */
export default abstract class LeafItemDescription<T> implements ConfigDescription<T> {
  /**
   * Create a description of the leaf item.
   *
   * @param defaultValue - The value to use for inexistent value. If no default value given, the value is
   * mandatory in the configuration.
   */
  public constructor(private readonly defaultValue?: T) {}

  /**
   * Try and parse the value.
   *
   * @param data - The data currently being parsed.
   * @param context - The parsing context.
   * @returns The matching data node.
   */
  public parse(data: unknown, context: ParserContext<T>): ConfinodeResult<T> | undefined {
    const { fileName, keyName, parent, final } = context
    if (data !== undefined && data !== null) {
      return new ConfinodeResult(true, this.parseValue(data, fileName, keyName), fileName)
    } else if (data === undefined && parent) {
      return parent
    } else if (!final) {
      return undefined
    } else if (data === undefined && this.defaultValue !== undefined) {
      return new ConfinodeResult(true, this.defaultValue)
    } else {
      throw new ConfinodeError('missingMandatory', keyName)
    }
  }

  /**
   * Parse the value and return the expected configuration item.
   *
   * @param value - The value to parse.
   * @param fileName - The name of the file in which value was found.
   * @param keyName - The name of the key currently being parsed.
   * @returns The parsed value.
   */
  protected abstract parseValue(value: unknown, fileName: string, keyName: string): T
}
