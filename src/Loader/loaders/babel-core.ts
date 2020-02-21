import { LoaderDescription, RequiringLoader } from '../Loader'
import { noEndsInBabelJs } from './helpers'

/**
 * Loader implementation.
 */
class LoaderImplementation extends RequiringLoader {
  public constructor(required: any) {
    super()
    required({
      extensions: '.js',
      rootMode: 'upward-optional',
      ignore: noEndsInBabelJs,
    })
    required({
      extensions: '.jsx',
      rootMode: 'upward-optional',
      ignore: noEndsInBabelJs,
    })
  }
}

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['babel.js', 'jsx'],
  Loader: LoaderImplementation,
  module: 'babel-core/register',
}
export default description
