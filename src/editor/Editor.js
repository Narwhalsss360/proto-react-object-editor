import React from 'react'
import ArrayEditor from './ArrayEditor'
import { isSimple, TYPES } from './types'
import SimpleEditor from './SimpleEditor'
import ObjectEditor from './ObjectEditor'
import { defaultGenerator } from './schemas'

export default function Editor({ value, schema }) {
  const EditorType = Array.isArray(value) ?
  ArrayEditor :
  isSimple(value) ?
  SimpleEditor :
  ObjectEditor

  return (
    <EditorType value={value} schema={{
      types: TYPES,
      generator: defaultGenerator,
      others: {
        types: TYPES
      },
      ...schema
    }} />
  )
}
