import LoaderDescription from '../LoaderDescription'
import RequiringLoader from '../RequiringLoader'
import { ignoreNonBabelAndNodeModules } from './helpers'

/**
 * Loader implementation.
 */
class LoaderImplementation extends RequiringLoader {
  public constructor(required: any) {
    super()
    required({
      extensions: '.js',
      rootMode: 'upward-optional',
      ignore: [ignoreNonBabelAndNodeModules],
    })
    required({
      extensions: '.jsx',
      rootMode: 'upward-optional',
      ignore: [ignoreNonBabelAndNodeModules],
    })
  }
}

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['babel.js', 'jsx'],
  Loader: LoaderImplementation,
  module: '@babel/register',
}
export default description
