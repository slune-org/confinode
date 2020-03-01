import { readFile, readFileSync } from 'fs'
import { promisify } from 'util'

import Loader from '../Loader'
import LoaderDescription from '../LoaderDescription'

interface Ini {
  parse(input: string): unknown
}

/**
 * Loader implementation.
 */
class LoaderImplementation implements Loader {
  public constructor(private readonly ini: Ini) {}

  public async load(fileName: string): Promise<unknown | undefined> {
    const content = await promisify(readFile)(fileName, { encoding: 'utf8' })
    return this.ini.parse(content)
  }

  public syncLoad(fileName: string): unknown | undefined {
    return this.ini.parse(readFileSync(fileName, { encoding: 'utf8' }))
  }
}

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: 'ini',
  Loader: LoaderImplementation,
  module: 'ini',
}
export default description
