/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'
import * as sinon from 'sinon'
import { SinonSpy } from 'sinon'

import ConfinodeResult from '../../ConfinodeResult'
import { ParserContext } from '../ConfigDescription'
// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'
import { numberItem } from '../helpers'
import DefaultValueDescription from './DefaultValueDescription'

const itemDescription = numberItem()
const description = new DefaultValueDescription(itemDescription, 12)

describe('DefaultValueDescription', function() {
  let numberSpy: SinonSpy<[unknown, ParserContext<number>], ConfinodeResult<number> | undefined>

  beforeEach('initialize', function() {
    numberSpy = sinon.spy(itemDescription, 'parse')
  })

  afterEach('restore', function() {
    numberSpy.restore()
  })

  it('should return the given input value', function() {
    const parseResult = description.parse(144, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.equal(144)
    expect(parseResult?.fileName).to.equal('FilENamE')
    expect(numberSpy).to.have.been.calledOnce
  })

  it('should return the default value for undefined in final round', function() {
    const parseResult = description.parse(undefined, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: true,
    })
    expect(parseResult?.configuration).to.equal(12)
    expect(parseResult?.fileName).to.be.undefined
    expect(numberSpy).to.not.have.been.called
  })

  testNullAndUndefined(description, 144, { hasDefaultValue: true })
})
