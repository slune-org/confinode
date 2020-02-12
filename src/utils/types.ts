/**
 * Assert that the value does not exist. This method may be used in switch or if/else to ensure no value of
 * a finite set has been forgotten.
 *
 * @param value - The non-existing value to test.
 * @param label - The label for the value.
 */
/* istanbul ignore next */
export function assertNever(value: never, label = 'object'): never {
  throw new Error(`Unexpected ${label}: “${value}”`)
}

/**
 * Check that the given value is not undefined. Used as type guard.
 *
 * @param value - The value to test.
 * @returns `true` if value is not undefined.
 */
export function isExisting<T>(value: T | undefined): value is T {
  return value !== undefined
}
