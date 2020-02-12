import Level from './Level'
import { MessageId, MessageParameters, messages } from './messages'

/**
 * A message in the application is composed of a level, a message identifier, and parameters.
 */
export default class Message<T extends MessageId> {
  /**
   * The parameters of the message.
   */
  public readonly parameters: MessageParameters[T]

  public constructor(
    /**
     * The level of the message.
     */
    public readonly level: Level,

    /**
     * The message identifier.
     */
    public readonly messageId: T,
    ...parameters: MessageParameters[T]
  ) {
    this.parameters = parameters
  }

  public toString(): string {
    return (messages[this.messageId] as (...args: MessageParameters[T]) => string)(...this.parameters)
  }
}
