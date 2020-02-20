import { LoaderDescription, RequiringLoader } from '../../Loader'
import { ignoreNonBabelAndNodeModules } from '../helpers'

/**
 * Loader implementation.
 */
class LoaderImplementation extends RequiringLoader {
  public constructor(required: any) {
    super()
    required({
      extensions: '.ts',
      rootMode: 'upward-optional',
      ignore: [ignoreNonBabelAndNodeModules],
    })
    required({
      extensions: '.tsx',
      rootMode: 'upward-optional',
      ignore: [ignoreNonBabelAndNodeModules],
    })
  }
}

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['ts', 'tsx'],
  Loader: LoaderImplementation,
  module: '@babel/register',
}
export default description
