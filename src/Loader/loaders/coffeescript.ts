import { LoaderDescription, RequiringLoader } from '../Loader'

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['coffee', 'coffee.md', 'litcoffee'],
  Loader: RequiringLoader,
  module: 'coffeescript/register',
}
export default description
