import { LoaderDescription, RequiringLoader } from '../Loader'

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['cjsx', 'coffee'],
  Loader: RequiringLoader,
  module: 'node-cjsx/register',
}
export default description
