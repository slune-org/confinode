#!/usr/bin/env node
const { Confinode, literal, stringItem } = require('confinode')

const description = literal({
  status: stringItem(),
})
const confinode = new Confinode('my-wonderful-app', description, {
  cache: false,
  logger: msg => console.log(msg.toString()),
})

if (process.argv.length < 3 || process.argv.length > 4) {
  throw new Error('Bad parameter count — configuration and only configuration is expected')
}
const file = process.argv[2]
const options = { noSync: false }
if (process.argv.length === 4) {
  if (process.argv[3] === '--noSync') {
    options.noSync = true
  }
}

async function configAsync() {
  const result = await confinode.load(file)
  const configuration = !!result ? result.configuration : undefined
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
  const result = confinode.load.sync(file)
  const configuration = !!result ? result.configuration : undefined
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
  options.noSync || (result &= configSync())
  if (!result) {
    console.log(`Could not load ${file}`)
    process.exit(1)
  } else {
    console.log(`Successfully loaded ${file}`)
  }
})()
