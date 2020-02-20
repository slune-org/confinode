/**
 * Push the item in the array if the item is defined and not already in the array.
 *
 * @param array - The array in which item is to be pushed.
 * @param item - The item to push.
 * @param predicate - The predicate to see if item is already in the array.
 */
export function pushIfNew<T>(array: T[], item: T | undefined, predicate: (arrayItem: T) => boolean): void {
  !!item && !array.find(arrayItem => predicate(arrayItem)) && array.push(item)
}

/**
 * A predicate to use as an array filter in order to remove duplicates.
 *
 * @param value - The value to test.
 * @param index - The index of the current value.
 * @param array - The array.
 * @returns True if value is unique.
 */
export function unique<T>(value: T, index: number, array: T[]): boolean {
  return array.indexOf(value) === index
}
