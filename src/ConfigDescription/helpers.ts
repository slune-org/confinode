import ConfigDescription, { ConfigDescriptionParameter } from './ConfigDescription'
import AnyDescription from './AnyDescription'
import ArrayDescription from './ArrayDescription'
import BooleanDescription from './BooleanDescription'
import ChoiceDescription from './ChoiceDescription'
import ConditionalDescription from './ConditionalDescription'
import DefaultValueDescription from './DefaultValueDescription'
import DictionaryDescription from './DictionaryDescription'
import LiteralDescription, { ConfigDescriptionLiteral } from './LiteralDescription'
import NumberDescription from './NumberDescription'
import OptionalDescription from './OptionalDescription'
import OverrideDescription from './OverrideDescription'
import SingleOrArrayDescription from './SingleOrArrayDescription'
import StringDescription from './StringDescription'

/**
 * Describe an “any” item, useful for configuration parts that you actually don't want to describe.
 *
 * @returns The configuration description.
 */
export function anyItem(): ConfigDescription<any> {
  return new AnyDescription()
}

/**
 * Describe an array. The inner description is for each element of the array.
 *
 * @param description - The description to repeat for each array element.
 * @returns The configuration description.
 */
export function array<T>(description: ConfigDescriptionParameter<T>): ConfigDescription<T[]> {
  return new ArrayDescription(description)
}

/**
 * Describe a boolean item. This type of item is never mandatory because it is easy to give it a default
 * value.
 *
 * @param defaultValue - The default value, false if not given.
 * @returns The configuration description.
 */
// eslint-disable-next-line no-shadow
export function booleanItem(defaultValue = false): ConfigDescription<boolean> {
  return new BooleanDescription(defaultValue)
}

/**
 * Describe a choice item, which allow user to choose between a finite set of choices.
 *
 * @param choices - The available choices.
 * @param defaultValue - The default value.
 * @returns The configuration description.
 */
export function choiceItem<T extends string | number>(
  choices: T[],
  // eslint-disable-next-line no-shadow
  defaultValue?: T
): ConfigDescription<T> {
  return new ChoiceDescription(choices, defaultValue)
}

/**
 * Describe a conditional configuration. If value matches a predicate, first description is used, otherwise,
 * the second one is used.
 *
 * @param predicate - The predicate which will be tested against the value to parse.
 * @param ifDescription - The description if predicate is true.
 * @param elseDescription - The description if predicate is false.
 * @returns The configuration description.
 */
export function conditional<I, E>(
  predicate: (value: unknown) => boolean,
  ifDescription: ConfigDescriptionParameter<I>,
  elseDescription: ConfigDescriptionParameter<E>
): ConfigDescription<I | E> {
  return new ConditionalDescription(predicate, ifDescription, elseDescription)
}

/**
 * Describe a default value to be added to the given description. This is mostly useful for “non basic
 * items”, because those items already have a default value in their definition.
 *
 * @param description - The description to which to add default value.
 * @param value - The default value for if no value specified.
 * @returns The configuration description.
 */
export function defaultValue<T>(
  description: ConfigDescriptionParameter<T>,
  value: T
): ConfigDescription<T> {
  return new DefaultValueDescription(description, value)
}

/**
 * Describe a dictionary, i.e. an object with strings as keys and whatever is described as values.
 *
 * @param description - The description of a dictionary value.
 * @returns The configuration description.
 */
export function dictionary<T>(
  description: ConfigDescriptionParameter<T>
): ConfigDescription<{ [key: string]: T }> {
  return new DictionaryDescription(description)
}

/**
 * Describe an object literal. Each key of the object can have a different configuration description.
 *
 * @param description - The description of each literal item.
 * @returns The configuration description.
 */
export function literal<T extends object>(description: ConfigDescriptionLiteral<T>): ConfigDescription<T> {
  return new LiteralDescription(description)
}

/**
 * Describe a number item.
 *
 * @param defaultValue - The default value.
 * @returns The configuration description.
 */
// eslint-disable-next-line no-shadow
export function numberItem(defaultValue?: number): ConfigDescription<number> {
  return new NumberDescription(defaultValue)
}

/**
 * Describe an optional element, i.e. if no value is provided to the element (or value is `undefined`), then
 * the result will be `undefined`.
 *
 * @param description - The description to turn optional.
 * @returns The configuration description.
 */
export function optional<T>(description: ConfigDescriptionParameter<T>): ConfigDescription<T | undefined> {
  return new OptionalDescription(description)
}

/**
 * Describe an overridable element. In an overridable element, data taken from an extended configuration
 * file will be discarded (and not merged) if a child also provides value for the item.
 *
 * @param description - The description of the item to override.
 * @returns The configuration description.
 */
export function override<T>(description: ConfigDescriptionParameter<T>): ConfigDescription<T> {
  return new OverrideDescription(description)
}

/**
 * Describe an array element. If there is only a single element to put in array, this description allow the
 * user to give it directly without using an array definition.
 *
 * @param description - The description of the expected value.
 * @returns The configuration description.
 */
export function singleOrArray<T>(description: ConfigDescriptionParameter<T>): ConfigDescription<T[]> {
  return new SingleOrArrayDescription(description)
}

/**
 * Describe a string item.
 *
 * @param defaultValue - The default value.
 * @returns The configuration description.
 */
// eslint-disable-next-line no-shadow
export function stringItem(defaultValue?: string): ConfigDescription<string> {
  return new StringDescription(defaultValue)
}
