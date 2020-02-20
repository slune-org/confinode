import { LoaderDescription, RequiringLoader } from '../Loader'

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['ts', 'tsx'],
  Loader: RequiringLoader,
  module: 'typescript-node/register',
}
export default description
