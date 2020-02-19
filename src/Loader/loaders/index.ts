import { LoaderDescription as DefinitionLoaderDescription, LoaderType } from '../Loader'

/**
 * Loader descriptions, automatically filled by `ts-transform-auto-require`.
 */
const loaders: { [key: string]: LoaderType<any> } = {}

/**
 * The description, as used out of the loaders.
 */
export type LoaderDescription = { name: string } & Omit<DefinitionLoaderDescription, 'filetypes'>

/**
 * Indicate if the description is a loader description.
 *
 * @param value - The description to check.
 * @returns True if loader description.
 */
function isLoaderDescription(
  value: { name: string } & LoaderType<any>
): value is { name: string } & DefinitionLoaderDescription {
  return 'filetypes' in value
}

/**
 * Create the loader descriptions. It is an object literal where keys are extensions and values are array of
 * loader descriptions managing the extension.
 */
export const loaderDescriptions = Object.entries(loaders)
  .map(([name, description]) => ({ ...description, name }))
  .filter(isLoaderDescription)
  .reduce((previous, loaderDescription) => {
    const { filetypes, ...description } = loaderDescription
    new Array<string>().concat(filetypes).forEach(filetype => {
      if (!filetype) {
        throw new Error('Empty file type is forbidden')
      }
      if (!(filetype in previous)) {
        previous[filetype] = []
      }
      previous[filetype].push(description)
    })
    return previous
  }, {} as { [type: string]: LoaderDescription[] })
// Ensure objects will not be modified
Object.values(loaderDescriptions).forEach(descriptions => {
  descriptions.forEach(description => Object.freeze(description))
  Object.freeze(descriptions)
})
Object.freeze(loaderDescriptions)
