/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'
import * as sinon from 'sinon'
import { SinonSpy } from 'sinon'

import ConfinodeResult from '../../ConfinodeResult'
import { ParserContext } from '../ConfigDescription'
// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'
import { numberItem } from '../helpers'
import OptionalDescription from './OptionalDescription'

const itemDescription = numberItem()
const description = new OptionalDescription(itemDescription)

describe('OptionalDescription', function() {
  let numberSpy: SinonSpy<[unknown, ParserContext<number>], ConfinodeResult<number> | undefined>

  beforeEach('initialize', function() {
    numberSpy = sinon.spy(itemDescription, 'parse')
  })

  afterEach('restore', function() {
    numberSpy.restore()
  })

  it('should return the given input value', function() {
    const parseResult = description.parse(12, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal(12)
    expect(parseResult?.fileName).to.equal('FilENamE')
    expect(numberSpy).to.have.been.calledOnce
  })

  it('should return undefined for undefined data in final round', function() {
    const parseResult = description.parse(undefined, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: true,
    })
    expect(parseResult?.configuration).to.be.undefined
    expect(parseResult?.fileName).to.be.undefined
    expect(numberSpy).to.not.have.been.called
  })

  testNullAndUndefined(description, 12, { hasDefaultValue: true })
})
