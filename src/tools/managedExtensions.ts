import { writeFileSync } from 'fs'
import { resolve } from 'path'

// eslint-disable-next-line import/no-internal-modules
import { extensionsLoaders, loaderDescriptions } from '../Loader/loaders'

if (process.argv.length !== 3) {
  throw new Error('Incorrect argument count — expected only the target file')
}
const fileName = resolve(process.argv[2])

writeFileSync(
  fileName,
  Object.keys(extensionsLoaders)
    .sort()
    .map(
      key =>
        `.${key}:\n${' '.repeat(6)}` +
        extensionsLoaders[key]
          .map(
            name =>
              '* ' +
              name +
              (loaderDescriptions[name].module ? ` (module: “${loaderDescriptions[name].module}”)` : '')
          )
          .join('\n' + ' '.repeat(6))
    )
    .join('\n')
)

// eslint-disable-next-line no-console
console.log(
  `Written ${Object.keys(extensionsLoaders).length} extensions for ${
    Object.keys(loaderDescriptions).length
  } loaders to ${fileName}`
)
