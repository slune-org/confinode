import Loader, { LoaderType } from '../Loader'

/**
 * Loader implementation.
 */
class LoaderImplementation implements Loader {
  public constructor(_: any, private readonly entry: string) {}

  public load(filename: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const content = require(filename)
    if (content && this.entry in content) {
      return content[this.entry]
    } else {
      return undefined
    }
  }
}

/**
 * Loader description.
 */
const description: LoaderType<[string]> = {
  Loader: LoaderImplementation,
}
export default description
