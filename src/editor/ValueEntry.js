import React, { useEffect, useState } from 'react'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Button from 'react-bootstrap/Button'
import { TYPE_TO_TYPENAME } from './constants'

export default function ValueEntry({ value, onChange, restrictions=Object.keys(TYPE_TO_TYPENAME), onRemove=null, placeholder='', style={} }) {
  if (!(typeof value in TYPE_TO_TYPENAME)) {
    throw Error(`The type ${typeof value} is not supported by ${ValueEntry}`)
  }

  const [type, setType] = useState(typeof value)
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    setDisabled(restrictions.length === 0)
  }, [setDisabled, restrictions])

  return (
    <InputGroup className='mb-3' style={style}>
      {
        onRemove !== null &&
        <Button onClick={onRemove} variant='danger'>×</Button>
      }
      <DropdownButton title={`Type ${TYPE_TO_TYPENAME[type]}`} disabled={disabled || restrictions.length === 1} onChange={evt => console.log(evt)}>
        {
          Object.keys(TYPE_TO_TYPENAME).filter(key => restrictions.includes(key)).map(key => <Dropdown.Item key={`ValueEntry:select:option:${key}`} onClick={() => setType(key)}>{TYPE_TO_TYPENAME[key]}</Dropdown.Item>)
        }
      </DropdownButton>
      <Form.Control type={type} value={value} disabled={disabled} onChange={evt => onChange(evt.target.value)} placeholder={placeholder} />
    </InputGroup>
  )
}
