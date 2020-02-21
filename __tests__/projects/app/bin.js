#!/usr/bin/env node
var { Confinode, literal, stringItem } = require('confinode')

var description = literal({
  status: stringItem(),
})
var confinode = new Confinode('my-wonderful-app', description, { mode: 'sync' })

if (process.argv.length !== 3) {
  throw new Error('Bad parameter count — configuration and only configuration is expected')
}
var file = process.argv[2]
var result = confinode.load(file)
if (result.configuration.status !== 'Success') {
  throw new Error(`Could not load ${file}`)
} else {
  console.log(`Successfully loaded ${file}`)
}
