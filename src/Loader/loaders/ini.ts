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

  public load(fileName: string) {
    return this.ini.parse(readFileSync(fileName, { encoding: 'utf8' }))
  }

  public async asyncLoad(fileName: string) {
    const content = await promisify(readFile)(fileName, { encoding: 'utf8' })
    return this.ini.parse(content)
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
