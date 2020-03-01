'use strict'
Object.defineProperty(exports, '__esModule', { value: true })

/**
 * Loader implementation.
 */
class LoaderImplementation {
  async load(fileName) {
    return (await import(fileName)).default
  }
}

/**
 * Loader description.
 */
const description = {
  filetypes: ['js', 'mjs'],
  Loader: LoaderImplementation,
}
exports.default = description
