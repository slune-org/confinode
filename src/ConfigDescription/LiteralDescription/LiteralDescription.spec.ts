/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'
import * as sinon from 'sinon'
import { SinonSpy } from 'sinon'

import { DirectResult, InternalResult, ParentResult } from '../../ConfinodeResult'
import { ParserContext } from '../ConfigDescription'
// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'
import { numberItem, stringItem } from '../helpers'
import LiteralDescription from './LiteralDescription'

const aDescription = numberItem()
const bDescription = stringItem()
const description = new LiteralDescription({ a: aDescription, b: bDescription })

describe('LiteralDescription', function() {
  let numberSpy: SinonSpy<[unknown, ParserContext<number>], InternalResult<number> | undefined>
  let stringSpy: SinonSpy<[unknown, ParserContext<string>], InternalResult<string> | undefined>

  beforeEach('initialize', function() {
    numberSpy = sinon.spy(aDescription, 'parse')
    stringSpy = sinon.spy(bDescription, 'parse')
  })

  afterEach('restore', function() {
    numberSpy.restore()
    stringSpy.restore()
  })

  it('should return a matching object', function() {
    const value = { a: 12, b: 'hello' }
    const parseResult = description.parse(value, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal(value)
    expect(numberSpy).to.have.been.calledOnce
    expect(numberSpy.firstCall.args[1].keyName).to.equal('KeYnAmE.a')
    expect(stringSpy).to.have.been.calledOnce
    expect(stringSpy.firstCall.args[1].keyName).to.equal('KeYnAmE.b')
  })

  it('should not add points in keyName if empty', function() {
    description.parse({ a: 12, b: 'hello' }, { keyName: '', fileName: 'FilENamE', final: false })
    expect(numberSpy).to.have.been.calledOnce
    expect(numberSpy.firstCall.args[1].keyName).to.equal('a')
    expect(stringSpy).to.have.been.calledOnce
    expect(stringSpy.firstCall.args[1].keyName).to.equal('b')
  })

  it('should return merged objects', function() {
    const parseResult = description.parse(
      { a: 12 },
      {
        keyName: 'KeYnAmE',
        fileName: 'FilENamE',
        parent: new ParentResult({
          a: new DirectResult(144, 'ParenT'),
          b: new DirectResult('hello', 'ParenT'),
        }),
        final: false,
      }
    )
    expect(parseResult?.configuration).to.deep.equal({ a: 12, b: 'hello' })
    expect((parseResult?.fileName as any).a).to.equal('FilENamE')
    expect((parseResult?.fileName as any).b).to.equal('ParenT')
    expect(numberSpy).to.have.been.calledOnce
    expect(stringSpy).to.have.been.calledOnce
  })

  Array.of<unknown>('hello', 12, '').forEach(value =>
    it(`should throw for ${typeof value} value “${value}”`, function() {
      expect(() =>
        description.parse(value, { keyName: 'KeYnAmE', fileName: 'FilENamE', final: false })
      ).to.throw(/“KeYnAmE” is expected to be an object/)
    })
  )

  it('should create object if undefined input', function() {
    const parseResult = description.parse(undefined, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal({})
  })

  testNullAndUndefined(description, { a: 12, b: 'hello' }, { hasDefaultValue: true, fillInUndefined: true })
})
