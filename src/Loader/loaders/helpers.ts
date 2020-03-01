import { relative, sep } from 'path'

import { ensureArray } from '../../utils'
import { LoaderType } from '../Loader'
import DefinitionLoaderDescription from '../LoaderDescription'

/**
 * The babel files regular expression. Taken from the Gulp “interpret” project:
 * https://github.com/gulpjs/interpret.
 */
export const noEndsInBabelJs = /(?!\.babel\.[jt]s(x))$/

/**
 * Check if file is a babel or node module. Taken from the Gulp “interpret” project:
 * https://github.com/gulpjs/interpret.
 *
 * @param file - The file to test.
 * @returns False if file is babel or node module and should not be ignored.
 */
export function ignoreNonBabelAndNodeModules(file: string) {
  return (
    noEndsInBabelJs.test(file) &&
    relative(process.cwd(), file)
      .split(sep)
      .indexOf('node_modules') >= 0
  )
}

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
 * Analyze the loaders to create both loader descriptions and extensions loaders.
 *
 * @param loaders - The loaders to analyze.
 * @param namePrefix - The prefix to add to loader names.
 * @returns The analyze result.
 */
export function analyzeLoaders(
  loaders: {
    [name: string]: LoaderType<any>
  },
  namePrefix = ''
): [{ [name: string]: LoaderDescription }, { [type: string]: ReadonlyArray<string> }] {
  const loaderDescriptions: { [name: string]: LoaderDescription } = {}
  const extensionsLoaders = Object.entries(
    Object.entries(loaders)
      .map(([name, description]) => ({ ...description, name }))
      .filter(isLoaderDescription)
      .reduce((previous, loaderDescription) => {
        const { filetypes, name, ...description } = loaderDescription
        loaderDescriptions[namePrefix + name] = Object.freeze(description)
        ensureArray(filetypes).forEach(filetype => {
          if (!filetype) {
            throw new Error('Empty file type is forbidden')
          }
          if (!(filetype in previous)) {
            previous[filetype] = []
          }
          previous[filetype].push(namePrefix + name)
        })
        return previous
      }, {} as { [type: string]: string[] })
  ).reduce((previous, [extension, descriptionNames]) => {
    previous[extension] = Object.freeze(descriptionNames)
    return previous
  }, {} as { [type: string]: ReadonlyArray<string> })
  return [Object.freeze(loaderDescriptions), Object.freeze(extensionsLoaders)]
}
