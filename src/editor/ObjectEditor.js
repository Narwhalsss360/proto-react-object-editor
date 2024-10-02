import React, { useState, useCallback, useEffect } from 'react'
import { TYPE_TO_DEFAULT_GENERATOR, TYPE_TO_TYPENAME } from './constants'
import ValueEntry from './ValueEntry'
import ArrayEntry from './ArrayEntry'

const OBJECT_EDITOR_TYPE_TO_TYPENAME = {
  ...TYPE_TO_TYPENAME,
  'array': 'List (Array)',
  'object': 'Key-Value Pair (Object)'
}

const OBJECT_EDTIOR_TYPE_TO_DEFAULT_GENERATOR = {
  ...TYPE_TO_DEFAULT_GENERATOR,
  'array': () => [],
  'object': () => { return {} }
}

export function MemberEntry({ keyName, value, onChange, remover, restrictions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
     <button onClick={() => remover()}>×</button>
     <label>{keyName}</label>
     <ValueEntry placeholder={keyName} value={value} onChange={value => onChange({ key: keyName, value })} restrictions={restrictions}/>
    </div>
  )
}

export function MemberArrayEntry({ keyName, value, onChange, remover, restrictions }) {
  const arrayChange = useCallback(evt => {
    const newArray = [...value]
    newArray[evt.index] = evt.value
    onChange({ key: keyName, value })
  }, [keyName, value, onChange])

  const arrayRemoveAt = useCallback(index => {
    onChange({ key: keyName, value: value.filter((_, i) => i !== index) })
  }, [keyName, value, onChange])

  const arrayAppend = useCallback(() => {
    onChange({ key: keyName, value: [...value, ''] })
  }, [keyName, value, onChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
     <button onClick={() => remover()}>×</button>
     <label>{keyName}</label>
      <ArrayEntry value={value} onChange={arrayChange} removeAt={arrayRemoveAt} append={arrayAppend} restrictions={restrictions} />
    </div>
  )
}

function InnerObjectEditor({ keyName, value, onChange, remover, restrictions }) {
  const innerSet = useCallback((innerKey, innerValue) => {
    const newValue = { ...value }
    newValue[innerKey] = innerValue
    onChange({ key: keyName, value: newValue })
  }, [value, onChange, keyName])

  const innerRemove = useCallback(innerKey => {
    const newValue = { ...value }
    delete newValue[innerKey]
    onChange({ key: keyName, value: newValue })
  }, [value, onChange, keyName])

  return (
    <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'row' }}>
     <button onClick={() => remover()}>×</button>
     <label>{keyName}</label>
      <ObjectEditor value={value} onChange={innerSet} append={innerSet} remove={innerRemove} />
    </div>
  )
}

export default function ObjectEditor({ value, onChange, append, remove, restrictions = { all: Object.keys(TYPE_TO_TYPENAME), schema: {} } }) {
  const [appendKey, setAppendKey] = useState('')
  const [appendType, setAppendType] = useState('string')
  const [keys, setKeys] = useState(Object.keys(value))

  useEffect(() => setKeys(Object.keys(value)), [setKeys, value])

  const appendControls = (
    <div>
      <select value={appendType} onChange={evt => setAppendType(evt.target.value)}>
        {
          Object.keys(OBJECT_EDITOR_TYPE_TO_TYPENAME).map(key => <option key={key} value={key}>{OBJECT_EDITOR_TYPE_TO_TYPENAME[key]}</option>)
        }
      </select>
      <input value={appendKey} placeholder='New key' onChange={evt => setAppendKey(evt.target.value)} />
      <button onClick={() => { append(appendKey, OBJECT_EDTIOR_TYPE_TO_DEFAULT_GENERATOR[appendType]()); setAppendKey('') }}>+</button>
    </div>
  )

  function mapMember(key) {
    let Component = 
      Array.isArray(value[key]) ?
      MemberArrayEntry :
      (
        typeof value[key] === 'object' ?
        InnerObjectEditor :
        MemberEntry
      )

    return (
      <Component key={key} keyName={key} value={value[key]} onChange={onChange} remover={() => remove(key)} restrictions={restrictions.all} />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {appendControls}
      {
        keys.length === 0 ?
        <em>Empty object...</em> :
        Object.keys(value).map(mapMember)
      }
      {appendControls}
    </div>
  )
}
