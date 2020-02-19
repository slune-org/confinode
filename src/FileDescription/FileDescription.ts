import Loader from '../Loader'

/**
 * The description of a configuration file, i.e. either a file basename or a full file name with loader.
 */
type FileDescription = string | { name: string; loader: Loader }
export default FileDescription

/**
 * Test if the given description is a file basename and not a full file name with loader.
 *
 * @param description - The description to test.
 * @returns True if file basename.
 */
export function isFileBasename(description: FileDescription): description is string {
  return typeof description === 'string'
}
