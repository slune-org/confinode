import { LoaderDescription, RequiringLoader } from './Loader'

/**
 * The module used to register typescript-node.
 */
const moduleName = 'typescript-register'

/**
 * Typescript-register loader for TypeScript files.
 */
class TypescriptRegisterLoader extends RequiringLoader {
  public constructor() {
    super(moduleName)
  }
}

/**
 * The loader description.
 */
const description: LoaderDescription = {
  filetypes: 'ts',
  Loader: TypescriptRegisterLoader,
  module: moduleName,
}
export default description
