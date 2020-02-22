import { LoaderDescription, RequiringLoader } from '../Loader'

/**
 * Loader implementation.
 */
class LoaderImplementation extends RequiringLoader {
  public constructor(required: any) {
    super()
    const esmLoader: any = required(module)
    // eslint-disable-next-line node/no-deprecated-api
    require.extensions['.js'] = esmLoader('module')._extensions['.js']
  }
}

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: 'esm.js',
  Loader: LoaderImplementation,
  module: 'esm',
}
export default description
