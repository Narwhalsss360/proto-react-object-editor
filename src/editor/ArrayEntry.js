import React from 'react'
import { TYPE_TO_TYPENAME } from './constants'
import ValueEntry from './ValueEntry'

export function ElementEntry({ index, value, onChange, restrictions, remover }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
     <button onClick={() => remover()}>×</button>
     <ValueEntry placeholder={index} value={value} onChange={value => onChange({ value: value, index: index })} restrictions={restrictions} />
    </div>
  )
}

export default function ArrayEntry({ value, onChange, removeAt, append, restrictions={ length: -1, all: Object.keys(TYPE_TO_TYPENAME) } }) {

  return (
    <div>
      <button onClick={append}>+</button>
      {
        value.filter((_, i) =>  !('length' in restrictions) || i < restrictions.length || restrictions.length === -1).map((elem, i) => <ElementEntry key={i} index={i} value={elem} onChange={onChange} restrictions={i in restrictions ? restrictions[i] : restrictions.all} remover={() => removeAt(i)} />)
      }
      <button onClick={append}>+</button>
    </div>
  )
}
