import React, { useCallback, useState } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import CloseButton from 'react-bootstrap/CloseButton'
import Form from 'react-bootstrap/Form'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'
import Accordion from 'react-bootstrap/Accordion'
import ObjectEditor from './ObjectEditor'
import ArrayEditor from './ArrayEditor'
import SimpleEditor from './SimpleEditor'
import getScheme, { property, requireProperty } from './schemas'
import generalReducer from './generalReducer'
import { isSimple, TYPES, TYPE_NAMES, TYPE_GENERATORS } from './types'
import { keys } from './objectIterators'

export default function ChildEditor({ childKey, value, schema, parent }) {
  const parentIsArray = Array.isArray(parent)

  const index = childKey
  const [newKey, setNewKey] = useState(null)

  const dispatcher = requireProperty(schema, 'dispatcher').dispatcher

  const scheme = getScheme(schema, childKey, value, parent)

  const applyNewKey = useCallback(() => {
    setNewKey(null)
    dispatcher(parentIsArray ? {
      type: 'swap-elements',
      index,
      target: newKey - 1
    } : {
      type: 'swap-key-name',
      key: childKey,
      newKey: newKey
    })
  }, [dispatcher, parentIsArray, index, childKey, newKey])

  const setType = useCallback(type => {
    dispatcher(parentIsArray ? {
      type: 'set-element',
      index,
      value: TYPE_GENERATORS[type]()
    } : {
      type: 'set-key',
      key: childKey,
      value: TYPE_GENERATORS[type]()
    })
    setNewKey(null)
  }, [parentIsArray, dispatcher, index, childKey])
  
  const templateTypeCombo = property(property(schema, 'others'), 'types', [])
  .concat(keys(property(schema, 'templates', {})).filter(template => !TYPES.includes(template)))

  const CAN_EDIT_KEY_OR_POSITION = property(scheme, Array.isArray(parent) ? 'canEditPosition' : 'canEditKey', false)
  const CAN_EDIT_TYPE = templateTypeCombo.length > 0

  const headerGenerator = (value, schema) => (
    <Row>
      {
        property(schema, 'deleter', null) !== null &&
        <Col md='auto' style={{margin: 'auto'}}>
          <CloseButton onClick={schema.deleter} />
        </Col>
      }
      {
        (newKey !== null && CAN_EDIT_TYPE) &&
        (Array.isArray(value) || !isSimple(value)) &&
        <Col md='auto'>
          <Form.Select value={typeof value} onChange={evt => setType(evt.target.value)}>
            {
              templateTypeCombo.map(type => (
                <option key={type} value={type}>
                  {
                    type in TYPE_NAMES ?
                    TYPE_NAMES[type] :
                    type
                  }
                </option>
              ))
            }
          </Form.Select>
        </Col>
      }
      <Col style={{margin: 'auto'}}>
      {
        newKey === null ?
          <Badge
            onClick={CAN_EDIT_KEY_OR_POSITION || CAN_EDIT_TYPE ?
              () => property(schema, 'required', false) ? null : setNewKey(parentIsArray ? index + 1 : childKey)
              : null
            }
            style={CAN_EDIT_KEY_OR_POSITION || CAN_EDIT_TYPE ? {cursor: 'pointer'} : {}}
          >
            {CAN_EDIT_KEY_OR_POSITION || CAN_EDIT_TYPE ? '✎ ' : ''}
            {parentIsArray ? index + 1 : childKey}
          </Badge> :
            <Form onSubmit={evt => evt.preventDefault()}>
            <Row>
            {
              CAN_EDIT_KEY_OR_POSITION ?
              <Col>
                <Form.Control
                type={parentIsArray ? 'number' : 'text'}
                value={newKey}
                onChange={evt => setNewKey(evt.target.value)}
                />
              </Col> :
              <></>
            }
              <Col md='auto'>
                <Button variant='outline-danger' onClick={() => setNewKey(null)}>Cancel</Button>
              </Col>
              <Col md='auto'>
                <Button variant='success' onClick={applyNewKey}>Apply</Button>
              </Col>
            </Row>
            </Form>
      }
      </Col>
    </Row>
  )

  const editor = Array.isArray(value) ?
    <ArrayEditor
      value={value}
      schema={{
        label: parentIsArray ? index + 1 : childKey,
        dispatcher: action => dispatcher(parentIsArray ? {
          type: 'set-element',
          index,
          value: generalReducer(value, action)
        } : {
          type: 'set-key',
          key: childKey,
          value: generalReducer(value, action)
        }),
        deleter: property(scheme, 'required', false) ? null : () => dispatcher(parentIsArray ? {
          type: 'delete-element',
          index
        } : {
          type: 'delete-key',
          key: childKey
        }),
        headerGenerator,
        ...scheme
      }}
    /> :
    isSimple(value) ?
    <SimpleEditor
      value={value}
      scheme={{
        label: parentIsArray ? index + 1 : childKey,
        types: TYPES,
        dispatcher: action => {
          if (action.type !== 'set-as') {
            throw Error('Unexpected action type for inner child.')
          }
          dispatcher(parentIsArray ? {
            type: 'set-element',
            index,
            value: action.value
          } : {
            type: 'set-key',
            key: childKey,
            value: action.value
          })
        },
        deleter: property(scheme, 'required', false) ? null : () => dispatcher(parentIsArray ? {
          type: 'delete-element',
          index
        } : {
          type: 'delete-key',
          key: childKey
        }),
        __OVERRIDE_TYPES__: true,
        headerGenerator,
        ...scheme
      }}
    /> :
    <ObjectEditor
      value={value}
      schema={{
        label: parentIsArray ? index + 1 : childKey,
        dispatcher: action => dispatcher(parentIsArray ? {
          type: 'set-element',
          index,
          value: generalReducer(value, action)
        } : {
          type: 'set-key',
          key: childKey,
          value: generalReducer(value, action)
        }),
        deleter: property(scheme, 'required', false) ? null : () => dispatcher(parentIsArray ? {
          type: 'delete-element',
          index
        } : {
          type: 'delete-key',
          key: childKey
        }),
        headerGenerator,
        ...scheme,
      }}
    />

  return parentIsArray ? (
    <ListGroup.Item>
      <Row>
        {editor}
      </Row>
    </ListGroup.Item>
  ) : (
    <Accordion.Item eventKey={childKey}>
      <Accordion.Header>
        {property(scheme, 'label', childKey)}
      </Accordion.Header>
      <Accordion.Body>
        {editor}
      </Accordion.Body>
    </Accordion.Item>
  )
}
