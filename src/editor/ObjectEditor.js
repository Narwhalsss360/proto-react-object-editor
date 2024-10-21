import React, { useCallback, useReducer, useState } from 'react'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import CloseButton from 'react-bootstrap/CloseButton'
import Badge from 'react-bootstrap/Badge'
import Accordion from 'react-bootstrap/Accordion'
import items, { keys } from './objectIterators'
import { inputType, isSimple, isSimpleType, requireValidType, TYPE_PARSERS, TYPE_NAMES, TYPE_GENERATORS, SIMPLE_TYPE_NAME } from './types'
import generalReducer from './reducers'
import SimpleEditor from './SimpleEditor'
import useOnFirstLoad from '../hooks/useOnFirstLoad'

function ChildEditor({ childKey, value, objectDispatcher, schema }) {
  const [newKey, setNewKey] = useState(null)

  const getScheme = useCallback(() => {
    if (schema === null) {
      return null
    }

    if (!('children' in schema)) {
      if ('other' in schema) {
        return schema.other
      }
      return null
    }

    if (!(childKey in schema.children)) {
      if ('other' in schema) {
        return schema.other
      }
      return null
    }

    return schema.children[childKey]
  }, [childKey, schema])

  const scheme = getScheme()

  const applyNewKey = useCallback(() => {
    objectDispatcher({
      type: 'swap-key-name',
      key: childKey,
      newKey: newKey
    })
    setNewKey(null)
  }, [objectDispatcher, childKey, newKey])

  const required = scheme !== null && 'required' in scheme && scheme.required === true

  const deleter = required ?
  () => {} :
  () => objectDispatcher({
    type: 'delete-key',
    key: childKey
  })

  return (
    <Accordion.Item eventKey={childKey}>
      <Accordion.Header>
        {
          newKey === null ?
          <h5>
            <Badge onClick={() => setNewKey(childKey)}>{childKey}</Badge>
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
          <>{(() => { throw Error('Not implemented') })()}</> :
          isSimple(value) ?
          <SimpleEditor
            value={value}
            dispatcher={action => {
              if (action.type !== 'set-as') {
                throw Error('Unexpected action type for inner child.')
              }
              objectDispatcher({
                type: 'set-key',
                key: childKey,
                value: action.value
              })
            }}
            scheme={{
              label: childKey,
              types: keys(SIMPLE_TYPE_NAME),
              ...(scheme ?? {})
            }}
            deleter={required ? null : deleter}
          /> :
          <ObjectEditor
            value={value}
            dispatcher={action => objectDispatcher({
              type: 'set-key',
              key: childKey,
              value: generalReducer(value, action),
            })}
            schema={{
              label: childKey,
              ...(scheme ?? {})
            }}
            deleter={required ? null : deleter}
          />
        }
      </Accordion.Body>
    </Accordion.Item>
  )
}

export default function ObjectEditor({
  value,
  dispatcher,
  deleter = null,
  schema = {},
  style = {}
}) {
  if (isSimple(requireValidType(value))) {
    throw Error(`Type ${typeof value} is unsupported by ${ObjectEditor}`)
  } else if (Array.isArray(value)) {
    throw Error(`Arrays are unsupported by ${ObjectEditor}`)
  }

  const isEmpty = useCallback(() => keys(value).length === 0, [value])

  const [newInfo, disptachNewInfo] = useReducer(generalReducer, {
    type: 'string',
    key: '',
    value: ''
  })

  const newTypeChanged = useCallback(newType => {
    disptachNewInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_GENERATORS[newType]()
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'type',
      value: newType
    })
  }, [disptachNewInfo])

  const newSubmitted = useCallback(evt => {
    evt.preventDefault()
    dispatcher({
      type: 'append-key',
      key: newInfo.key,
      value: newInfo.value
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_GENERATORS[newInfo.type]()
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'key',
      value: ''
    })
  }, [dispatcher, newInfo, disptachNewInfo])

  const ensureRequired = useCallback(() => {
    if (schema === null || !('children' in schema)) {
      return
    }
    items(schema.children).forEach(pair => {
      const [key, scheme] = pair
      if ((!('required' in scheme) || !scheme.required) && key in value) {
        return
      }


      let child = null
      if ('default' in scheme) {
        child = scheme.default
      } else if ('types' in scheme && scheme.types.length > 0) {
        child = TYPE_GENERATORS[scheme.types[0]]() //Ensure type is valid
      } else {
        throw Error(`Required child ${key} must have a default or 1 type`)
      }

      dispatcher({
        type: 'append-key',
        key,
        value: child
      })
    })
  }, [dispatcher, schema, value])

  useOnFirstLoad(ensureRequired, [ensureRequired])

  const newControls = (schema !== null && ('other' in schema && ('types' in schema.other))) && schema.other.types.length !== 0 ?
  (
    <Form onSubmit={newSubmitted}>
      <Row>
        <Col md='auto'>
          <Form.Select value={newInfo.type} onChange={evt => newTypeChanged(evt.target.value)}>
          {
            schema.other.types.map(type => (
              <option key={type} value={type}>{TYPE_NAMES[type]}</option>
            ))
          }
          </Form.Select>
        </Col>
        <Col md='auto'>
          <Form.Control
            value={newInfo.key}
            placeholder='Key'
            onChange={evt => disptachNewInfo({
              type: 'set-key',
              key: 'key',
              value: evt.target.value
            })}
          />
        </Col>
        <Col>
          {
            newInfo.type === 'boolean' ?
            <ButtonGroup>
              <ToggleButton
                id='toggle-check'
                type='checkbox'
                checked={newInfo.value}
                variant={newInfo.value ? 'success' : 'outline-secondary'}
                onChange={evt => disptachNewInfo({
                  type: 'set-key',
                  key: 'value',
                  value: evt.target.checked
                })}
              >
                Enabled
              </ToggleButton>
              <ToggleButton
                id='toggle-check'
                type='checkbox'
                checked={!newInfo.value}
                variant={!newInfo.value ? 'success' : 'outline-secondary'}
                onChange={evt => disptachNewInfo({
                  type: 'set-key',
                  key: 'value',
                  value: evt.target.checked
                })}
              >
                Disabled
              </ToggleButton>
            </ButtonGroup> :
            isSimpleType(newInfo.type) ?
            <Form.Control
                type={inputType(newInfo.type)}
                placeholder='Value'
                value={newInfo.value}
                onChange={evt => disptachNewInfo({
                  type: 'set-key',
                  key: 'value',
                  value: TYPE_PARSERS[newInfo.type](evt.target.value)
                })}
            /> :
            <em>...</em>
          }
        </Col>
        <Col md='auto'>
          <Button variant='outline-success' type='submit'>+</Button>
        </Col>
      </Row>
    </Form>
  ) :
  <></>

  return (
    <Card>
      <Card.Header>
        <Row>
          {
            deleter !== null &&
            <Col md={'auto'}>
              <CloseButton onClick={deleter} />
            </Col>
          }
          {
            schema?.label !== null &&
            <Col>
              <label>
                {schema.label}
              </label>
            </Col>
          }
        </Row>
      </Card.Header>
      <Card.Body>
        {newControls}
        {
          isEmpty() ?
          <em>{"{ ... }"}</em> :
          <Accordion alwaysOpen>
            {
              items(value).map(pair => (
                <ChildEditor
                  key={pair[0]}
                  childKey={pair[0]}
                  value={pair[1]}
                  objectDispatcher={dispatcher}
                  schema={schema}
                />
              ))
            }
          </Accordion>
        }
      </Card.Body>
    </Card>
  )
}
