import InternalResult from './InternalResult'

/**
 * Type of expected children in parent result.
 */
type ResultChildren = InternalResult<any>[] | { [key: string]: InternalResult<any> }

/**
 * Create a proxy handler to return the appropriate result property instead of the result itself.
 *
 * @param resultProperty - The name of the property.
 * @returns The correct handler.
 */
function handle(resultProperty: keyof InternalResult<any>): ProxyHandler<any> {
  return {
    get: (target, property) => {
      const result = target[property]
      return result instanceof InternalResult ? result[resultProperty] : result
    },
    set: () => {
      throw new TypeError('Configuration result is immutable')
    },
    deleteProperty: () => {
      throw new TypeError('Configuration result is immutable')
    },
    defineProperty: () => {
      throw new TypeError('Configuration result is immutable')
    },
  }
}

/**
 * A result based on children elements.
 */
export default class ParentResult<T> extends InternalResult<T> {
  public readonly configuration: T
  public readonly fileName: unknown

  /**
   * Create the result. Children may either be in an array or in an object literal.
   *
   * @param children - The children containing the result elements.
   */
  public constructor(public readonly children: ResultChildren) {
    super()
    this.configuration = new Proxy(children, handle('configuration')) as any
    this.fileName = new Proxy(children, handle('fileName'))
    Object.freeze(this)
  }
}
