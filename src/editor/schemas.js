import { TYPES } from "./types"

export const property = (object, prop, defaultValue = undefined) =>
  (object !== undefined && object !== null && prop in object) ? object[prop] : defaultValue

export function requireProperty(object, prop, name = undefined) {
  if (object !== undefined && object !== null && prop in object) {
    return object
  }

  if (name === undefined) {
    throw Error(`The property ${prop} is a required.`)
  }
  throw Error(`${name} requires property ${prop}.`)
}

export function defaultGenerator(schema, scheme, child, value) {
  return {
    types: TYPES,
    others: {
      types: TYPES
    },
    generator: defaultGenerator,
    ...scheme
  }
}

export function getScheme(schema, child, value = undefined) {
  /*
    if 'all' key is in schema, enforce properties of 'all' object to all
    if the 'child' is in the schema, apply child
    else if 'others' in schema, apply others.

    allow schema generator function

    Potentially separate 'others' with a new key 'new' for specifying new children schema separate from just "undefined" others.

    templates as types
  */

  const scheme = {
    ...property(
        property(schema, 'children', {}),
        child,
        property(schema, 'others', {})
      ),
    ...property(schema, 'all', {})
  }

  if ('generator' in schema) {
    return schema.generator(schema, scheme, child, value)
  }

  return scheme
}
