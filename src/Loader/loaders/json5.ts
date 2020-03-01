import { readFile, readFileSync } from 'fs'
import { promisify } from 'util'

import Loader from '../Loader'
import LoaderDescription from '../LoaderDescription'

interface JSON5 {
  parse(input: string): unknown
}

/**
 * Loader implementation.
 */
class LoaderImplementation implements Loader {
  public constructor(private readonly json5: JSON5) {}

  public async load(fileName: string): Promise<unknown | undefined> {
    const content = await promisify(readFile)(fileName, { encoding: 'utf8' })
    return this.json5.parse(content)
  }

  public syncLoad(fileName: string): unknown | undefined {
    return this.json5.parse(readFileSync(fileName, { encoding: 'utf8' }))
  }
}

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: 'json5',
  Loader: LoaderImplementation,
  module: 'json5',
}
export default description
