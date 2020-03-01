import InternalResult from './InternalResult'

/**
 * The file where configuration was found.
 */
export interface ResultFile {
  name: string
  extends: ResultFile[]
}

/**
 * The result of the configuration load/search.
 */
export default interface ConfinodeResult<T> extends InternalResult<T> {
  readonly files: ResultFile
}

/**
 * Create a full result based on a sub-result.
 *
 * @param realResult - The real result.
 * @param files - The files in which results where found.
 * @returns The full result.
 */
export function buildResult<T>(realResult: InternalResult<T>, files: ResultFile): ConfinodeResult<T> {
  Object.freeze(files)
  return new Proxy(
    {},
    {
      get: (_, property) => {
        if (property === 'files') {
          return files
        } else {
          return (realResult as any)[property]
        }
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
      getPrototypeOf: () => Object.getPrototypeOf(realResult),
    }
  ) as ConfinodeResult<T>
}
