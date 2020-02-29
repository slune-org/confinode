import LoaderDescription from '../LoaderDescription'
import RequiringLoader from '../RequiringLoader'

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['coffee', 'coffee.md', 'litcoffee'],
  Loader: RequiringLoader,
  module: 'coffeescript/register',
}
export default description
