/**
 * All the messages of the library.
 */
export const messages = {
  emptyConfiguration: () => 'Empty configuration',
  expected: (entry: string, file: string, expected: any) =>
    `Configuration error: “${entry}” is expected to be ${expected.toString()}\n in file “${file}”`,
  expectedArray: () => 'an array',
  expectedBoolean: () => 'a boolean',
  expectedChoice: (choices: (string | number)[]) => `one of: ${choices.join(', ')}`,
  expectedNumber: () => 'a number',
  expectedObject: () => 'an object',
  expectedString: () => 'a string',
  fileNotFound: (file: string) => `Configuration file “${file}” not found`,
  internalError: /* istanbul ignore next */ (message: string) => `Internal error: ${message}`,
  loadedFromCache: () => 'Loaded from cache',
  loadedConfiguration: (file: string) => `Loaded configuration from file ${file}`,
  loadingError: (message: string) => `Error while loading configuration: ${message}`,
  loadingFile: (file: string) => `Loading file ${file}`,
  usingLoader: (loader: string) => `Using ${loader} loader`,
  missingMandatory: (entry: string) => `Configuration error: missing mandatory “${entry}” option`,
  multipleFiles: (path: string) => `Multiple configuration files found for “${path}.*”`,
  noLoaderFound: (file: string) => `No appropriate loader found for file ${file}`,
  searchInFolder: (folder: string) => `Search for configuration in ${folder}`,
}

export type MessageId = keyof typeof messages
export type MessageParameters = {
  [K in MessageId]: Parameters<typeof messages[K]>
}
