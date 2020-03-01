/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'
import * as sinon from 'sinon'
import { SinonSpy } from 'sinon'

import { InternalResult } from '../../ConfinodeResult'
import { ParserContext } from '../ConfigDescription'
// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'
import { numberItem, stringItem } from '../helpers'
import ConditionalDescription from './ConditionalDescription'

const ifDescription = numberItem()
const elseDescription = stringItem()
let predicateValue: boolean
function predicate(_: unknown): boolean {
  return predicateValue
}
const description = new ConditionalDescription(predicate, ifDescription, elseDescription)

describe('ConditionalDescription', function() {
  let numberSpy: SinonSpy<[unknown, ParserContext<number>], InternalResult<number> | undefined>
  let stringSpy: SinonSpy<[unknown, ParserContext<string>], InternalResult<string> | undefined>

  beforeEach('initialize', function() {
    numberSpy = sinon.spy(ifDescription, 'parse')
    stringSpy = sinon.spy(elseDescription, 'parse')
    predicateValue = true
  })

  afterEach('restore', function() {
    numberSpy.restore()
    stringSpy.restore()
  })

  it('should use the first description if predicate is true', function() {
    const parseResult = description.parse(12, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.equal(12)
    expect(parseResult?.fileName).to.equal('FilENamE')
    expect(numberSpy).to.have.been.calledOnce
    expect(stringSpy).to.not.have.been.called
  })

  it('should use the second description if predicate is false', function() {
    predicateValue = false
    const parseResult = description.parse('hello', {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.equal('hello')
    expect(parseResult?.fileName).to.equal('FilENamE')
    expect(numberSpy).to.not.have.been.called
    expect(stringSpy).to.have.been.calledOnce
  })

  testNullAndUndefined(description, 'hello')
})
