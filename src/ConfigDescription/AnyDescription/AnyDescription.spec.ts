/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'

import AnyDescription from './AnyDescription'
// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'

const description = new AnyDescription()

describe('AnyDescription', function() {
  Array.of<any>('hello', Symbol('world'), 12, '', {}, [], ['hello']).forEach(value => {
    it(`should return input ${typeof value} value “${value.toString()}”`, function() {
      const parseResult = description.parse(value, {
        keyName: 'KeYnAmE',
        fileName: 'FilENamE',
        final: false,
      })
      expect(parseResult?.configuration).to.equal(value)
      expect(parseResult?.fileName).to.equal('FilENamE')
    })
  })

  testNullAndUndefined(description, 144)
})
