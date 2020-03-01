import SyncLoader from './SyncLoader'

/**
 * A class for loaders based on register/require.
 */
export default class RequiringLoader extends SyncLoader {
  public syncLoad(fileName: string): unknown | undefined {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let result = require(fileName)
    if (result && result.__esModule && result.default) {
      result = result.default
    }
    return result
  }
}
