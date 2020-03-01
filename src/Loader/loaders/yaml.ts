import { readFile, readFileSync } from 'fs'
import { promisify } from 'util'
import { parse } from 'yaml'

import Loader from '../Loader'
import LoaderDescription from '../LoaderDescription'

/**
 * Loader implementation.
 */
class LoaderImplementation implements Loader {
  public async load(fileName: string): Promise<unknown | undefined> {
    const content = await promisify(readFile)(fileName, { encoding: 'utf8' })
    return parse(content)
  }

  public syncLoad(fileName: string): unknown | undefined {
    return parse(readFileSync(fileName, { encoding: 'utf8' }))
  }
}

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: ['yml', 'yaml'],
  Loader: LoaderImplementation,
}
export default description
