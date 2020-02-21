#!/usr/bin/env node
var { Confinode, literal, stringItem } = require('confinode')

var description = literal({
  status: stringItem(),
})
var confinode = new Confinode('my-wonderful-app', description, {
  logger: msg => console.log(msg.toString()),
  mode: 'sync',
})

if (process.argv.length !== 3) {
  throw new Error('Bad parameter count — configuration and only configuration is expected')
}
var file = process.argv[2]
var result = confinode.load(file)
var configuration = !!result ? result.configuration : undefined
if (!configuration || configuration.status !== 'Success') {
  console.error(`Error loading configuration from ${file}`)
  result
    ? console.log('Configuration found:\n' + result.configuration)
    : console.log('No configuration found')
  throw new Error(`Could not load ${file}`)
} else {
  console.log(`Successfully loaded ${file}`)
}
