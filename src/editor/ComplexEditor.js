import React from 'react'
import ObjectEditor from './ObjectEditor'
import ArrayEditor from './ArrayEditor'

export default function ComplexEditor({ value, dispatcher, deleter= null }) {
  return Array.isArray(value) ?
  <ArrayEditor value={value} dispatcher={dispatcher} deleter={deleter}/> :
  <ObjectEditor value={value} dispatcher={dispatcher} deleter={deleter}/>
}
