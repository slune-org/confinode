import { LoaderDescription, RequiringLoader } from './Loader'

/**
 * Loader for Javascript files.
 */
class JavascriptLoader extends RequiringLoader {
  public constructor() {
    super(undefined)
  }
}

/**
 * The loader description.
 */
const description: LoaderDescription = {
  filetypes: 'js',
  Loader: JavascriptLoader,
}
export default description
