import { writeFileSync } from 'fs'
import { relative, resolve } from 'path'

/**
 * Loader descriptions, automatically filled by `ts-transform-auto-require`.
 */
const loaderDescriptions: { [key: string]: any } = {}

interface FileTypesLoader {
  name: string
  filetypes: string | string[]
  module?: string
}

function isFileTypesLoader(value: { name: string } & any): value is FileTypesLoader {
  return 'filetypes' in value
}

if (process.argv.length !== 3) {
  throw new Error('Incorrect argument count — expected only the target file')
}
const fileName = resolve(process.argv[2])

const loaderFolder = resolve('src', 'loaders')
const loaders = Object.entries(loaderDescriptions)
  .map(([name, description]) => ({
    ...description,
    name: relative(loaderFolder, resolve(__dirname, name)),
  }))
  .filter(isFileTypesLoader)
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
  }, {} as { [type: string]: Array<Omit<FileTypesLoader, 'filetypes'>> })

writeFileSync(
  fileName,
  Object.keys(loaders)
    .sort()
    .map(
      key =>
        `.${key}:\n${' '.repeat(6)}` +
        loaders[key]
          .map(loader => '* ' + loader.name + (loader.module ? ` (module “${loader.module}”)` : ''))
          .join('\n' + ' '.repeat(6))
    )
    .join('\n')
)

// eslint-disable-next-line no-console
console.log(`Written ${Object.keys(loaders).length} extensions to ${fileName}`)
