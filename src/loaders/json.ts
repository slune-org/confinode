import Loader, { LoaderDescription } from './Loader'

/**
 * Loader for JSON files.
 */
class JsonLoader implements Loader {
  public load(filename: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(filename)
  }
}

/**
 * The loader description.
 */
const description: LoaderDescription = {
  filetypes: 'json',
  Loader: JsonLoader,
}
export default description
