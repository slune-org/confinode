import { LoaderDescription, RequiringLoader } from '../Loader'

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['iced', 'iced.md', 'liticed'],
  Loader: RequiringLoader,
  module: 'iced-coffee-script/register',
}
export default description
