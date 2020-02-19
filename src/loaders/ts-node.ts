import { LoaderDescription, RequiringLoader } from './Loader'

/**
 * The module used to register ts-node.
 */
const moduleName = 'ts-node/register'

/**
 * TS-node loader for TypeScript files.
 */
class TsNodeLoader extends RequiringLoader {
  public constructor() {
    super(moduleName)
  }
}

/**
 * The loader description.
 */
const description: LoaderDescription = {
  filetypes: ['ts', 'tsx'],
  Loader: TsNodeLoader,
  module: moduleName,
}
export default description
