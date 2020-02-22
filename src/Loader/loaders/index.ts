import { LoaderDescription as DefinitionLoaderDescription, LoaderType } from '../Loader'

/**
 * Loader descriptions, automatically filled by `ts-transform-auto-require`.
 */
const loaders: { [name: string]: LoaderType<any> } = {}

/**
 * The description, as used out of the loaders.
 */
export type LoaderDescription = Omit<DefinitionLoaderDescription, 'filetypes'>

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
 * The loader descriptions is an object literal where keys are loader names and values are descriptions of
 * the loader, i.e. module name and loader constructor.
 */
export const loaderDescriptions: { [name: string]: LoaderDescription } = {}

/**
 * The extensions loaders is an object where keys are extensions and values are array of loader names.
 */
export const extensionsLoaders = Object.entries(
  Object.entries(loaders)
    .map(([name, description]) => ({ ...description, name }))
    .filter(isLoaderDescription)
    .reduce((previous, loaderDescription) => {
      const { filetypes, name, ...description } = loaderDescription
      loaderDescriptions[name] = Object.freeze(description)
      new Array<string>().concat(filetypes).forEach(filetype => {
        if (!filetype) {
          throw new Error('Empty file type is forbidden')
        }
        if (!(filetype in previous)) {
          previous[filetype] = []
        }
        previous[filetype].push(name)
      })
      return previous
    }, {} as { [type: string]: string[] })
).reduce((previous, [extension, descriptionNames]) => {
  previous[extension] = Object.freeze(descriptionNames)
  return previous
}, {} as { [type: string]: ReadonlyArray<string> })

// Prevent objects from being modified
Object.freeze(loaderDescriptions)
Object.freeze(extensionsLoaders)
