import '../styles/clickable.css'
import React, { useCallback, useState } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import Form from 'react-bootstrap/Form'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import generalReducer from './reducers'
import SimpleEditor from './SimpleEditor'
import ArrayEditor from './ArrayEditor'
import ObjectEditor from './ObjectEditor'
import { getScheme, property, requireProperty } from './schemas'
import { SIMPLE_TYPES, isSimple } from './types'

export default function ChildEditor({ childKey, value, schema, isArray }) {
  const index = childKey

  const [newKey, setNewKey] = useState(null)
  const [newPosition, setNewPosition] = [newKey, setNewKey]

  const dispatcher = requireProperty(schema, 'dispatcher', 'schema').dispatcher

  const scheme = getScheme(schema, childKey)

  const applyNewKey = useCallback(() => {
    dispatcher(isArray ? {
      type: 'swap-elements',
      index,
      target: newPosition - 1
    } : {
      type: 'swap-key-name',
      key: childKey,
      newKey: newKey
    })
  }, [dispatcher, isArray, index, childKey, newPosition, newKey])

  if (isArray) {

  } else {
    return (
      <Accordion.Item eventKey={childKey}>
        <Accordion.Header>
          {
            newKey === null ?
            <h5>
              <Badge className='clickable' onClick={() => setNewKey(childKey)}>{childKey}</Badge>
            </h5> :
            <>
              <Form.Control
                value={newKey}
                onChange={evt => setNewKey(evt.target.value)}
              />
              <Button variant='outline-danger' onClick={() => setNewKey(null)}>Cancel</Button>
              <Button variant='success' onClick={applyNewKey}>Apply</Button>
            </>
          }
        </Accordion.Header>
        <Accordion.Body>
          {
            Array.isArray(value) ?
            <ArrayEditor
              value={value}
              dispatcher={action => dispatcher({
                type: 'set-key',
                key: childKey,
                value: generalReducer(value, action)
              })}
            /> :
            isSimple(value) ?
            <SimpleEditor
              value={value}
              scheme={{
                label: childKey,
                types: SIMPLE_TYPES,
                dispatcher: action => {
                  if (action.type !== 'set-as') {
                    throw Error('Unexpected action type for inner child.')
                  }
                  dispatcher({
                    type: 'set-key',
                    key: childKey,
                    value: action.value
                  })
                },
                deleter: property(scheme, 'required', false) ? null : () => dispatcher({
                  type: 'delete-key',
                  key: childKey
                }),
                ...scheme
              }}
            /> :
            <ObjectEditor
              value={value}
              dispatcher={action => dispatcher({
                type: 'set-key',
                key: childKey,
                value: generalReducer(value, action),
              })}
              schema={{
                label: childKey,
                deleter: property(scheme, 'required', false) ? null : () => dispatcher({
                  type: 'delete-key',
                  key: childKey
                }),
                ...scheme,
              }}
            />
          }
        </Accordion.Body>
      </Accordion.Item>
    )
  }
}
