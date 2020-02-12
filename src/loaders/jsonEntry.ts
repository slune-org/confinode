import Loader, { LoaderType } from './Loader'

/**
 * Loader for entry content of a JSON files.
 */
class JsonEntryLoader implements Loader {
  public constructor(private readonly entry: string) {}

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
 * The loader description.
 */
const description: LoaderType<[string]> = {
  Loader: JsonEntryLoader,
}
export default description
