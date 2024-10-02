import React, { useEffect, useState } from 'react'
import { TYPE_TO_TYPENAME } from './constants'

export default function ValueEntry({ value, onChange, restrictions=Object.keys(TYPE_TO_TYPENAME), placeholder='' }) {
  const [type, setType] = useState(restrictions.length !== 0 ? restrictions[0] : 'string')
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    setDisabled(restrictions.length === 0)
  }, [setDisabled, restrictions])

  return (
    <div>
      <select value={type} disabled={disabled || restrictions.length === 1} onChange={(evt) => setType(evt.target.value)}>
        {
          Object.keys(TYPE_TO_TYPENAME).filter(key => restrictions.includes(key)).map(key => <option key={`ValueEntry:select:option:${key}`} value={key}>{TYPE_TO_TYPENAME[key]}</option>)
        }
      </select>
      <input type={type} value={value} disabled={disabled} onChange={evt => onChange(evt.target.value)} placeholder={placeholder} />
    </div>
  )
}
