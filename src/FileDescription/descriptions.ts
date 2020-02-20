// eslint-disable-next-line import/no-internal-modules
import jsonEntry from '../Loader/loaders/jsonEntry'
// eslint-disable-next-line import/no-internal-modules
import yaml from '../Loader/loaders/yaml'
import FileDescription, { isFileBasename } from './FileDescription'

export const defaultFiles = (name: string): FileDescription[] => [
  { name: 'package.json', loader: new jsonEntry.Loader(undefined, name) },
  { name: `.${name}rc`, loader: new yaml.Loader(undefined) },
  `.${name}rc`,
  `${name}.config`,
  `.${name}/${name}.config`,
]

export const noPackageJson = (files: FileDescription[]) =>
  files.filter(file => isFileBasename(file) || file.name !== 'package.json')
