import Loader from '../Loader'
import LoaderDescription from '../LoaderDescription'

interface NodeIni {
  parse(file: string, cb: (err: any, data: unknown) => void): void
  parseSync(file: string): unknown
}

/**
 * Loader implementation.
 */
class LoaderImplementation implements Loader {
  public constructor(private readonly nodeIni: NodeIni) {}

  public async load(fileName: string): Promise<unknown | undefined> {
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

  public syncLoad(fileName: string): unknown | undefined {
    return this.nodeIni.parseSync(fileName)
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
