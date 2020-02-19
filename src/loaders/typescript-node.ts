import { LoaderDescription, RequiringLoader } from './Loader'

/**
 * The module used to register typescript-node.
 */
const moduleName = 'typescript-node/register'

/**
 * Typescript-node loader for TypeScript files.
 */
class TypescriptNodeLoader extends RequiringLoader {
  public constructor() {
    super(moduleName)
  }
}

/**
 * The loader description.
 */
const description: LoaderDescription = {
  filetypes: ['ts', 'tsx'],
  Loader: TypescriptNodeLoader,
  module: moduleName,
}
export default description
