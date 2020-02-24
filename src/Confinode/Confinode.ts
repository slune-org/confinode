import { isAbsolute, basename, dirname, join, resolve } from 'path'

import ConfigDescription, { anyItem } from '../ConfigDescription'
import ConfinodeError from '../ConfinodeError'
import FileDescription, { defaultFiles, isFileBasename } from '../FileDescription'
import Loader, { LoaderManager } from '../Loader'
import { Level, Message, MessageId, MessageParameters } from '../messages'
import { Cache, ensureArray, isExisting, pushIfNew, unique } from '../utils'
import ConfinodeOptions, { ConfinodeParameters, defaultConfig, filesAreFilters } from './ConfinodeOptions'
import ConfinodeResult, { ResultFile } from '../ConfinodeResult'
import {
  Request,
  asyncExecute,
  requestIsFolder,
  requestFileExits,
  requestFolderContent,
  requestLoadConfigFile,
  syncExecute,
} from './synchronization'

// The type for polymorphic methods
type SearchFunctionType<T extends object, M extends 'async' | 'sync'> = M extends 'async'
  ? {
      (searchStart?: string): Promise<ConfinodeResult<T> | undefined>
      sync: (searchStart?: string) => ConfinodeResult<T> | undefined
    }
  : {
      (searchStart?: string): ConfinodeResult<T> | undefined
      async: (searchStart?: string) => Promise<ConfinodeResult<T> | undefined>
    }
type LoadFunctionType<T extends object, M extends 'async' | 'sync'> = M extends 'async'
  ? {
      (name: string): Promise<ConfinodeResult<T> | undefined>
      sync: (name: string) => ConfinodeResult<T> | undefined
    }
  : {
      (name: string): ConfinodeResult<T> | undefined
      async: (name: string) => Promise<ConfinodeResult<T> | undefined>
    }

/**
 * Recursive parameters for loading process.
 */
interface LoadingParameters<T> {
  alreadyLoaded: string[]
  intermediateResult: ConfinodeResult<T> | undefined
  disableCache: boolean
  final: boolean
}

/**
 * Test if the given parameter is a set of loading process parameter.
 *
 * @param parameter - The parameter to test.
 * @returns True if loading process parameters.
 */
function isLoadingParameters<T>(
  parameter: [Loader, string | undefined] | LoadingParameters<T>
): parameter is LoadingParameters<T> {
  return !Array.isArray(parameter)
}

/**
 * The default loading parameters, for the first loaded file.
 */
const defaultLoadingParameters: LoadingParameters<any> = {
  alreadyLoaded: [],
  intermediateResult: undefined,
  disableCache: false,
  final: true,
}

/**
 * Check if content is extending another configuration.
 *
 * @param content - The content to check.
 * @returns True if content has extends.
 */
function isExtending(content: unknown): content is { extends: string | string[] } {
  if (typeof content === 'object' && !!content && 'extends' in content) {
    const extensions = (content as any).extends
    if (
      typeof extensions !== 'string' &&
      (!Array.isArray(extensions) || extensions.some(extension => typeof extension !== 'string'))
    ) {
      throw new ConfinodeError('badExtends')
    }
    return true
  } else {
    return false
  }
}

/**
 * The main Confinode class.
 */
export default class Confinode<T extends object = any, M extends 'async' | 'sync' = 'async'> {
  public readonly search: SearchFunctionType<T, M>
  public readonly load: LoadFunctionType<T, M>

  private readonly parameters: ConfinodeParameters

  private readonly loaderManager: LoaderManager

  private readonly folderCache = new Cache<string[]>(60 * 1000, 18)
  private readonly contentCache = new Cache<unknown>(300 * 1000, 24)
  private readonly configCache = new Cache<ConfinodeResult<T> | undefined>(300 * 1000, 36)

  public constructor(
    public readonly name: string,
    private readonly description: ConfigDescription<T> = anyItem(),
    options?: ConfinodeOptions<M>
  ) {
    // Load default option (prevent null or undefined provided options to remove default ones)
    this.parameters = Object.entries(options ?? {}).reduce(
      (previous, [key, value]) => {
        if (value !== undefined && value !== null) {
          previous[key] = value
        }
        return previous
      },
      { ...defaultConfig } as any
    )

    // Prepare options
    this.parameters.modulePaths = ensureArray(options?.modulePaths ?? []).map(path =>
      resolve(process.cwd(), path)
    )
    this.parameters.modulePaths.unshift(process.cwd())
    if (!options?.files || filesAreFilters(options.files)) {
      this.parameters.files = defaultFiles(name)
    }
    if (options?.files && filesAreFilters(options.files)) {
      this.parameters.files = options.files.reduce(
        (previous, filter) => filter(previous),
        this.parameters.files
      )
    }
    if (!options?.mode) {
      this.parameters.mode = 'async'
    }

    // Prepare polymorphic methods
    let _search: any
    if (this.parameters.mode === 'async') {
      _search = this.asyncSearch
      _search.sync = (searchStart?: string) => this.syncSearch(searchStart)
    } else {
      _search = this.syncSearch
      _search.async = (searchStart?: string) => this.asyncSearch(searchStart)
    }
    this.search = _search as SearchFunctionType<T, M>
    let _load: any
    if (this.parameters.mode === 'async') {
      _load = this.asyncLoad
      _load.sync = (file: string) => this.syncLoad(file)
    } else {
      _load = this.syncLoad
      _load.async = (file: string) => this.asyncLoad(file)
    }
    this.load = _load as LoadFunctionType<T, M>

    // Create loader manager
    this.loaderManager = new LoaderManager(name, this.parameters.customLoaders)
  }

  /**
   * Clear the cache.
   */
  public clearCache(): void {
    this.folderCache.clear()
    this.contentCache.clear()
    this.configCache.clear()
  }

  /**
   * Asynchronously search for configuration.
   *
   * @param searchStart - The place where search will start, current folder by default.
   * @returns A promise resolving to the configuration if found, undefined otherwise.
   */
  private async asyncSearch(searchStart?: string): Promise<ConfinodeResult<T> | undefined> {
    return asyncExecute(this.searchConfig(searchStart))
  }

  /**
   * Synchronously search for configuration.
   *
   * @param searchStart - The place where search will start, current folder by default.
   * @returns The configuration if found, undefined otherwise.
   */
  private syncSearch(searchStart?: string): ConfinodeResult<T> | undefined {
    return syncExecute(this.searchConfig(searchStart))
  }

  /**
   * Search for configuration.
   *
   * @param searchStart - The place where search will start, current folder by default.
   * @returns A promise resolving to the configuration if found, undefined otherwise.
   */
  private *searchConfig(
    searchStart: string = process.cwd()
  ): Generator<Request, ConfinodeResult<T> | undefined, any> {
    try {
      return yield* this.searchConfigInFolder(
        (yield requestIsFolder(searchStart)) ? searchStart : dirname(searchStart),
        false
      )
    } catch (e) {
      /* istanbul ignore next */
      this.log('internal', e)
      /* istanbul ignore next */
      return undefined
    }
  }

  /**
   * Search for configuration in given folder. This is a recursive method.
   *
   * @param folder - The folder to search in.
   * @param ignoreAbsolute - True to ignore absolute file names.
   * @returns A promise resolving to the configuration if found, undefined otherwise.
   */
  private *searchConfigInFolder(
    folder: string,
    ignoreAbsolute: boolean
  ): Generator<Request, ConfinodeResult<T> | undefined, any> {
    // Get absolute folder
    const absoluteFolder = resolve(process.cwd(), folder)
    this.log(Level.Trace, 'searchInFolder', absoluteFolder)

    // See if already in cache
    if (this.configCache.has(absoluteFolder)) {
      this.log(Level.Trace, 'loadedFromCache')
      return this.configCache.get(absoluteFolder)
    }

    // Search configuration files
    let result: ConfinodeResult<T> | undefined
    try {
      result = yield* this.searchConfigUsingDescriptions(absoluteFolder, ignoreAbsolute)
      // Search in parent if not found here
      if (result === undefined && absoluteFolder !== this.parameters.searchStop) {
        const parentFolder = dirname(absoluteFolder)
        if (parentFolder !== absoluteFolder) {
          result = yield* this.searchConfigInFolder(parentFolder, true)
        }
      }
    } catch (e) {
      this.log('loading', e)
    }

    if (this.parameters.cache) {
      this.configCache.set(absoluteFolder, result)
    }
    return result
  }

  /**
   * Search for configuration using options descriptions.
   *
   * @param folder - The folder in which to search.
   * @param ignoreAbsolute - True to ignore absolute file names.
   * @returns The found elements or undefined.
   */
  private *searchConfigUsingDescriptions(
    folder: string,
    ignoreAbsolute: boolean
  ): Generator<Request, ConfinodeResult<T> | undefined | undefined, any> {
    for (const fileDescription of this.parameters.files) {
      const fileAndLoader = yield* this.searchFileAndLoader(folder, fileDescription, ignoreAbsolute)
      if (fileAndLoader) {
        const [fileName, loader, loaderName] = fileAndLoader
        const result = yield* this.loadConfigFile(fileName, [loader, loaderName])
        if (result) {
          this.log(Level.Information, 'loadedConfiguration', fileName)
          return result
        }
      }
    }
    return undefined
  }

  /**
   * Search a file and its loader matching the given description in the given folder.
   *
   * @param folder - The folder in which to search.
   * @param description - The file description.
   * @param ignoreAbsolute - True to ignore absolute file names.
   * @returns The found file and loader (and possible loader name), or undefined if none.
   */
  private *searchFileAndLoader(
    folder: string,
    description: FileDescription,
    ignoreAbsolute: boolean
  ): Generator<Request, [string, Loader, string | undefined] | undefined, any> {
    if (isFileBasename(description)) {
      const searchedPath = this.buildConfigurationFileName(folder, description, ignoreAbsolute)
      if (searchedPath) {
        const folderName = dirname(searchedPath)
        const baseName = basename(description) + '.'
        let fileNames: string[]
        if (this.folderCache.has(folderName)) {
          fileNames = this.folderCache.get(folderName)!
        } else {
          fileNames = yield requestFolderContent(folderName)
          if (this.parameters.cache) {
            this.folderCache.set(folderName, fileNames)
          }
        }
        const loaders = this.findLoaderData(folderName, baseName, fileNames)
        if (loaders.length > 0) {
          if (loaders.length > 1) {
            this.log(Level.Warning, 'multipleFiles', searchedPath)
          }
          return loaders[0]
        }
      }
    } else {
      const fileName = this.buildConfigurationFileName(folder, description.name, ignoreAbsolute)
      if (fileName && (yield requestFileExits(fileName))) {
        return [fileName, description.loader, undefined] as [string, Loader, string | undefined]
      }
    }
    return undefined
  }

  /**
   * Build the configuration file name (possibly without extension) based on the file name and the folder.
   *
   * @param folder - The folder in which to search for the file.
   * @param fileName - The name of the file.
   * @param ignoreAbsolute - True to ignore absolute file names.
   * @returns The built file name or undefined if should be ignored.
   */
  private buildConfigurationFileName(
    folder: string,
    fileName: string,
    ignoreAbsolute: boolean
  ): string | undefined {
    if (isAbsolute(fileName)) {
      return ignoreAbsolute ? undefined : fileName
    } else {
      return join(folder, fileName)
    }
  }

  /**
   * Find the loader data for the given files.
   *
   * @param folder - The folder in which search is done.
   * @param baseName - The base name (start) of the file, including the `.` preceding extension.
   * @param fileNames - The name of the files for which to find loaders.
   * @returns All found loader data as: full path to file, loader, loader name.
   */
  private findLoaderData(
    folder: string,
    baseName: string,
    fileNames: string[]
  ): Array<[string, Loader, string | undefined]> {
    return fileNames
      .filter(fileName => fileName.startsWith(baseName))
      .map(fileName => {
        const loader = this.loaderManager.getLoaderFor(
          this.parameters.modulePaths,
          fileName,
          fileName.slice(baseName.length)
        )
        return isExisting(loader)
          ? ([join(folder, fileName), ...loader] as [string, Loader, string | undefined])
          : undefined
      })
      .filter(isExisting)
  }

  /**
   * Asynchronously load the configuration file.
   *
   * @param name - The name of the configuration file. The name may be an absolute file path, a relative
   * file path, or a module name and an optional file path.
   * @returns A promise resolving to the configuration if loaded, undefined otherwise.
   */
  private async asyncLoad(name: string): Promise<ConfinodeResult<T> | undefined> {
    return asyncExecute(this.loadConfig(name))
  }

  /**
   * Synchronously load the configuration file.
   *
   * @param name - The name of the configuration file. The name may be an absolute file path, a relative
   * file path, or a module name and an optional file path.
   * @returns The configuration if loader, undefined otherwise.
   */
  private syncLoad(name: string): ConfinodeResult<T> | undefined {
    return syncExecute(this.loadConfig(name))
  }

  /**
   * Load configuration from file with given name.
   *
   * @param name - The name of the configuration file. The name may be an absolute file path, a relative
   * file path, or a module name and an optional file path.
   * @param folder - The folder to resolve name from, defaults to current directory.
   * @param loadingParameters - The parameters for the current loading process.
   * @returns The configuration if loaded, undefined otherwise.
   */
  private *loadConfig(
    name: string,
    folder: string = process.cwd(),
    loadingParameters?: LoadingParameters<T>
  ): Generator<Request, ConfinodeResult<T> | undefined, any> {
    // Search for the real file name
    let fileName: string | undefined
    try {
      fileName = require.resolve(name, { paths: [folder] })
    } catch {
      fileName = undefined
    }

    // Load the content
    try {
      if (!fileName || !(yield requestFileExits(fileName))) {
        throw new ConfinodeError('fileNotFound', name)
      }
      return yield* this.loadConfigFile(fileName, loadingParameters ?? defaultLoadingParameters)
    } catch (e) {
      if (loadingParameters) {
        // Currently inside loading process, rethrow to caller
        throw e
      } else {
        // Topmost call, display error
        this.log('loading', e)
      }
    }

    // Return result
    return undefined
  }

  /**
   * Load the configuration file.
   *
   * @param fileName - The name of the file to load.
   * @param loaderOrLoading - The loader to use (if already found, search file cases) or the loading
   * parameters (loading in progress).
   * @returns The method will return the configuration, or undefined if content is empty (the meaning of
   * empty depends on the loader). May throw an error if loading problem.
   */
  private *loadConfigFile(
    fileName: string,
    loaderOrLoading: [Loader, string | undefined] | LoadingParameters<T>
  ): Generator<Request, ConfinodeResult<T> | undefined, any> {
    const givenLoader = isLoadingParameters(loaderOrLoading) ? undefined : loaderOrLoading
    const loadingParameters: LoadingParameters<T> = isLoadingParameters(loaderOrLoading)
      ? loaderOrLoading
      : defaultLoadingParameters
    const absoluteFile = resolve(process.cwd(), fileName)
    this.log(Level.Trace, 'loadingFile', absoluteFile)
    if (this.configCache.has(absoluteFile) && !loadingParameters.disableCache) {
      this.log(Level.Trace, 'loadedFromCache')
      return this.configCache.get(absoluteFile)
    }

    // Prevent recursion loop
    if (loadingParameters.alreadyLoaded.includes(absoluteFile)) {
      throw new ConfinodeError('recursion', [...loadingParameters.alreadyLoaded, absoluteFile])
    }

    // Search for the loader if not provided
    const modulePaths = [
      ...this.parameters.modulePaths,
      ...loadingParameters.alreadyLoaded.map(dirname).filter(unique),
    ]
    const usedLoader = givenLoader ?? this.loaderManager.getLoaderFor(modulePaths, basename(absoluteFile))
    if (!usedLoader) {
      throw new ConfinodeError('noLoaderFound', absoluteFile)
    }
    const [loader, loaderName] = usedLoader
    if (loaderName) {
      this.log(Level.Trace, 'usingLoader', loaderName)
    }

    // Loading file content
    let result: ConfinodeResult<T> | undefined
    let content: unknown
    if (this.contentCache.has(absoluteFile)) {
      content = this.contentCache.get(absoluteFile)
    } else {
      content = yield requestLoadConfigFile(absoluteFile, loader)
    }
    if (this.parameters.cache) {
      this.contentCache.set(absoluteFile, content)
    }
    if (content === undefined) {
      this.log(Level.Trace, 'emptyConfiguration')
      result = loadingParameters.intermediateResult
    } else {
      result = yield* this.parseConfigFileContent(absoluteFile, loadingParameters, content)
    }

    if (this.parameters.cache && !loadingParameters.disableCache) {
      this.configCache.set(absoluteFile, result)
    }
    return result
  }

  /**
   * Parse the file content.
   *
   * @param fileName - The name of file being parsed.
   * @param loadingParameters - The loading parameters.
   * @param content - The content of the file.
   * @returns The parsing result.
   */
  private *parseConfigFileContent(
    fileName: string,
    loadingParameters: LoadingParameters<T>,
    content: unknown
  ): Generator<Request, ConfinodeResult<T> | undefined, any> {
    let result = loadingParameters.intermediateResult
    const alreadyLoaded = [...loadingParameters.alreadyLoaded, fileName]
    if (typeof content === 'string') {
      // Indirection
      return yield* this.loadConfig(content, dirname(fileName), {
        ...loadingParameters,
        alreadyLoaded,
      })
    } else {
      const resultFile: ResultFile = { name: fileName, extends: [] }

      // Inheritance
      if (isExtending(content)) {
        const parentConfigs = ensureArray(content.extends)
        delete content.extends
        let disableCache = loadingParameters.disableCache
        for (const parentConfig of parentConfigs) {
          result = yield* this.loadConfig(parentConfig, dirname(fileName), {
            alreadyLoaded,
            intermediateResult: result,
            disableCache,
            final: false,
          })
          pushIfNew(resultFile.extends, result!.files, item => item.name === result!.files.name)
          disableCache = true // Never load siblings with cache as result depends on previous loads
        }
      }

      // Parse file
      result = this.description.parse(content, {
        keyName: '',
        fileName,
        parent: result,
        final: loadingParameters.final,
      })
      result && (result.files = resultFile)
    }
    return result
  }

  /**
   * Log the exception as an error of given type.
   *
   * @param errorType - The type of the error.
   * @param exception - The exception to log.
   */
  private log(errorType: 'loading' | 'internal', exception: any): void

  /**
   * Log a message.
   *
   * @param level - The level of the message.
   * @param messageId - The message identifier.
   * @param parameters - The parameters for the message.
   */
  private log<M extends MessageId>(level: Level, messageId: M, ...parameters: MessageParameters[M]): void

  /*
   * Implementation.
   */
  private log<M extends MessageId>(
    levelOrErrorType: any,
    messageIdOrException?: any,
    ...parameters: MessageParameters[M]
  ): void {
    let message: Message<any>
    if (typeof levelOrErrorType === 'string') {
      if (messageIdOrException instanceof ConfinodeError) {
        message = messageIdOrException.internalMessage
      } else {
        const errorMessage =
          messageIdOrException instanceof Error
            ? messageIdOrException.message
            : /* istanbul ignore next */ messageIdOrException.toString()
        /* istanbul ignore else */
        if (levelOrErrorType === 'loading') {
          message = new Message(Level.Error, 'loadingError', errorMessage)
        } else {
          message = new Message(Level.Error, 'internalError', errorMessage)
        }
      }
    } else {
      message = new Message(levelOrErrorType as Level, messageIdOrException as M, ...parameters)
    }
    this.parameters.logger(message)
  }
}
