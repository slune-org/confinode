import { LoaderDescription, RequiringLoader, ignoreNonBabelAndNodeModules } from './Loader'

/**
 * The module used to register typescript-node.
 */
const moduleName = '@babel/register'

/**
 * Typescript-require loader for TypeScript files.
 */
class TypescriptRequireLoader extends RequiringLoader {
  public constructor() {
    super({
      moduleName: '@babel/register',
      register(required) {
        required({
          extensions: '.ts',
          rootMode: 'upward-optional',
          ignore: [ignoreNonBabelAndNodeModules],
        })
        required({
          extensions: '.tsx',
          rootMode: 'upward-optional',
          ignore: [ignoreNonBabelAndNodeModules],
        })
      },
    })
  }
}

/**
 * The loader description.
 */
const description: LoaderDescription = {
  filetypes: ['ts', 'tsx'],
  Loader: TypescriptRequireLoader,
  module: moduleName,
}
export default description
