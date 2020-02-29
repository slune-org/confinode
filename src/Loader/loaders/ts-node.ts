import LoaderDescription from '../LoaderDescription'
import RequiringLoader from '../RequiringLoader'

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['ts', 'tsx'],
  Loader: RequiringLoader,
  module: 'ts-node/register',
}
export default description
