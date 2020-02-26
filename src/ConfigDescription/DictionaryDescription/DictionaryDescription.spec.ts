/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'
import * as sinon from 'sinon'
import { SinonSpy } from 'sinon'

import ConfinodeResult from '../../ConfinodeResult'
import { ParserContext } from '../ConfigDescription'
// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'
import { stringItem } from '../helpers'
import DictionaryDescription from './DictionaryDescription'

const itemDescription = stringItem()
const description = new DictionaryDescription(itemDescription)

describe('DictionaryDescription', function() {
  let stringSpy: SinonSpy<[unknown, ParserContext<string>], ConfinodeResult<string> | undefined>

  beforeEach('initialize', function() {
    stringSpy = sinon.spy(itemDescription, 'parse')
  })

  afterEach('restore', function() {
    stringSpy.restore()
  })

  it('should return the dictionary input value', function() {
    const value = {
      hello: 'world',
      Daenerys: 'Targaryen',
    }
    const parseResult = description.parse(value, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal(value)
    const keys = Object.keys(value)
    expect(stringSpy).to.have.callCount(keys.length)
    stringSpy
      .getCalls()
      .forEach((call, index) => expect(call.args[1].keyName).to.equal(`KeYnAmE.${keys[index]}`))
  })

  it('should not add point if no key name', function() {
    const value = {
      hello: 'world',
      Daenerys: 'Targaryen',
    }
    const parseResult = description.parse(value, {
      keyName: '',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal(value)
    const keys = Object.keys(value)
    expect(stringSpy).to.have.callCount(keys.length)
    stringSpy.getCalls().forEach((call, index) => expect(call.args[1].keyName).to.equal(`${keys[index]}`))
  })

  it('should return merged dictionaries', function() {
    const parent = description.parse(
      {
        hello: 'monde',
        Jon: 'Snow',
      },
      {
        keyName: 'KeYnAmE',
        fileName: 'ParenT',
        final: false,
      }
    )
    const parseResult = description.parse(
      {
        hello: 'world',
        Daenerys: 'Targaryen',
      },
      {
        keyName: 'KeYnAmE',
        fileName: 'FilENamE',
        parent,
        final: false,
      }
    )
    expect(parseResult?.configuration).to.deep.equal({ hello: 'world', Daenerys: 'Targaryen', Jon: 'Snow' })
    expect((parseResult?.fileName as any).Jon, `Jon`).to.equal('ParenT')
    Array.of('hello', 'Daenerys').forEach(key => {
      expect((parseResult?.fileName as any)[key], `${key}`).to.equal('FilENamE')
    })
    expect(stringSpy).to.have.callCount(4)
  })

  Array.of<unknown>('hello', 12, false, true, '').forEach(value =>
    it(`should throw for ${typeof value} value “${value}”`, function() {
      expect(() =>
        description.parse(value, { keyName: 'KeYnAmE', fileName: 'FilENamE', final: false })
      ).to.throw(/“KeYnAmE” is expected to be an object/)
    })
  )

  testNullAndUndefined(description, {
    hello: 'monde',
    Jon: 'Snow',
  })
})
