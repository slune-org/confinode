/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'

// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'
import NumberDescription from './NumberDescription'

const description = new NumberDescription()
const descriptionDef = new NumberDescription(12)

describe('NumberDescription', function() {
  Array.from(Array(12), (_, i) => i)
    .concat(3.14)
    .forEach(value => {
      it(`should return the number input value “${value}”`, function() {
        const parseResult = description.parse(value, {
          keyName: 'KeYnAmE',
          fileName: 'FilENamE',
          final: false,
        })
        expect(parseResult?.configuration).to.equal(value)
        expect(parseResult?.fileName).to.equal('FilENamE')
      })

      it(`should also understand the string “${value}”`, function() {
        const parseResult = description.parse(String(value), {
          keyName: 'KeYnAmE',
          fileName: 'FilENamE',
          final: false,
        })
        expect(parseResult?.configuration).to.equal(value)
        expect(parseResult?.fileName).to.equal('FilENamE')
      })
    })

  Array.of<any>('dummy', [], '', {}, false).forEach(value =>
    it(`should throw for ${typeof value} value “${value}”`, function() {
      expect(() =>
        description.parse(value, { keyName: 'KeYnAmE', fileName: 'FilENamE', final: false })
      ).to.throw(/“KeYnAmE” is expected to be a number/)
    })
  )

  testNullAndUndefined(description, 12)

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
