import React from 'react'
import { TYPE_TO_TYPENAME } from './constants'
import ValueEntry from './ValueEntry'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'

export function ElementEntry({ index, value, onChange, restrictions, remover, style = {} }) {
  return (
    <ListGroup.Item>
      <ValueEntry placeholder={index} value={value} onChange={value => onChange({ value: value, index: index })}  onRemove={remover} restrictions={restrictions} style={style} />
    </ListGroup.Item>
  )
}

export default function ArrayEntry({ value, onChange, removeAt, append, restrictions={ length: -1, all: Object.keys(TYPE_TO_TYPENAME) }, style = {}, elementEntryStyle = {} }) {

  const appendControls = (
    <>
      <Button variant='outline-success' onClick={append}>+</Button>
    </>
  )

  return (
    <div style={style}>
      <ListGroup>
        {appendControls}
        {
          value.length === 0 ?
          <ListGroup.Item>
            <em>
              Empty list...
            </em>
          </ListGroup.Item> :
          <ListGroup as='ol' numbered>
            {
              value.filter((_, i) =>  !('length' in restrictions) || i < restrictions.length || restrictions.length === -1).map((elem, i) => <ElementEntry key={i} index={i} value={elem} onChange={onChange} restrictions={i in restrictions ? restrictions[i] : restrictions.all} remover={() => removeAt(i)} style={elementEntryStyle} />)
            }
          </ListGroup>
        }
        {appendControls}
      </ListGroup>
    </div>
  )
}
