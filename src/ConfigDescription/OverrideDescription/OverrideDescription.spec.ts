/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'
import * as sinon from 'sinon'
import { SinonSpy } from 'sinon'

import { DirectResult, InternalResult, ParentResult } from '../../ConfinodeResult'
import ArrayDescription from '../ArrayDescription'
import { ParserContext } from '../ConfigDescription'
import { numberItem } from '../helpers'
import OverrideDescription from './OverrideDescription'

const itemDescription = numberItem()
const description = new OverrideDescription(new ArrayDescription(itemDescription))

describe('OverrideDescription', function() {
  let numberSpy: SinonSpy<[unknown, ParserContext<number>], InternalResult<number> | undefined>

  beforeEach('initialize', function() {
    numberSpy = sinon.spy(itemDescription, 'parse')
  })

  afterEach('restore', function() {
    numberSpy.restore()
  })

  it('should return overriden values', function() {
    const parseResult = description.parse([5, 8, 13], {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      parent: new ParentResult(Array.of(1, 2, 3).map(data => new DirectResult(data, 'ParenT'))),
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal([5, 8, 13])
    Array(3)
      .fill(0)
      .forEach((shift, index) =>
        expect((parseResult?.fileName as string[])[index], `Item #${shift + index}`).to.equal('FilENamE')
      )
    expect(numberSpy).to.have.callCount(3)
    numberSpy
      .getCalls()
      .forEach((call, index) => expect(call.args[1].keyName).to.equal(`KeYnAmE[${index++}]`))
  })

  it('should return parent values if no overriden values', function() {
    const parseResult = description.parse(undefined, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      parent: new ParentResult(Array.of(1, 2, 3).map(data => new DirectResult(data, 'ParenT'))),
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal([1, 2, 3])
    expect(numberSpy).to.not.have.been.called
  })
})
