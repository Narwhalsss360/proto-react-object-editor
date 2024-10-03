import React, { useState, useCallback, useEffect } from 'react'
import { TYPE_TO_DEFAULT_GENERATOR, TYPE_TO_TYPENAME } from './constants'
import ValueEntry from './ValueEntry'
import ArrayEntry from './ArrayEntry'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'

export function MemberEntry({ keyName, value, onChange, remover, restrictions, style }) {
  return (
    <ListGroup.Item style={style}>
      <div className="ms-2 me-auto">
        <div className="fw-bold">
          {keyName}
        </div>
        <ValueEntry placeholder={keyName} value={value} onChange={value => onChange({ key: keyName, value })} onRemove={remover} restrictions={restrictions}/>
      </div>
    </ListGroup.Item>
  )
}

export function MemberArrayEntry({ keyName, value, onChange, remover, restrictions, style }) {
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
    <ListGroup.Item style={style}>
      <div className="ms-2 me-auto">
        <div className="fw-bold">
          <Button variant='danger' onClick={() => remover()} style={{ marginRight: '5px' }}>×</Button>
          {keyName}
        </div>
        <ArrayEntry value={value} onChange={arrayChange} removeAt={arrayRemoveAt} append={arrayAppend} restrictions={restrictions} elementEntryStyle={{ margin: '0px' }} />
      </div>
    </ListGroup.Item>
  )
}

function InnerObjectEditor({ keyName, value, onChange, remover, restrictions, style }) {
  const innerChange = useCallback(evt => {
    const newValue = { ...value }
    newValue[evt.key] = evt.value
    onChange({ key: keyName, value: newValue })
  }, [value, onChange, keyName])

  const innerAppend = useCallback((innerKey, innerValue) => {
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
    <ListGroup.Item style={style}>
      <Button variant='danger' onClick={() => remover()} style={{ marginRight: '5px' }}>×</Button>
      <label>{keyName}</label>
      <ObjectEditor value={value} onChange={innerChange} append={innerAppend} remove={innerRemove} restrictions={restrictions} />
    </ListGroup.Item>
  )
}

export default function ObjectEditor({ value, onChange, append, remove, restrictions = { all: Object.keys(TYPE_TO_TYPENAME), schema: {} }, itemStyle = {} }) {
  const [appendKey, setAppendKey] = useState('')
  const [appendType, setAppendType] = useState('string')
  const [keys, setKeys] = useState(Object.keys(value))

  useEffect(() => setKeys(Object.keys(value)), [setKeys, value])

  const submitAppend = useCallback(() => {
    append(appendKey, TYPE_TO_DEFAULT_GENERATOR[appendType]())
    setAppendKey('')
  }, [append, appendKey, appendType, setAppendKey])

  const appendControls = (
    <InputGroup style={{ margin: '10px' }}>
      <DropdownButton title={`Type ${TYPE_TO_TYPENAME[appendType]}`}>
        {
          Object.keys(TYPE_TO_TYPENAME).map(key => (
            <Dropdown.Item key={key} onClick={() => setAppendType(key)}>{TYPE_TO_TYPENAME[key]}</Dropdown.Item>
          ))
        }
      </DropdownButton>
      <Form.Control value={appendKey} placeholder='New key' onChange={evt => setAppendKey(evt.target.value)} />
      <Button variant='success' onClick={submitAppend}>+</Button>
    </InputGroup>
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
      <Component key={key} keyName={key} value={value[key]} onChange={onChange} remover={() => remove(key)} restrictions={Component === MemberEntry ? restrictions.all : restrictions} style={itemStyle} />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {appendControls}
      <ListGroup>
        {
          keys.length === 0 ?
          <em>Empty object...</em> :
          Object.keys(value).map(mapMember)
        }
      </ListGroup>
      {appendControls}
    </div>
  )
}
