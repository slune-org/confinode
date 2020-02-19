import { LoaderDescription, RequiringLoader } from './Loader'

/**
 * The module used to register typescript-node.
 */
const moduleName = 'typescript-require'

/**
 * Typescript-require loader for TypeScript files.
 */
class TypescriptRequireLoader extends RequiringLoader {
  public constructor() {
    super(moduleName)
  }
}

/**
 * The loader description.
 */
const description: LoaderDescription = {
  filetypes: 'ts',
  Loader: TypescriptRequireLoader,
  module: moduleName,
}
export default description
