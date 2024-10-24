export const SIMPLE_TYPES = [
  'string',
  'number',
  'boolean'
]

export const COMPLEX_TYPES = [
  'array',
  'object'
]

export const TYPES = [
  ...SIMPLE_TYPES,
  ...COMPLEX_TYPES
]

export const SIMPLE_TYPE_NAMES = {
  'string': 'Text',
  'number': 'Number',
  'boolean': 'Boolean'
}

export const COMPLEX_TYPE_NAMES = {
  'array': 'List',
  'object': 'Key-Value Pairs'
}

export const TYPE_NAMES = {
  ...SIMPLE_TYPE_NAMES,
  ...COMPLEX_TYPE_NAMES
}

export const TYPE_GENERATORS = {
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

export const isValidType = (type) => TYPES.includes(type)

export const isSimpleType = (type) => SIMPLE_TYPES.includes(type)

export const isSimple = (object) => isSimpleType(typeof object)

export function requireValidType(object) {
  if (!isValidType(typeof object)) {
    throw Error(`Type ${typeof object} is an invalid type.`)
  }
  return object
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
