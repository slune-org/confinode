/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'

import ConfinodeResult from '../../ConfinodeResult'
import ConfigDescription from './ConfigDescription'

interface Options {
  fillInUndefined: boolean
  hasDefaultValue: boolean
}

export function testNullAndUndefined<T>(
  description: ConfigDescription<T>,
  parentValue: T,
  options: Partial<Options> = {}
) {
  const parentNode = (Array.isArray(parentValue)
    ? new ConfinodeResult(
        false,
        parentValue.map(value => new ConfinodeResult(true, value, 'ParenT'))
      )
    : typeof parentValue === 'object' && parentValue !== null
    ? new ConfinodeResult(
        false,
        Object.entries(parentValue).reduce((prev, [key, value]) => {
          prev[key] = new ConfinodeResult(true, value, 'ParenT')
          return prev
        }, {} as any)
      )
    : new ConfinodeResult(true, parentValue, 'ParenT')) as ConfinodeResult<T>
  const parentFile = Array.isArray(parentValue)
    ? parentValue.map(_ => 'ParenT')
    : typeof parentValue === 'object' && parentValue !== null
    ? Object.entries(parentValue).reduce((prev, [key]) => {
        prev[key] = 'ParenT'
        return prev
      }, {} as any)
    : 'ParenT'

  it(`should use parent value if provided and data is undefined`, function() {
    const parseResult = description.parse(undefined, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      parent: parentNode,
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal(parentValue)
    expect(parseResult?.fileName).to.deep.equal(parentFile)
  })

  it(`should discard parent value if data is null`, function() {
    const parseResult = description.parse(null, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      parent: parentNode,
      final: false,
    })
    expect(parseResult).to.be.undefined
  })

  Array.of<any>(null, undefined).forEach(value => {
    if (value !== undefined || !options.fillInUndefined) {
      it(`should return undefined if data is ${value} in non final round`, function() {
        const parseResult = description.parse(value, {
          keyName: 'KeYnAmE',
          fileName: 'FilENamE',
          final: false,
        })
        expect(parseResult).to.be.undefined
      })
    }

    if (value !== undefined || !options.hasDefaultValue) {
      it(`should throw if data is ${value} in final round`, function() {
        expect(() =>
          description.parse(value, { keyName: 'KeYnAmE', fileName: 'FilENamE', final: true })
        ).to.throw(/missing mandatory “KeYnAmE” option/)
      })
    }
  })
}
