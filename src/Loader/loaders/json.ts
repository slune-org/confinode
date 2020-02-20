import Loader, { LoaderDescription } from '../Loader'

/**
 * Loader implementation.
 */
class LoaderImplementation implements Loader {
  public load(fileName: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(fileName)
  }
}

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: 'json',
  Loader: LoaderImplementation,
}
export default description
