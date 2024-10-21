import React, { useCallback, useReducer } from 'react'
import generalReducer from './reducers'
import { TYPE_GENERATORS } from './types'

export default function ArrayEditor({
  value,
  dispatcher,
  deleter = null,
  schema = {},
  style = {}
}) {
  if (!Array.isArray(value)) {
    throw Error(`Type ${typeof value} is unsupported by ${ArrayEditor}`)
  }

  const isEmpty = useCallback(() => value.length === 0, [value])

  const [newInfo, disptachNewInfo] = useReducer(generalReducer, {
    type: 'string',
    index: '',
    value: ''
  })

  const newTypeChanged = useCallback(newType => {
    disptachNewInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_GENERATORS[newType]()
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'type',
      value: newType
    })
  }, [disptachNewInfo])

  const newSubmitted = useCallback(evt => {
    evt.preventDefault()
    dispatcher({
      type: newInfo.index === '' ? 'append-element' : 'insert-element',
      value: newInfo.value,
      index: newInfo.index
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_GENERATORS[newInfo.type]()
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'index',
      value: ''
    })
  }, [dispatcher, newInfo, disptachNewInfo])

  return (
    <div>ArrayEditor</div>
  )
}
