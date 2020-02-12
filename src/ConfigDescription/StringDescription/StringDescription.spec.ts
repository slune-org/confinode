/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'

// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'
import StringDescription from './StringDescription'

const description = new StringDescription()
const descriptionDef = new StringDescription('hello')

describe('StringDescription', function() {
  Array.of('hello', 'world', 'dummy', 'This is a longer sentence.').forEach(value =>
    it(`should return the string input value “${value}”`, function() {
      const parseResult = description.parse(value, {
        keyName: 'KeYnAmE',
        fileName: 'FilENamE',
        final: false,
      })
      expect(parseResult?.configuration).to.equal(value)
      expect(parseResult?.fileName).to.equal('FilENamE')
    })
  )

  Array.of<any>(false, true, 0, 1, 12, 3.14).forEach(value =>
    it(`should also understand the ${typeof value} value “${value}”`, function() {
      const parseResult = description.parse(value, {
        keyName: 'KeYnAmE',
        fileName: 'FilENamE',
        final: false,
      })
      expect(parseResult?.configuration).to.equal(value.toString())
      expect(parseResult?.fileName).to.equal('FilENamE')
    })
  )

  Array.of<any>({}, [], Symbol('hello')).forEach(value =>
    it(`should throw for ${typeof value} value “${value.toString()}”`, function() {
      expect(() =>
        description.parse(value, { keyName: 'KeYnAmE', fileName: 'FilENamE', final: false })
      ).to.throw(/“KeYnAmE” is expected to be a string/)
    })
  )

  testNullAndUndefined(description, 'hello')

  it('should not use default value for non undefined value', function() {
    const parseResult = descriptionDef.parse('world', {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: true,
    })
    expect(parseResult?.configuration).to.equal('world')
    expect(parseResult?.fileName).to.equal('FilENamE')
  })

  it('should use default value for undefined value', function() {
    const parseResult = descriptionDef.parse(undefined, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: true,
    })
    expect(parseResult?.configuration).to.equal('hello')
    expect(parseResult?.fileName).to.be.undefined
  })

  it('should not used default value but throw if data is null in final round', function() {
    expect(() =>
      descriptionDef.parse(null, { keyName: 'KeYnAmE', fileName: 'FilENamE', final: true })
    ).to.throw(/missing mandatory “KeYnAmE” option/)
  })
})
