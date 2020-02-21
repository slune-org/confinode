/* eslint-disable prefer-arrow-callback, no-unused-expressions */
import { expect } from 'chai'
import { join, resolve } from 'path'

import { booleanItem, literal, stringItem, anyItem } from '../ConfigDescription'
import { Message } from '../messages'
import FileDescription, { noPackageJson } from '../FileDescription'
import Confinode from './Confinode'
import ConfinodeOptions from './ConfinodeOptions'

// Configuration interface
interface Configuration {
  found: boolean
  where: string
}
const configurationDescription = literal<Configuration>({
  found: booleanItem(),
  where: stringItem(),
})

// Complex configuration
interface ComplexConfig {
  a: string
  b: string
  c: string
  d: string
  e: string
}
const complexConfigurationDescription = literal<ComplexConfig>({
  a: stringItem(),
  b: stringItem(),
  c: stringItem(),
  d: stringItem(),
  e: stringItem(),
})

// Test directories
const testDir = resolve(__dirname, '../../__tests__')
const moduleDir = join(testDir, 'stop', 'files')

// Logger used to discard logs.
// eslint-disable-next-line @typescript-eslint/no-empty-function
function ignoreLogs() {}

// Logger used to catch logs
let storedLogs: Message<any>[] = []
function catchLogs(log: Message<any>) {
  storedLogs.push(log)
}

// Catch console
function catchConsole<R>(callback: (log: string[], error: string[]) => R): R {
  /* eslint-disable no-console */
  const initialOutputChanel = console.log
  const initialErrorChanel = console.error
  const reset = () => {
    console.log = initialOutputChanel
    console.error = initialErrorChanel
  }
  let asyncCallback = false
  try {
    const log: string[] = []
    console.log = (msg: string) => log.push(msg)
    const error: string[] = []
    console.error = (msg: string) => error.push(msg)
    const result = callback(log, error)
    if (result instanceof Promise) {
      asyncCallback = true
      result.finally(reset)
    }
    return result
  } finally {
    if (!asyncCallback) {
      reset()
    }
  }
  /* eslint-enable no-console */
}

describe('Confinode', function() {
  describe('#constructor (mode)', function() {
    it('should create a default object, even with no description', async function() {
      const confinode = new Confinode('titanic')
      await expect(confinode.search(moduleDir)).to.eventually.deep.equal({
        configuration: { found: true, where: 'package.json' },
        fileName: join(moduleDir, 'package.json'),
        files_: {
          extends: [],
          name: join(moduleDir, 'package.json'),
        },
      })
    })

    Object.entries({
      'asynchronous (no options)': () => new Confinode('titanic', configurationDescription),
      'asynchronous (default)': () =>
        new Confinode('titanic', configurationDescription, { logger: ignoreLogs }),
      'asynchronous (specified)': () =>
        new Confinode('titanic', configurationDescription, { mode: 'async', logger: ignoreLogs }),
    } as { [name: string]: () => Confinode<Configuration, 'async'> }).forEach(([name, createConfinode]) => {
      describe(`#${name}`, function() {
        const confinode = createConfinode()

        beforeEach('Clear cache', function() {
          confinode.clearCache()
        })

        it('should find appropriate file', async function() {
          const promise = confinode.search(moduleDir)
          await expect(promise).to.eventually.not.be.undefined
          const result = await promise
          expect(result?.configuration.found).to.be.true
          expect(result?.configuration.where).to.equal('package.json')
        })

        it('should find appropriate file synchronously', function() {
          const result = confinode.search.sync(moduleDir)
          expect(result).not.to.be.undefined
          expect(result?.configuration.found).to.be.true
          expect(result?.configuration.where).to.equal('package.json')
        })

        it('should load requested file', async function() {
          const promise = confinode.load(join(testDir, '.gonewiththewindrc.ts'))
          await expect(promise).to.eventually.not.be.undefined
          const result = await promise
          expect(result?.configuration.found).to.be.true
          expect(result?.configuration.where).to.equal('.gonewiththewindrc.ts')
        })

        it('should load requested file synchronously', function() {
          const result = confinode.load.sync(join(testDir, '.gonewiththewindrc.ts'))
          expect(result).not.to.be.undefined
          expect(result?.configuration.found).to.be.true
          expect(result?.configuration.where).to.equal('.gonewiththewindrc.ts')
        })

        it('should not contain search.async method', function() {
          expect((confinode.search as any).async).to.be.undefined
        })

        it('should not contain load.async method', function() {
          expect((confinode.load as any).async).to.be.undefined
        })
      })
    })

    describe('#synchronous', function() {
      const confinode = new Confinode('titanic', configurationDescription, {
        mode: 'sync',
        logger: ignoreLogs,
      })

      beforeEach('Clear cache', function() {
        confinode.clearCache()
      })

      it('should find appropriate file', function() {
        const result = confinode.search(moduleDir)
        expect(result).not.to.be.undefined
        expect(result?.configuration.found).to.be.true
        expect(result?.configuration.where).to.equal('package.json')
      })

      it('should find appropriate file asynchronously', async function() {
        const promise = confinode.search.async(moduleDir)
        await expect(promise).to.eventually.not.be.undefined
        const result = await promise
        expect(result?.configuration.found).to.be.true
        expect(result?.configuration.where).to.equal('package.json')
      })

      it('should load requested file', function() {
        const result = confinode.load(join(testDir, '.gonewiththewindrc.ts'))
        expect(result).not.to.be.undefined
        expect(result?.configuration.found).to.be.true
        expect(result?.configuration.where).to.equal('.gonewiththewindrc.ts')
      })

      it('should load requested file asynchronously', async function() {
        const promise = confinode.load.async(join(testDir, '.gonewiththewindrc.ts'))
        await expect(promise).to.eventually.not.be.undefined
        const result = await promise
        expect(result?.configuration.found).to.be.true
        expect(result?.configuration.where).to.equal('.gonewiththewindrc.ts')
      })

      it('should not contain search.sync method', function() {
        expect((confinode.search as any).sync).to.be.undefined
      })

      it('should not contain load.sync method', function() {
        expect((confinode.load as any).sync).to.be.undefined
      })
    })
  })

  describe('#constructor (options)', function() {
    describe('#cache', function() {
      Object.entries({
        'not set': { result: true, options: { logger: catchLogs } },
        'set to true': { result: true, options: { cache: true, logger: catchLogs } },
        'set to undefined': { result: true, options: { cache: undefined, logger: catchLogs } },
        'set to null': { result: true, options: { cache: null as any, logger: catchLogs } },
        'set to false': { result: false, options: { cache: false, logger: catchLogs } },
      } as { [name: string]: { result: boolean; options: ConfinodeOptions<'async'> } }).forEach(
        ([name, testConfig]) =>
          it(`should${testConfig.result ? '' : ' not'} use cache if option is ${name}`, async function() {
            const confinode = new Confinode<Configuration, 'async'>(
              'gonewiththewind',
              configurationDescription,
              testConfig.options
            )
            storedLogs = []
            await confinode.search(moduleDir)
            expect(storedLogs.map(message => message.messageId))
              .to.include('loadingFile')
              .and.not.include('loadedFromCache')
            await Promise.all(
              Array.of(
                () => confinode.search(moduleDir),
                () => confinode.search(join(testDir, 'stop')),
                () => confinode.load(join(testDir, '.gonewiththewindrc.ts'))
              ).map(async run => {
                storedLogs = []
                await run()
                if (testConfig.result) {
                  expect(storedLogs.map(message => message.messageId)).to.include('loadedFromCache')
                } else {
                  expect(storedLogs.map(message => message.messageId)).and.not.include('loadedFromCache')
                }
              })
            )
            Array.of(
              () => confinode.search.sync(moduleDir),
              () => confinode.search.sync(join(testDir, 'stop')),
              () => confinode.load.sync(join(testDir, '.gonewiththewindrc.ts'))
            ).map(run => {
              storedLogs = []
              run()
              if (testConfig.result) {
                expect(storedLogs.map(message => message.messageId)).to.include('loadedFromCache')
              } else {
                expect(storedLogs.map(message => message.messageId)).and.not.include('loadedFromCache')
              }
            })
          })
      )
    })

    describe('#searchStop', function() {
      Object.entries({
        'not set': { logger: ignoreLogs },
        'set to undefined': { searchStop: undefined, logger: ignoreLogs },
        'set to null': { searchStop: null as any, logger: ignoreLogs },
        'set to higher level': { searchStop: testDir, logger: ignoreLogs },
      } as { [name: string]: ConfinodeOptions<'async'> }).forEach(([name, config]) => {
        it(`should find configuration file when option is ${name}`, async function() {
          const confinode = new Confinode('gonewiththewind', configurationDescription, config)
          await expect(confinode.search(moduleDir)).to.eventually.not.be.undefined
        })
      })

      it('should not find configuration file when option is too low', async function() {
        const confinode = new Confinode('gonewiththewind', configurationDescription, {
          searchStop: moduleDir,
          logger: ignoreLogs,
        })
        await expect(confinode.search(moduleDir)).to.eventually.be.undefined
      })

      it('should be able to load file even out of scope', async function() {
        const confinode = new Confinode('gonewiththewind', configurationDescription, {
          searchStop: moduleDir,
          logger: ignoreLogs,
        })
        await expect(confinode.load(join(testDir, '.gonewiththewindrc.ts'))).to.eventually.not.be.undefined
      })

      it('should stop searching when reaching root', async function() {
        const confinode = new Confinode('gonewiththewind', configurationDescription, {
          searchStop: moduleDir,
          logger: ignoreLogs,
        })
        await expect(confinode.search('/')).to.eventually.be.undefined
      })
    })

    describe('#modulePaths', function() {
      it('should not find external module if no external search path', async function() {
        const confinode = new Confinode('titanic', configurationDescription, { logger: ignoreLogs })
        await expect(confinode.load(join(moduleDir, 'modulePaths.toml'))).to.eventually.be.undefined
      })

      it('should find external module if external search path', async function() {
        const confinode = new Confinode('titanic', configurationDescription, {
          logger: ignoreLogs,
          modulePaths: [join(testDir, 'projects', 'tested', 'project1')],
        })
        const promise = confinode.load(join(moduleDir, 'modulePaths.toml'))
        await expect(promise).to.eventually.not.be.undefined
        const result = await promise
        expect(result?.configuration.found).to.be.true
        expect(result?.configuration.where).to.equal('modulePaths.toml')
      })
    })

    describe('#logger', function() {
      it('should display warnings and errors in console for asynchronous calls', async function() {
        await catchConsole(async (log, error) => {
          const confinode = new Confinode('badfile')
          await confinode.search(moduleDir)
          expect(log).to.have.lengthOf(1)
          expect(log[0]).to.match(/multiple configuration files found/i)
          expect(error).to.have.lengthOf(1)
          expect(error[0]).to.match(/error while loading configuration/i)
        })
      })

      it('should display warnings and errors in console for synchronous calls', function() {
        catchConsole((log, error) => {
          const confinode = new Confinode('badfile', anyItem(), { mode: 'sync' })
          confinode.search(moduleDir)
          expect(log).to.have.lengthOf(1)
          expect(log[0]).to.match(/multiple configuration files found/i)
          expect(error).to.have.lengthOf(1)
          expect(error[0]).to.match(/error while loading configuration/i)
        })
      })
    })

    describe('#files', function() {
      it('should find all configuration files with default options', async function() {
        const titanic = new Confinode('titanic', configurationDescription, { logger: ignoreLogs })
        await expect(titanic.search(moduleDir)).to.eventually.not.be.undefined
        const starwars = new Confinode('starwars', configurationDescription, { logger: ignoreLogs })
        const starwarsConfig = await starwars.search(moduleDir)
        expect(starwarsConfig?.configuration.where).to.equal('package.json')
      })

      it('should not find package.json if filtered out', async function() {
        const titanic = new Confinode('titanic', configurationDescription, {
          logger: ignoreLogs,
          files: [noPackageJson],
        })
        await expect(titanic.search(moduleDir)).to.eventually.be.undefined
        const starwars = new Confinode('starwars', configurationDescription, {
          logger: ignoreLogs,
          files: [noPackageJson],
        })
        const starwarsConfig = await starwars.search(moduleDir)
        expect(starwarsConfig?.configuration.where).to.equal('.starwarsrc.js')
      })

      it('should not find filtered out files', async function() {
        const myFilter = (descriptions: FileDescription[]) =>
          descriptions.filter(description => typeof description !== 'string' || !description.endsWith('rc'))
        const starwars = new Confinode('starwars', configurationDescription, {
          logger: ignoreLogs,
          files: [noPackageJson, myFilter],
        })
        await expect(starwars.search(moduleDir)).to.eventually.be.undefined
      })

      it('should find files directly provided to the list', async function() {
        const titanic = new Confinode('titanic', configurationDescription, {
          logger: ignoreLogs,
          files: ['.gonewiththewindrc'],
        })
        const titanicResult = await titanic.search(moduleDir)
        expect(titanicResult?.configuration.where).to.equal('.gonewiththewindrc.ts')
      })
    })
  })

  describe('#search', function() {
    it('should search for configuration file based on current folder', async function() {
      const confinode = new Confinode('keywords', anyItem(), { logger: ignoreLogs })
      const result = await confinode.search()
      expect(result?.configuration)
        .to.be.an('array')
        .and.include('configuration')
    })

    it('should search for configuration file based on given folder', async function() {
      const theexorcist = new Confinode('theexorcist', configurationDescription, {
        logger: ignoreLogs,
      })
      const result = await theexorcist.search(moduleDir)
      expect(result?.configuration.where).to.equal('theexorcist.config.js')
    })

    it('should search for configuration file based on a file', async function() {
      const gonewiththewind = new Confinode('gonewiththewind', configurationDescription, {
        logger: ignoreLogs,
      })
      const result = await gonewiththewind.search(join(moduleDir, 'package.json'))
      expect(result?.configuration.where).to.equal('.gonewiththewindrc.ts')
    })
  })

  describe('#load', function() {
    const confinode = new Confinode('titanic', configurationDescription, {
      logger: catchLogs,
    })
    const anyConfinode = new Confinode('unused', anyItem(), {
      logger: catchLogs,
    })
    const complexConfig = new Confinode('complex', complexConfigurationDescription, {
      logger: ignoreLogs,
    })
    const badComplex = new Confinode('recursive', complexConfigurationDescription, {
      logger: catchLogs,
    })

    beforeEach('Clear stored logs', function() {
      storedLogs = []
    })

    it('should load given absolute configuration file', async function() {
      await confinode.load(join(moduleDir, '.starwarsrc.js'))
      await expect(confinode.load(join(moduleDir, '.starwarsrc.js'))).to.eventually.not.be.undefined
    })

    it('should load given relative configuration file', async function() {
      await expect(anyConfinode.load('./package.json')).to.eventually.not.be.undefined
      const loadedFile = storedLogs.find(message => message.messageId === 'loadingFile')
      expect(loadedFile).not.to.be.undefined
      expect(loadedFile?.toString()).to.match(/\/package.json$/)
    })

    it('should load module main file', async function() {
      await expect(anyConfinode.load('mocha')).to.eventually.not.be.undefined
      const loadedFile = storedLogs.find(message => message.messageId === 'loadingFile')
      expect(loadedFile).not.to.be.undefined
      expect(loadedFile?.toString()).to.match(/\/node_modules\/([^/]+\/)*mocha\/index.js$/)
    })

    it('should load internal module file', async function() {
      await expect(anyConfinode.load('mocha/lib/mocha.js')).to.eventually.not.be.undefined
      const loadedFile = storedLogs.find(message => message.messageId === 'loadingFile')
      expect(loadedFile).not.to.be.undefined
      expect(loadedFile?.toString()).to.match(/\/node_modules\/([^/]+\/)*mocha\/lib\/mocha.js$/)
    })

    it('should return undefined if file does not exist', async function() {
      await expect(confinode.load(join(moduleDir, 'notexist'))).to.eventually.be.undefined
      expect(storedLogs.map(message => message.messageId)).to.include('fileNotFound')
    })

    it('should display an error if file cannot be loaded', async function() {
      await expect(confinode.load(join(moduleDir, '.badfilerc.yml'))).to.eventually.be.undefined
      expect(storedLogs.map(message => message.messageId)).to.include('loadingError')
    })

    it('should display an error if no loader found for file', async function() {
      await expect(confinode.load(join(moduleDir, 'noloader'))).to.eventually.be.undefined
      expect(storedLogs.map(message => message.messageId)).to.include('noLoaderFound')
    })

    it('should manage inheritance and indirections', async function() {
      // We use search because we start the loading with package.json content
      const result = await complexConfig.search(moduleDir)
      expect(result?.configuration).to.deep.equal({
        a: 'a in complex.json',
        b: 'b in complex.yaml',
        c: 'c in complex.js',
        d: 'd in complex.json',
        e: 'e in complex.ts',
      })
      expect(result?.fileName).to.deep.equal({
        a: join(moduleDir, 'complex.json'),
        b: join(moduleDir, 'complex.yaml'),
        c: join(moduleDir, 'complex.js'),
        d: join(moduleDir, 'complex.json'),
        e: join(moduleDir, 'complex.ts'),
      })
      expect(result?.files).to.deep.equal({
        name: join(moduleDir, 'complex.json'),
        extends: [
          {
            name: join(moduleDir, 'complex.js'),
            extends: [{ name: join(moduleDir, 'complex.ts'), extends: [] }],
          },
          {
            name: join(moduleDir, 'complex.yaml'),
            extends: [{ name: join(moduleDir, 'complex.ts'), extends: [] }],
          },
        ],
      })
    })

    it('should manage recursive inheritance and indirections', async function() {
      // We use search because we start the loading with package.json content
      await expect(badComplex.search(moduleDir)).to.eventually.be.undefined
      expect(storedLogs.map(message => message.messageId)).to.include('recursion')
    })

    it('should manage wrongly formatted extends', async function() {
      await expect(badComplex.load(join(moduleDir, 'badextend.json'))).to.eventually.be.undefined
      expect(storedLogs.map(message => message.messageId)).to.include('badExtends')
    })
  })
})
