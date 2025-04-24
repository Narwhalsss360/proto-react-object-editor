export function property(object, prop, defaultValue = undefined) {
  if (object === undefined) {
    return defaultValue
  }

  if (object === null) {
    return defaultValue
  }

  if (prop in object) {
    return object[prop]
  }

  return defaultValue
}

export function requireProperty(object, prop, parentName = undefined) {
  if (object !== undefined && object !== null && prop in object) {
    return object
  }

  if (parentName === undefined) {
    throw Error(`The property ${prop} is a required.`)
  }
  throw Error(`${parentName} requires property ${prop}.`)
}

export default function getScheme(schema, childKey, child, parent) {
  const scheme = {
    ...property(
        property(schema, 'children', {}),
        childKey,
        property(schema, 'others', {})
      ),
    ...property(schema, 'all', {})
  }

  if ('generator' in schema) {
    return schema.generator(schema, childKey, child, parent)
  }

  return scheme
}
