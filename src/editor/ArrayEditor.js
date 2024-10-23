import React, { useCallback, useReducer, useState } from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import CloseButton from 'react-bootstrap/CloseButton'
import SimpleEditor from './SimpleEditor'
import ObjectEditor from './ObjectEditor'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import generalReducer from './reducers'
import { keys } from './objectIterators'
import { isSimple, isSimpleType, inputType, TYPE_PARSERS, SIMPLE_TYPE_NAME, TYPE_GENERATORS, TYPE_NAMES } from './types'

function removeComplex(scheme) {
  const SIMPLE_TYPES = keys(SIMPLE_TYPE_NAME)
  if (scheme === null) {
    return null
  }
  const replaced = { ...scheme }
  if ('types' in replaced) {
    replaced.types = replaced.types.filter(type => SIMPLE_TYPES.includes(type))
  }
  return replaced
}

function ChildEditor({ index, value, arrayDispatcher, schema }) {
  const [newPosition, setNewPoisiton] = useState(null)

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

    if (!(index in schema.children)) {
      if ('other' in schema) {
        return schema.other
      }
      return null
    }

    return schema.children[index]
  }, [index, schema])

  const scheme = getScheme()

  const applyNewPosition = useCallback(() => {
    arrayDispatcher({
      type: 'swap-elements',
      index,
      target: newPosition - 1
    })
    setNewPoisiton(null)
  }, [arrayDispatcher, index, newPosition])

  const required = scheme !== null && 'required' in scheme && scheme.required === true

  const deleter = required ?
  () => {} :
  () => arrayDispatcher({
    type: 'delete-element',
    index
  })

  return (
    <ListGroup.Item>
      <Row>
        <Col md='auto'>
          {
            newPosition === null ?
            <Button variant='outline-secondary' onClick={() => setNewPoisiton(index + 1)}>↕</Button> :
            <>
              <Form.Control type='number' value={newPosition} onChange={evt => setNewPoisiton(evt.target.value)} />
              <Button variant='outline-danger' onClick={() => setNewPoisiton(null)}>Cancel</Button>
              <Button variant='success' onClick={applyNewPosition}>Apply</Button>
            </>
          }
        </Col>
        <Col>
          {
            Array.isArray(value) ?
            <ArrayEditor
              value={value}
              dispatcher={action => arrayDispatcher({
                type: 'set-element',
                index,
                value: generalReducer(value, action)
              })}
              schema={{
                label: `${index + 1}`,
                ...(scheme ?? {})
              }}
              deleter={deleter}
            /> :
            isSimple(value) ?
            <SimpleEditor
              value={value}
              dispatcher={action => {
                if (action.type !== 'set-as') {
                  throw Error('Unexpected action type for inner child.')
                }
                arrayDispatcher({
                  type: 'set-element',
                  index,
                  value: action.value
                })
              }}
              scheme={{
                label: `${index + 1}`,
                types: keys(SIMPLE_TYPE_NAME),
                ...removeComplex(scheme ?? {})
              }}
              deleter={deleter}
            /> :
            <ObjectEditor
              value={value}
              dispatcher={action => arrayDispatcher({
                type: 'set-element',
                index,
                value: generalReducer(value, action)
              })}
              schema={{
                label: `${index + 1}`,
                ...(scheme ?? {})
              }}
              deleter={deleter}
            />
          }
        </Col>
      </Row>
    </ListGroup.Item>
  )
}

export default function ArrayEditor({
  value,
  dispatcher,
  deleter = null,
  schema = {}
}) {
  if (!Array.isArray(value)) {
    throw Error(`Type ${typeof value} is unsupported by ${ArrayEditor}`)
  }

  const isEmpty = useCallback(() => value.length === 0, [value])

  const [newInfo, disptachNewInfo] = useReducer(generalReducer, {
    type: 'string',
    position: '',
    value: ''
  })

  const required = schema !== null && 'required' in schema && schema.required === true

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
      type: newInfo.position === '' ? 'append-element' : 'insert-element',
      value: newInfo.value,
      index: newInfo.position
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_GENERATORS[newInfo.type]()
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'position',
      value: ''
    })
  }, [dispatcher, newInfo, disptachNewInfo])

  const newControls = (
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
            type='number'
            value={newInfo.position}
            placeholder='Position'
            onChange={evt => disptachNewInfo({
              type: 'set-key',
              key: 'position',
              value: Number(evt.target.value)
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
  )

  return (
    <Card>
      <Card.Header>
        <Row>
          {
            !required && deleter !== null &&
            <Col md='auto'>
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
        <ListGroup as='ol'>
          {newControls}
          {
            isEmpty() ?
            <em>[ ... ]</em> :
            value.map((item, i) => (
              <ChildEditor
                key={i}
                index={i}
                value={item}
                arrayDispatcher={dispatcher}
                schema={schema}
                />
              ))
            }
        </ListGroup>
      </Card.Body>
    </Card>
  )
}
