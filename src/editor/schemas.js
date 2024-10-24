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

export function getScheme(schema, child) {
  /*
    if 'all' key is in schema, enforce properties of 'all' object to all
    if the 'child' is in the schema, apply child
    else if 'others' in schema, apply others.

    allow schema generator function

    templates as types
  */

  throw Error('Not Implemented')
}
