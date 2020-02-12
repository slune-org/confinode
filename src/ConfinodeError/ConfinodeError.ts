import { Level, Message, MessageId, MessageParameters } from '../messages'

/**
 * An error in the application, generates an error message.
 */
export default class ConfinodeError<T extends MessageId> extends Error {
  /**
   * The internal message of the error.
   */
  public readonly internalMessage: Message<T>

  public constructor(messageId: T, ...parameters: MessageParameters[T]) {
    const internalMessage = new Message(Level.Error, messageId, ...parameters)
    super(internalMessage.toString())
    this.internalMessage = internalMessage
  }
}
