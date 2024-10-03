export const TYPE_TO_TYPENAME = {
  'string': 'Text',
  'number': 'Number',
  'array': 'List (Array)',
  'object': 'Object (Key-Value pairs)'
}

export const TYPE_TO_DEFAULT_GENERATOR = {
  'string': () => '',
  'number': () => 0,
  'array': () => [],
  'object': () => ({})
}
