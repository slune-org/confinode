/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'

import { defaultFiles, isFileBasename, noPackageJson } from '.'

describe('File descriptions', function() {
  it('should give the list of default file names in defaultFiles', function() {
    expect(
      defaultFiles('[name]').map(file => (isFileBasename(file) ? file : `“${file.name}”`))
    ).to.deep.equal([
      '“package.json”',
      '“.[name]rc”',
      '.[name]rc',
      '[name].config',
      '.[name]/[name].config',
    ])
  })

  it('should filter out package.json in noPackageJson', function() {
    expect(
      noPackageJson([
        { name: 'package.json', loader: undefined as any },
        { name: 'other-name', loader: undefined as any },
        { name: 'package.json', loader: undefined as any },
        'another-one',
        { name: 'package.json', loader: undefined as any },
      ])
    ).to.deep.equal([{ name: 'other-name', loader: undefined }, 'another-one'])
  })
})
