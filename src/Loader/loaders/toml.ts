import { readFile, readFileSync } from 'fs'
import { promisify } from 'util'

import Loader from '../Loader'
import LoaderDescription from '../LoaderDescription'

interface Toml {
  parse(input: string): unknown
}

/**
 * Loader implementation.
 */
class LoaderImplementation implements Loader {
  public constructor(private readonly toml: Toml) {}

  public async load(fileName: string): Promise<unknown | undefined> {
    const content = await promisify(readFile)(fileName, { encoding: 'utf8' })
    return this.toml.parse(content)
  }

  public syncLoad(fileName: string): unknown | undefined {
    return this.toml.parse(readFileSync(fileName, { encoding: 'utf8' }))
  }
}

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: 'toml',
  Loader: LoaderImplementation,
  module: 'toml',
}
export default description
