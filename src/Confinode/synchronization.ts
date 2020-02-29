import { access, accessSync, constants, readdir, readdirSync, stat, statSync } from 'fs'

import Loader from '../Loader'
import { assertNever } from '../utils'

/**
 * Types of available requests made by from generator function to caller.
 */
const enum RequestType {
  IsFolder,
  FileExists,
  FolderContent,
  LoadConfigFile,
}

// Request if given parameter is a folder
interface RequestIsFolder {
  request: RequestType.IsFolder
  payload: string
}

/**
 * Create a request for if given parameter is a folder.
 *
 * @param path - The path to test.
 * @returns The request.
 */
export function requestIsFolder(path: string): RequestIsFolder {
  return { request: RequestType.IsFolder, payload: path }
}

// Request if the given parameter is an existing file
interface RequestFileExists {
  request: RequestType.FileExists
  payload: string
}

/**
 * Create a request for if the given parameter is an existing file.
 *
 * @param file - The file to test.
 * @returns The request.
 */
export function requestFileExits(file: string): RequestFileExists {
  return { request: RequestType.FileExists, payload: file }
}

// Request the content of the folder given as parameter
interface RequestFolderContent {
  request: RequestType.FolderContent
  payload: string
}

/**
 * Create a request for the content of the folder given as parameter.
 *
 * @param folder - The folder to read.
 * @returns The request.
 */
export function requestFolderContent(folder: string): RequestFolderContent {
  return { request: RequestType.FolderContent, payload: folder }
}

// Request the configuration file content loading
interface RequestLoadConfigFile {
  request: RequestType.LoadConfigFile
  payload: { filePath: string; loader: Loader }
}

/**
 * Create a request for the configuration file content loading.
 *
 * @param filePath - The path of the file to load.
 * @param loader - The loader to use.
 * @returns The request.
 */
export function requestLoadConfigFile(filePath: string, loader: Loader): RequestLoadConfigFile {
  return { request: RequestType.LoadConfigFile, payload: { filePath, loader } }
}

/**
 * All available requests.
 */
export type Request = RequestIsFolder | RequestFileExists | RequestFolderContent | RequestLoadConfigFile

/**
 * Execute a function, given as a generator, used asynchronously.
 *
 * @param stepRun - The function to execute. The function is a generator which may stop to request some
 * information.
 * @returns The return value of the given function.
 */
export async function asyncExecute<R>(stepRun: Generator<Request, R, any>): Promise<R> {
  let current = stepRun.next()
  while (!current.done) {
    try {
      const request = current.value
      let response: any
      switch (request.request) {
        case RequestType.IsFolder:
          response = await new Promise<boolean>(res =>
            stat(request.payload, (err, stats) => {
              err ? /* istanbul ignore next */ res(false) : res(stats.isDirectory())
            })
          )
          break
        case RequestType.FileExists:
          response = await new Promise<boolean>(res =>
            access(request.payload, constants.F_OK, err => res(!err))
          )
          break
        case RequestType.FolderContent:
          response = await new Promise<string[]>(res =>
            readdir(request.payload, (err, files) => res(!err ? files : []))
          )
          break
        case RequestType.LoadConfigFile:
          response = await request.payload.loader.load(request.payload.filePath)
          break
        /* istanbul ignore next */
        default:
          assertNever(request, 'channel request')
      }
      current = stepRun.next(response)
    } catch (e) {
      current = stepRun.throw(e)
    }
  }
  return current.value
}

/**
 * Execute a function, given as a generator, used synchronously.
 *
 * @param stepRun - The function to execute. The function is a generator which may stop to request some
 * information.
 * @returns The return value of the given function.
 */
export function syncExecute<R>(stepRun: Generator<Request, R, any>): R {
  let current = stepRun.next()
  while (!current.done) {
    try {
      const request = current.value
      let response: any
      switch (request.request) {
        case RequestType.IsFolder:
          response = (() => {
            try {
              return statSync(request.payload).isDirectory()
            } catch {
              /* istanbul ignore next */
              return false
            }
          })()
          break
        case RequestType.FileExists:
          response = (() => {
            try {
              accessSync(request.payload, constants.F_OK)
              return true
            } catch {
              return false
            }
          })()
          break
        case RequestType.FolderContent:
          response = (() => {
            try {
              return readdirSync(request.payload)
            } catch {
              return []
            }
          })()
          break
        case RequestType.LoadConfigFile:
          response = request.payload.loader.syncLoad!(request.payload.filePath)
          break
        /* istanbul ignore next */
        default:
          assertNever(request, 'channel request')
      }
      current = stepRun.next(response)
    } catch (e) {
      current = stepRun.throw(e)
    }
  }
  return current.value
}
