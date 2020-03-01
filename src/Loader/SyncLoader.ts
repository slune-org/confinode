import Loader from './Loader'

export default abstract class SyncLoader implements Loader {
  public load(fileName: string): Promise<unknown | undefined> {
    return Promise.resolve(this.syncLoad(fileName))
  }

  public abstract syncLoad(fileName: string): unknown | undefined
}
