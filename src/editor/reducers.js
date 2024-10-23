export default function generalReducer(state, action) {
  if (!('type' in action)) {
    throw Error(`${generalReducer} requires 'type' property`)
  }

  const IS_ARRAY = Array.isArray(state)
  const IS_OBJECT = typeof state === 'object' && !IS_ARRAY

  const replace_array = (array) => [ ...array ]

  const replace_array_with = (array, index, value) => {
    const newArray = replace_array(array)
    newArray[index] = value
    return newArray
  }

  const swap_indicies = (array, index, target) => {
    const temp = array[index]
    array[index] = array[target]
    array[target] = temp
    return array
  }

  const replace_object = (object) => ({ ...object })

  const replace_object_with = (object, key, value) => {
    const newObject = replace_object(object)
    newObject[key] = value
    return newObject
  }

  const swap_key = (object, oldKey, newKey) => {
    object[newKey] = object[oldKey]
    delete object[oldKey]
    return object
  }

  const require_array = () => {
    if (!IS_ARRAY) {
      throw Error(`Action type: '${action.type}' requires the 'state' to be an array`)
    }
  }

  const require_index = () => {
    require_array()
    if (!('index' in action)) {
      throw Error(`Action type: '${action.type}' requires the 'index' property`)
    }
    if (action.length >= state.length) {
      throw Error(`Action index ${action.index} is out of bounds`)
    }
  }

  const require_object = () => {
    if (!IS_OBJECT) {
      throw Error(`Action type: '${action.type}' requires the 'state' to be an object`)
    }
  }

  const require_key = (require_existence = false) => {
    require_object()
    if (!('key' in action)) {
      throw Error(`Action type: '${action.type}' requires the 'key' property`)
    }
    if (require_existence && !(action.key in state)) {
      throw Error(`Action type: '${action.type}' requires the 'key' property to exist in the 'state'`)
    }
  }

  const require_value = () => {
    if (!('value' in action)) {
      throw Error(`Action type: '${action.type}' requires the 'value' property`)
    }
  }

  switch (action.type) {
    case 'set-key':
      require_key(true)
      require_value()
      return replace_object_with(state, action.key, action.value)
    case 'append-key':
      require_key()
      require_value()
      return replace_object_with(state, action.key, action.value)
    case 'delete-key':
      require_key(true)
      const newState = replace_object(state)
      delete newState[action.key]
      return newState
    case 'swap-key-name':
      require_key(true)
      if (!('newKey' in action)) {
        throw Error(`Action type: '${action.type}' requires the 'newKey' property`)
      }
      return swap_key(replace_object(state), action.key, action.newKey)
    case 'set-element':
      require_index()
      require_value()
      return replace_array_with(state, action.index, action.value)
    case 'delete-element':
      require_index()
      return state.filter((_, i) => i !== action.index)
    case 'append-element':
      require_array()
      require_value()
      return [ ...state, action.value ]
    case 'swap-elements':
      require_index()
      if (!('target' in action)) {
        throw Error(`Action type: '${action.type}' requires the 'target' property`)
      }
      return swap_indicies(replace_array(state), action.index, action.target)
    case 'insert-element':
      require_index()
      require_value()
      return [ ...state.slice(0, action.index), action.value, ...state.slice(action.index) ]
    case 'set-as':
      require_value()
      return action.value
    default:
      throw Error(`'${action.type}' is an unknown action type.`)
  }
}

export function generateRedispatchable(reducer) {
  function redispatchable(state, action) {
    return 'redispatch' in action ?
    reducer(reducer(state, action), action.redispatch) :
    reducer(state, action)
  }
  return redispatchable
}
