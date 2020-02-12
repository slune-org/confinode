/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'

// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'
import ChoiceDescription from './ChoiceDescription'

const description = new ChoiceDescription(['hello', 'world', 12, '144', 'false'])
const descriptionDef = new ChoiceDescription([0, 12, 144], 12)

describe('ChoiceDescription', function() {
  Array.of<any>('hello', 'world', 12, '144', 'false').forEach(value =>
    it(`should return the choice input value “${value}”`, function() {
      const parseResult = description.parse(value, {
        keyName: 'KeYnAmE',
        fileName: 'FilENamE',
        final: false,
      })
      expect(parseResult?.configuration).to.equal(value)
      expect(parseResult?.fileName).to.equal('FilENamE')
    })
  )

  Array.of<any>('12', 144, false).forEach(value =>
    it(`should also understand the ${typeof value} value “${value}”`, function() {
      const parseResult = description.parse(value, {
        keyName: 'KeYnAmE',
        fileName: 'FilENamE',
        final: false,
      })
      expect(typeof parseResult?.configuration).to.not.equal(typeof value)
      expect(parseResult?.configuration.toString()).to.equal(value.toString())
      expect(parseResult?.fileName).to.equal('FilENamE')
    })
  )

  Array.of<any>('dummy', 1, true, {}, [], '').forEach(value =>
    it(`should throw for ${typeof value} value “${value}”`, function() {
      expect(() =>
        description.parse(value, { keyName: 'KeYnAmE', fileName: 'FilENamE', final: false })
      ).to.throw(/“KeYnAmE” is expected to be one of/)
    })
  )

  testNullAndUndefined(description, 'hello')

  it('should not use default value for non undefined value', function() {
    const parseResult = descriptionDef.parse(144, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: true,
    })
    expect(parseResult?.configuration).to.equal(144)
    expect(parseResult?.fileName).to.equal('FilENamE')
  })

  it('should use default value for undefined value', function() {
    const parseResult = descriptionDef.parse(undefined, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: true,
    })
    expect(parseResult?.configuration).to.equal(12)
    expect(parseResult?.fileName).to.be.undefined
  })

  it('should not used default value but throw if data is null in final round', function() {
    expect(() =>
      descriptionDef.parse(null, { keyName: 'KeYnAmE', fileName: 'FilENamE', final: true })
    ).to.throw(/missing mandatory “KeYnAmE” option/)
  })
})
