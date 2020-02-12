// eslint-disable-next-line import/no-internal-modules
import jsonEntry from '../loaders/jsonEntry'
// eslint-disable-next-line import/no-internal-modules
import yaml from '../loaders/yaml'
import FileDescription, { isFileBasename } from './FileDescription'

export const defaultFiles = (name: string): FileDescription[] => [
  { name: 'package.json', loader: new jsonEntry.Loader(name) },
  { name: `.${name}rc`, loader: new yaml.Loader() },
  `.${name}rc`,
  `${name}.config`,
  `.${name}/${name}.config`,
]

export const noPackageJson = (files: FileDescription[]) =>
  files.filter(file => isFileBasename(file) || file.name !== 'package.json')
