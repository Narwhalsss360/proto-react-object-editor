import '../styles/clickable.css'
import React, { useCallback, useState } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'
import generalReducer from './reducers'
import SimpleEditor from './SimpleEditor'
import ArrayEditor from './ArrayEditor'
import ObjectEditor from './ObjectEditor'
import { getScheme, property, requireProperty } from './schemas'
import { TYPES, isSimple } from './types'

export default function ChildEditor({ childKey, value, schema, isArray }) {
  const index = childKey

  const [newKey, setNewKey] = useState(null)
  const [newPosition, setNewPosition] = [newKey, setNewKey]

  const dispatcher = requireProperty(schema, 'dispatcher', 'schema').dispatcher

  const scheme = getScheme(schema, childKey, value)

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

  const applyNewPosition = useCallback(() => {
    setNewPosition(null)
    dispatcher({
      type: 'swap-elements',
      index,
      target: newPosition - 1
    })
  }, [setNewPosition, dispatcher, index, newPosition])

  const editor = Array.isArray(value) ?
    <ArrayEditor
      value={value}
      schema={{
        label: isArray ? index + 1 : childKey,
        dispatcher: action => dispatcher(isArray ? {
          type: 'set-element',
          index,
          value: generalReducer(value, action)
        } : {
          type: 'set-key',
          key: childKey,
          value: generalReducer(value, action)
        }),
        deleter: property(scheme, 'required', false) ? null : () => dispatcher(isArray ? {
          type: 'delete-key',
          index
        } : {
          type: 'delete-key',
          key: childKey
        }),
        ...scheme
      }}
    /> :
    isSimple(value) ?
    <SimpleEditor
      value={value}
      scheme={{
        label: isArray ? index + 1 : childKey,
        types: TYPES,
        dispatcher: action => {
          if (action.type !== 'set-as') {
            throw Error('Unexpected action type for inner child.')
          }
          dispatcher(isArray ? {
            type: 'set-element',
            index,
            value: action.value
          } : {
            type: 'set-key',
            key: childKey,
            value: action.value
          })
        },
        deleter: property(scheme, 'required', false) ? null : () => dispatcher(isArray ? {
          type: 'delete-element',
          index
        } : {
          type: 'delete-key',
          key: childKey
        }),
        __OVERRIDE_TYPES__: true,
        ...scheme
      }}
    /> :
    <ObjectEditor
      value={value}
      schema={{
        label: isArray ? index + 1 : childKey,
        dispatcher: action => dispatcher(isArray ? {
          type: 'set-element',
          index,
          value: generalReducer(value, action)
        } : {
          type: 'set-key',
          key: childKey,
          value: generalReducer(value, action)
        }),
        deleter: property(scheme, 'required', false) ? null : () => dispatcher(isArray ? {
          type: 'delete-element',
          index
        } : {
          type: 'delete-key',
          key: childKey
        }),
        ...scheme,
      }}
    />

  if (isArray) {
    return (
      <ListGroup.Item>
        <Row>
          <Col md='auto'>
            {
              newPosition === null ?
              <Button variant='outline-secondary' onClick={() => setNewPosition(index + 1)}>↕</Button> :
              <>
                <Form.Control type='number' value={newPosition} onChange={evt => setNewPosition(evt.target.value)} />
                <Button variant='outline-danger' onClick={() => setNewPosition(null)}>Cancel</Button>
                <Button variant='success' onClick={applyNewPosition}>Apply</Button>
              </>
            }
          </Col>
          <Col>
            {editor}
          </Col>
        </Row>
      </ListGroup.Item>
    )
  } else {
    return (
      <Accordion.Item eventKey={childKey}>
        <Accordion.Header>
          {
            newKey === null ?
            <h5>
              <Badge
                className='clickable'
                onClick={() => property(scheme, 'required', false) ? null : setNewKey(childKey) }
              >
                {childKey}
              </Badge>
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
          {editor}
        </Accordion.Body>
      </Accordion.Item>
    )
  }
}
