import { relative, sep } from 'path'

/**
 * The babel files regular expression. Taken from the Gulp “interpret” project:
 * https://github.com/gulpjs/interpret.
 */
const endsInBabelJs = /\.babel\.[jt]s(x)$/

/**
 * Check if file is a babel or node module. Taken from the Gulp “interpret” project:
 * https://github.com/gulpjs/interpret.
 *
 * @param file - The file to test.
 * @returns False if file is babel or node module and should not be ignored.
 */
export function ignoreNonBabelAndNodeModules(file: string) {
  return (
    !endsInBabelJs.test(file) &&
    relative(process.cwd(), file)
      .split(sep)
      .indexOf('node_modules') >= 0
  )
}
