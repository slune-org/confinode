import { writeFileSync } from 'fs'
import { resolve } from 'path'

// eslint-disable-next-line import/no-internal-modules
import { loaderDescriptions } from '../Loader/loaders'

if (process.argv.length !== 3) {
  throw new Error('Incorrect argument count — expected only the target file')
}
const fileName = resolve(process.argv[2])

writeFileSync(
  fileName,
  Object.keys(loaderDescriptions)
    .sort()
    .map(
      key =>
        `.${key}:\n${' '.repeat(6)}` +
        loaderDescriptions[key]
          .map(
            description =>
              '* ' + description.name + (description.module ? ` (module: “${description.module}”)` : '')
          )
          .join('\n' + ' '.repeat(6))
    )
    .join('\n')
)

// eslint-disable-next-line no-console
console.log(`Written ${Object.keys(loaderDescriptions).length} extensions to ${fileName}`)
