import { useCallback, useEffect, useReducer, useState } from "react"
import items, { keys } from "./objectIterators"

const SIMPLE_TYPE_TO_NAME = {
  null: 'Null/None',
  string: 'Text',
  number: 'Number',
  boolean: 'Boolean (true/false)',
}

const COMPLEX_TYPE_TO_NAME = {
  array: 'List',
  object: 'Key-Value pairs (object)'
}

const TYPE_TO_NAME = {
  ...SIMPLE_TYPE_TO_NAME,
  ...COMPLEX_TYPE_TO_NAME
}

const TYPE_TO_GENERATOR = {
  string: () => '',
  number: () => 0,
  boolean: () => false,
  array: () => [],
  object: () => ({}),
  null: () => null
}

export function genericReducer(state, action) {
  function inner() {
    if (!('type' in action)) {
      throw Error(`${genericReducer} requires 'type' property`)
    }

    const IS_ARRAY = Array.isArray(state)
    const IS_OBJECT = typeof state === 'object' && !IS_ARRAY

    const replace_array = (array) => [ ...array ]

    const replace_array_with = (array, index, value) => {
      const newArray = replace_array()
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
      if (!IS_OBJECT)
        throw Error(`Action type: '${action.type}' requires the 'state' to be an object`)
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

  if ('redispatch' in action) {
    return genericReducer(inner(), action.redispatch)
  }
  return inner()
}

export function SimpleEditor({ value, dispatcher, deletable=true }) {
  if (!(typeof value in SIMPLE_TYPE_TO_NAME) && value !== null) {
    throw Error(`Type ${typeof value} is not supported by ${SimpleEditor}`)
  }

  useEffect(() => {
    if (!deletable && value === null) {
      dispatcher({ type: 'set-as', value: '' })
    }
  }, [deletable, value, dispatcher])

  const deleter = useCallback(() => {

  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'row'}}>
      {
        deletable &&
        <button onClick={deleter}>×</button>
      }
    </div>
  )
}

export function ComplexEditor({ value, dispatcher, deletable=true }) {
  if (!(typeof value in COMPLEX_TYPE_TO_NAME)) {
    throw Error(`Type ${typeof value} is not supported by ${ComplexEditor}`)
  }

  const [isEmpty, setIsEmpty] = useState((Array.isArray(value) ? value : keys(value)).length === 0)

  useEffect(() => setIsEmpty((Array.isArray(value) ? value : keys(value)).length === 0), [setIsEmpty, value])

  const [appendInfo, dispatchAppendInfo] = useReducer(genericReducer, {
      type: 'string',
      key: '',
      value: ''
    }
  )

  const switchAppendType = useCallback(evt => {
    dispatchAppendInfo({
      type: 'set-key',
      key: 'type',
      value: evt.target.value,
      redispatch: {
        type: 'set-key',
        key: 'value',
        value: TYPE_TO_GENERATOR[evt.target.value]()
      }
    })
  }, [dispatchAppendInfo])

  const append = useCallback(() => {
    dispatcher({ type: 'append-key', key: appendInfo.key, value: appendInfo.value })
    dispatchAppendInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_TO_GENERATOR[appendInfo.type]()
    })
  }, [dispatcher, appendInfo])

  const topLevelControls = (
    <>
      <select value={appendInfo.type} onChange={switchAppendType}>
        {
          items(TYPE_TO_NAME).map(pair => {
            const [type, typeName] = pair
            return <option key={type} value={type}>{typeName}</option>
          })
        }
      </select>
      <input value={appendInfo.key} placeholder='key' onChange={evt => dispatchAppendInfo({ type: 'set-key', key: 'key', value: evt.target.value })} />
      <input type={appendInfo.type === 'boolean' ? 'checkbox' : appendInfo.type} placeholder='value' value={appendInfo.value} onChange={evt => dispatchAppendInfo({ type: 'set-key', key: 'value', value: evt.target.value })} />
      <button onClick={append}>+</button>
    </>
  )

  return (
    <>
      {topLevelControls}
      <br/>
     {
        isEmpty ?
        <em>...</em> :
        <></>
      }
    </>
  )
}

export default function ObjectEditor({ value, dispatcher }) {
  const determineEditor = useCallback(() =>
    typeof value in SIMPLE_TYPE_TO_NAME ?
    <SimpleEditor value={value} dispatcher={dispatcher} /> :
    typeof value in COMPLEX_TYPE_TO_NAME ?
    <ComplexEditor value={value} dispatcher={dispatcher}/> :
    null, [value, dispatcher])

  const [Editor, setEditor] = useState(determineEditor())

  useEffect(() => {
    const editor = determineEditor()
    if (editor === null) {
      throw Error(`Type ${typeof value} is unsupported by ${ObjectEditor}`)
    }
    setEditor(editor)
  }, [determineEditor, value, setEditor])

  return Editor
}
