#!/usr/bin/env node
var { Confinode, literal, stringItem } = require('confinode')

var description = literal({
  status: stringItem(),
})
var confinode = new Confinode('my-wonderful-app', description, {
  cache: false,
  logger: msg => console.log(msg.toString()),
})

if (process.argv.length !== 3) {
  throw new Error('Bad parameter count — configuration and only configuration is expected')
}
var file = process.argv[2]

async function configAsync() {
  var result = await confinode.load(file)
  var configuration = !!result ? result.configuration : undefined
  if (!configuration || configuration.status !== 'Success') {
    console.error(`Error asynchronously loading configuration from ${file}`)
    result
      ? console.log('Configuration found:\n' + result.configuration)
      : console.log('No configuration found')
    return false
  }
  return true
}

function configSync() {
  var result = confinode.load.sync(file)
  var configuration = !!result ? result.configuration : undefined
  if (!configuration || configuration.status !== 'Success') {
    console.error(`Error synchronously loading configuration from ${file}`)
    result
      ? console.log('Configuration found:\n' + result.configuration)
      : console.log('No configuration found')
    return false
  }
  return true
}

;(async function() {
  var result = true
  result &= await configAsync()
  result &= configSync()
  if (!result) {
    console.log(`Could not load ${file}`)
    process.exit(1)
  } else {
    console.log(`Successfully loaded ${file}`)
  }
})()
