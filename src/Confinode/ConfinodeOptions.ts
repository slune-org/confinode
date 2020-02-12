import { homedir } from 'os'

import FileDescription from '../FileDescription'
import { Level, Message } from '../messages'

/**
 * The options for confinode, without the mode.
 */
interface ConfinodeOptionsWithoutMode {
  /**
   * Indicate if the search or load result should be cached.
   */
  cache: boolean

  /**
   * The folder where configuration file search should stop.
   */
  searchStop: string

  /**
   * The logger for non error messages. Default logger will simply display warnings to the console.
   */
  logger: (message: Message<any>) => void

  /**
   * Configuration file names, or default file names filter.
   */
  files: FileDescription[] | Array<(files: FileDescription[]) => FileDescription[]>
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

function defaultLogger(message: Message<any>) {
  ;(message.level === Level.Error
    ? // eslint-disable-next-line no-console
      console.error
    : message.level === Level.Warning
    ? // eslint-disable-next-line no-console
      console.log
    : noop)(message.toString())
}

/**
 * Type guard to check if file names are actually filters rather than real file descriptions.
 *
 * @param files - The variable to check.
 * @returns True if filenames is a filter array.
 */
export function filesAreFilters(
  files: FileDescription[] | Array<(fileDescriptions: FileDescription[]) => FileDescription[]>
): files is Array<(filenames: FileDescription[]) => FileDescription[]> {
  return files.length === 0 || typeof files[0] === 'function'
}

/**
 * Some default configuration options.
 */
export const defaultConfig: Partial<ConfinodeOptionsWithoutMode> = {
  cache: true,
  searchStop: homedir(),
  logger: defaultLogger,
}

/**
 * The definitive options, ready to be used by the application.
 */
export interface ConfinodeParameters extends ConfinodeOptionsWithoutMode {
  files: FileDescription[]
  mode: 'async' | 'sync'
}

/**
 * The options for confinode.
 */
type ConfinodeOptions<M extends 'async' | 'sync'> = Partial<ConfinodeOptionsWithoutMode> &
  (M extends 'async' ? { mode?: M } : { mode: M })
export default ConfinodeOptions
