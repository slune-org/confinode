/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'
import { basename, dirname } from 'path'

import * as helpers from './helpers'
import * as reexport from '../index'

/**
 * Configuration descriptions, automatically filled by `ts-transform-auto-require`.
 */
const allDescriptions: { [key: string]: any } = {}

/**
 * Check that the tested module exports at least one of the provided name.
 *
 * @param names - The values which may be exported.
 * @returns The matcher function.
 */
function exportOneOf(...names: string[]) {
  return (testedModule: any) => {
    const exportedNames = Object.keys(testedModule)
    return names.some(name => exportedNames.includes(name))
  }
}

describe('Configuration description', function() {
  Object.keys(allDescriptions).forEach(name => {
    const base = basename(name)
    const dir = dirname(name)
    const helperName = base.slice(0, 1).toLowerCase() + base.slice(1, -'Description'.length)
    const itemHelperName = helperName + 'Item'

    describe(`#${base}`, function() {
      it('should have the same name for file and folder', function() {
        expect(dir).to.equal(base)
      })

      it('should have a matching helper', function() {
        expect(helpers).to.satisfy(exportOneOf(helperName, itemHelperName))
      })

      it('should have a matching helper exported from folder', function() {
        expect(reexport).to.satisfy(exportOneOf(helperName, itemHelperName))
      })
    })
  })
})
