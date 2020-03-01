import LoaderDescription from '../LoaderDescription'
import RequiringLoader from '../RequiringLoader'

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['cjsx', 'coffee'],
  Loader: RequiringLoader,
  module: 'node-cjsx/register',
}
export default description
