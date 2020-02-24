/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'

import Cache from './Cache'

async function pause(time: number): Promise<void> {
  return new Promise(res => setTimeout(res, time))
}

describe('Cache', function() {
  const cache = new Cache<string>(500, 12)

  afterEach('Clear cache content', function() {
    cache.clear()
  })

  it('should store and retrieve value', function() {
    cache.set('key', 'value')
    expect(cache.get('key')).to.equal('value')
  })

  it('should return undefined if no value stored for key', function() {
    cache.set('key', 'value')
    expect(cache.get('wrong key')).to.be.undefined
  })

  it('should indicate if key is stored or not', function() {
    cache.set('key', 'value')
    expect(cache.has('key')).to.be.true
    expect(cache.has('wrong key')).to.be.false
  })

  it('should clear content if requested', function() {
    cache.set('key', 'value')
    cache.clear()
    expect(cache.has('key')).to.be.false
    expect(cache.get('key')).to.be.undefined
  })

  it('should delete oldest value if too many', function() {
    cache.set('key', 'value')
    Array(24)
      .fill(undefined)
      .forEach((_, i) => cache.set(`key${i}`, `value${i}`))
    expect(cache.has('key')).to.be.false
    expect(cache.get('key')).to.be.undefined
  })

  it('should delete value if too old', async function() {
    this.slow(2100)
    cache.set('key', 'value')
    await pause(1000)
    expect(cache.has('key')).to.be.false
    expect(cache.get('key')).to.be.undefined
  })

  it('should reset age timer if value requested', async function() {
    this.slow(2100)
    cache.set('key', 'value')
    for (let i = 0; i < 5; i++) {
      await pause(200)
      cache.get('key')
    }
    expect(cache.has('key')).to.be.true
    expect(cache.get('key')).to.equal('value')
  })
})
