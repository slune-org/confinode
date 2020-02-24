import * as QuickLRU from 'quick-lru'

/**
 * A LRU cache with a timeout.
 */
export default class Cache<T> {
  /**
   * The LRU used for the cache.
   */
  private readonly lru: QuickLRU<string, T>

  /**
   * The idle timer, used to clear cache if not used during a long time.
   */
  private timer: NodeJS.Timeout | undefined

  /**
   * The cache constructor.
   *
   * @param maxAge - The maximum amount of time in milliseconds the cache is kept alive while unused.
   * @param capacity - The maximum amount of objects kept in cache.
   */
  public constructor(private readonly maxAge: number, capacity: number) {
    this.lru = new QuickLRU({ maxSize: capacity })
  }

  /**
   * Set the item.
   *
   * @param key - The key of the item.
   * @param value - The item to cache.
   */
  public set(key: string, value: T): void {
    this.resetTimer()
    this.lru.set(key, value)
  }

  /**
   * Test if the key is in the cache.
   *
   * @param key - The key to test.
   * @returns True if the key is in the cache.
   */
  public has(key: string): boolean {
    this.resetTimer()
    return this.lru.has(key)
  }

  /**
   * Retrieve the cached item.
   *
   * @param key - The key of the item to retrieve.
   * @returns The cached item.
   */
  public get(key: string): T | undefined {
    this.resetTimer()
    return this.lru.get(key)
  }

  /**
   * Clear the content of the cache.
   */
  public clear(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
    this.lru.clear()
  }

  /**
   * Clean the stale objects.
   */
  private resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => this.clear(), this.maxAge)
    this.timer.unref()
  }
}
