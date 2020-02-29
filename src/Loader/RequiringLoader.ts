import Loader from './Loader'

/**
 * A class for loaders based on register/require.
 */
export default class RequiringLoader implements Loader {
  public load(fileName: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let result = require(fileName)
    if (result && result.__esModule && result.default) {
      result = result.default
    }
    return result
  }
}
