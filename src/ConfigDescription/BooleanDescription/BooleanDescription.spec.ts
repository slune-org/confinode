/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'

// eslint-disable-next-line import/no-internal-modules
import { testNullAndUndefined } from '../ConfigDescription/ConfigDescription.spec'
import BooleanDescription from './BooleanDescription'

const description = new BooleanDescription(false)

describe('BooleanDescription', function() {
  Array.of(false, true).forEach(value =>
    it(`should return the boolean input value “${value}”`, function() {
      const parseResult = description.parse(value, {
        keyName: 'KeYnAmE',
        fileName: 'FilENamE',
        final: false,
      })
      expect(parseResult?.configuration).to.equal(value)
      expect(parseResult?.fileName).to.equal('FilENamE')
    })
  )

  Object.entries({
    0: false,
    1: true,
    true: true,
    t: true,
    T: true,
    True: true,
    false: false,
    f: false,
    FALSE: false,
  }).forEach(([value, result]) => {
    const realValues: any[] = [value]
    const convert = Number(value)
    if (!isNaN(convert)) {
      realValues.push(convert)
    }
    realValues.forEach(realValue =>
      it(`should also understand ${typeof realValue} value “${realValue}”`, function() {
        const parseResult = description.parse(realValue, {
          keyName: 'KeYnAmE',
          fileName: 'FilENamE',
          final: false,
        })
        expect(parseResult?.configuration).to.equal(result)
        expect(parseResult?.fileName).to.equal('FilENamE')
      })
    )
  })

  Array.of<any>('dummy', {}, [], '', 2).forEach(value =>
    it(`should throw for ${typeof value} value “${value}”`, function() {
      expect(() =>
        description.parse(value, { keyName: 'KeYnAmE', fileName: 'FilENamE', final: false })
      ).to.throw(/“KeYnAmE” is expected to be a boolean/)
    })
  )

  it('should return false if value is undefined in final round', function() {
    const parseResult = description.parse(undefined, {
      keyName: 'KeYnAmE',
      fileName: 'FilENamE',
      final: true,
    })
    expect(parseResult?.configuration).to.equal(false)
    expect(parseResult?.fileName).to.be.undefined
  })

  testNullAndUndefined(description, true, { hasDefaultValue: true })
})
