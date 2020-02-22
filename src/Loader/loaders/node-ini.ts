import Loader, { LoaderDescription } from '../Loader'

interface NodeIni {
  parse(file: string, cb: (err: any, data: unknown) => void): void
  parseSync(file: string): unknown
}

/**
 * Loader implementation.
 */
class LoaderImplementation implements Loader {
  public constructor(private readonly nodeIni: NodeIni) {}

  public load(fileName: string) {
    return this.nodeIni.parseSync(fileName)
  }

  public async asyncLoad(fileName: string) {
    return new Promise((resolve, reject) =>
      this.nodeIni.parse(fileName, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    )
  }
}

/**
 * Loader description.
 */
const description: LoaderDescription = {
  filetypes: 'ini',
  Loader: LoaderImplementation,
  module: 'node-ini',
}
export default description
