import { LoaderType } from '../Loader'
import SyncLoader from '../SyncLoader'

/**
 * Loader implementation.
 */
class LoaderImplementation extends SyncLoader {
  public constructor(_: any, private readonly entry: string) {
    super()
  }

  public syncLoad(fileName: string): unknown | undefined {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const content = require(fileName)
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
