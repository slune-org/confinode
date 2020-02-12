import { readFile, readFileSync } from 'fs'
import { promisify } from 'util'
import { parse } from 'yaml'

import Loader, { LoaderDescription } from './Loader'

class YamlLoader implements Loader {
  public load(filename: string) {
    return parse(readFileSync(filename, { encoding: 'utf8' }))
  }

  public async asyncLoad(filename: string) {
    const content = await promisify(readFile)(filename, { encoding: 'utf8' })
    return parse(content)
  }
}

/**
 * The loader description.
 */
const description: LoaderDescription = {
  filetypes: ['yml', 'yaml'],
  Loader: YamlLoader,
}
export default description
