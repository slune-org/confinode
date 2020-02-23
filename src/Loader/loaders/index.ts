import { LoaderType } from '../Loader'
import { analyzeLoaders } from './helpers'

/**
 * Loader descriptions, automatically filled by `ts-transform-auto-require`.
 */
export const defaultLoaders: { [name: string]: LoaderType<any> } = {}

/**
 * The loader descriptions is an object literal where keys are loader names and values are descriptions of
 * the loader, i.e. module name and loader constructor.
 * The extensions loaders is an object where keys are extensions and values are array of loader names.
 */
export const [loaderDescriptions, extensionsLoaders] = analyzeLoaders(defaultLoaders)

export { LoaderDescription, analyzeLoaders } from './helpers'
