/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'

import { numberItem } from '../helpers'
import SingleOrArrayDescription from './SingleOrArrayDescription'

const description = new SingleOrArrayDescription(numberItem())

describe('SingleOrArrayDescription', function() {
  it('should accept a non array input', function() {
    const parseResult = description.parse(12, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal([12])
  })

  it('should accept an array input', function() {
    const parseResult = description.parse([12, 144, 1728], {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: false,
    })
    expect(parseResult?.configuration).to.deep.equal([12, 144, 1728])
  })
})
