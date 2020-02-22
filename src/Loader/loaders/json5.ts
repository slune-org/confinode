import { readFile, readFileSync } from 'fs'
import { promisify } from 'util'

import Loader, { LoaderDescription } from '../Loader'

interface JSON5 {
  parse(input: string): unknown
}

/**
 * Loader implementation.
 */
class LoaderImplementation implements Loader {
  public constructor(private readonly json5: JSON5) {}

  public load(fileName: string) {
    return this.json5.parse(readFileSync(fileName, { encoding: 'utf8' }))
  }

  public async asyncLoad(fileName: string) {
    const content = await promisify(readFile)(fileName, { encoding: 'utf8' })
    return this.json5.parse(content)
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
