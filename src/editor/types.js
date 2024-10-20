export const SIMPLE_TYPE_TO_NAME = {
  string: 'Text',
  number: 'Number',
  boolean: 'Boolean'
}

export const COMPLEX_TYPE_TO_NAME = {
  array: 'List',
  object: 'Key-value Pairs'
}

export const TYPE_TO_NAME = {
	...SIMPLE_TYPE_TO_NAME,
	...COMPLEX_TYPE_TO_NAME
}

export const TYPE_TO_GENERATOR = {
  string: () => '',
  number: () => 0,
  boolean: () => false,
  array: () => [],
  object: () => ({})
}

export const TYPE_PARSERS = {
  string: str => str,
  number: str => Number(str),
  boolean: str => typeof str === 'string' ? ["on", "true", "yes"].includes(str.trim().toLowerCase()) : Boolean(str),
  array: str => [],
  object: str => ({})
}

export function isValidType(type) {
  return type in TYPE_TO_NAME
}

export function requireValidType(object) {
  if (!isValidType(typeof object)) {
    throw Error(`Type error: type ${typeof object} is unsupported`)
  }
  return object
}

export function isSimpleType(type) {
  return type in SIMPLE_TYPE_TO_NAME
}

export function isSimple(object) {
  return isSimpleType(typeof object)
}

export function inputType(type) {
  if (type === null) {
    throw Error(`No input type for null`)
  }

  if (type === 'boolean') {
    return 'checkbox'
  }
  return type
}
