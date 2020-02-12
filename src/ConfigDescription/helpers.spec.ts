/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'

import {
  anyItem,
  array,
  booleanItem,
  choiceItem,
  conditional,
  defaultValue,
  literal,
  numberItem,
  optional,
  override,
  singleOrArray,
  stringItem,
} from './helpers'

interface Config {
  a: any
  b: {
    c: boolean
    d: 'hello' | 'world' | 12
    e: number
    f?: {
      g?: string
      h: string[]
    }
    i: Array<{
      j: number[]
      k?: boolean
      l: string
    }>
    m: {
      n: string
      o?: string
    }
  }
  p: { q: string } | { r: number }
}
const description = literal<Config>({
  a: anyItem(),
  b: literal({
    c: booleanItem(),
    d: choiceItem(['hello', 'world', 12]),
    e: numberItem(1),
    f: optional(
      literal({
        g: optional(stringItem()),
        h: defaultValue(singleOrArray(stringItem()), ['yolo']),
      })
    ),
    i: array(
      literal({
        j: override(array(numberItem())),
        k: optional(booleanItem()),
        l: stringItem(),
      })
    ),
    m: literal({
      n: stringItem('mandatory'),
      o: optional(stringItem()),
    }),
  }),
  p: conditional(
    value => 'q' in (value as any),
    literal({ q: stringItem() }),
    literal({ r: numberItem() })
  ),
})
function dummy() {
  return
}

describe('helpers', function() {
  it('should fill in default values', function() {
    const parseResult = description.parse(
      {
        a: dummy,
        b: { d: 'world', i: [{ j: [], l: 'Saluton' }] },
        p: { q: 'foo' },
      },
      { keyName: '', fileName: 'FilENamE', final: true }
    )
    expect(parseResult?.configuration).to.deep.equal({
      a: dummy,
      b: {
        c: false,
        d: 'world',
        e: 1,
        f: undefined,
        i: [{ j: [], k: undefined, l: 'Saluton' }],
        m: { n: 'mandatory', o: undefined },
      },
      p: { q: 'foo' },
    })
  })

  it('should use provided values', function() {
    const parseResult = description.parse(
      {
        a: {},
        b: { c: true, d: 'hello', e: 12, f: {}, i: [], m: { n: 'Saluton' } },
        p: { r: 12 },
      },
      { keyName: '', fileName: 'FilENamE', final: true }
    )
    expect(parseResult?.configuration).to.deep.equal({
      a: {},
      b: {
        c: true,
        d: 'hello',
        e: 12,
        f: { g: undefined, h: ['yolo'] },
        i: [],
        m: { n: 'Saluton', o: undefined },
      },
      p: { r: 12 },
    })
  })
})
