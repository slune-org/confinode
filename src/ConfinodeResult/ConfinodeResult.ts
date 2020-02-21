type ResultChildren = ConfinodeResult<any>[] | { [key: string]: ConfinodeResult<any> }

export interface ResultFile {
  name: string
  extends: ResultFile[]
}

/**
 * Create a proxy handler to return the appropriate result property instead of the result itself.
 *
 * @param resultProperty - The name of the property.
 * @returns The correct handler.
 */
function handle(resultProperty: keyof ConfinodeResult<any>): ProxyHandler<any> {
  return {
    get: (target, property) => {
      const result = target[property]
      return result instanceof ConfinodeResult ? result[resultProperty] : result
    },
  }
}

export default class ConfinodeResult<T> {
  /**
   * The configuration.
   */
  public readonly configuration: T

  /**
   * The name of the file containing the configuration. This object has the same hierarchy than the
   * configuration.
   */
  public readonly fileName: unknown

  /**
   * Children results. This should not be used for reading configuration or file names.
   */
  public readonly children?: ResultChildren

  /**
   * All the files used to read the configuration.
   */
  private files_?: ResultFile

  /**
   * Create the result based on real data and file name.
   *
   * @param direct - True to indicate a direct result.
   * @param data - The result data.
   * @param fileName - The name of the file from which data have been extracted.
   */
  public constructor(direct: true, data: T, fileName?: string)

  /**
   * Create the result based on children elements. Children may either be in an array or in an object
   * literal.
   *
   * @param direct - False to indicate an indirect result (through children).
   * @param children - The children containing the result elements.
   */
  public constructor(direct: false, children: ResultChildren)

  /* Implementation */
  public constructor(direct: boolean, dataOrChildren: T | ResultChildren, fileName?: string) {
    if (direct === false) {
      // Create the result based on children elements
      this.children = dataOrChildren as ResultChildren
      this.configuration = new Proxy(this.children, handle('configuration')) as any
      this.fileName = new Proxy(this.children, handle('fileName'))
    } else {
      // Create the result based on real data and file name
      this.configuration = dataOrChildren as T
      this.fileName = fileName
    }
  }

  /**
   * Set the files. This must be called only once on the final result.
   *
   * @param files - The files to set.
   */
  public set files(files: ResultFile) {
    /* istanbul ignore else */
    if (!this.files_) {
      this.files_ = files
    } else {
      throw new Error('This is already a final result')
    }
  }

  /**
   * @returns All the files used to read the configuration.
   */
  public get files(): ResultFile {
    /* istanbul ignore else */
    if (this.files_) {
      return this.files_
    } else {
      throw new Error('This is not a final result')
    }
  }
}
