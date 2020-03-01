/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'
import * as sinon from 'sinon'
import { SinonSpy } from 'sinon'

import { DirectResult, InternalResult, ParentResult } from '../../ConfinodeResult'
import { ParserContext } from '../ConfigDescription'
// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'
import { numberItem } from '../helpers'
import ArrayDescription from './ArrayDescription'

const itemDescription = numberItem()
const description = new ArrayDescription(itemDescription)

describe('ArrayDescription', function() {
  let numberSpy: SinonSpy<[unknown, ParserContext<number>], InternalResult<number> | undefined>

  beforeEach('initialize', function() {
    numberSpy = sinon.spy(itemDescription, 'parse')
  })

  afterEach('restore', function() {
    numberSpy.restore()
  })

  it('should return the array input value', function() {
    const value = [1, 2, 3, 5, 8, 13]
    const parseResult = description.parse(value, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal(value)
    expect(numberSpy).to.have.callCount(value.length)
    numberSpy
      .getCalls()
      .forEach((call, index) => expect(call.args[1].keyName).to.equal(`KeYnAmE[${index}]`))
  })

  it('should return merged arrays', function() {
    const parseResult = description.parse([5, 8, 13], {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      parent: new ParentResult(Array.of(1, 2, 3).map(data => new DirectResult(data, 'ParenT'))),
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal([1, 2, 3, 5, 8, 13])
    Array(3)
      .fill(0)
      .forEach((shift, index) =>
        expect((parseResult?.fileName as string[])[shift + index], `Item #${shift + index}`).to.equal(
          'ParenT'
        )
      )
    Array(3)
      .fill(3)
      .forEach((shift, index) =>
        expect((parseResult?.fileName as string[])[shift + index], `Item #${shift + index}`).to.equal(
          'FilENamE'
        )
      )
    expect(numberSpy).to.have.callCount(3)
    numberSpy
      .getCalls()
      .forEach((call, index) => expect(call.args[1].keyName).to.equal(`KeYnAmE[${index++}]`))
  })

  Array.of<unknown>('hello', 12, {}, '').forEach(value =>
    it(`should throw for ${typeof value} value “${value}”`, function() {
      expect(() =>
        description.parse(value, { keyName: 'KeYnAmE', fileName: 'FilENamE', final: false })
      ).to.throw(/“KeYnAmE” is expected to be an array/)
    })
  )

  testNullAndUndefined(description, [144])
})
