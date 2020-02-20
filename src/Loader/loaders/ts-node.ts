import { LoaderDescription, RequiringLoader } from '../Loader'

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['ts', 'tsx'],
  Loader: RequiringLoader,
  module: 'ts-node/register',
}
export default description
