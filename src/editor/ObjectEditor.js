import React, { useCallback, useReducer } from 'react'
import Card from 'react-bootstrap/Card'
import Accordion from 'react-bootstrap/Accordion'
import CloseButton from 'react-bootstrap/CloseButton'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import NewChildControls from './NewChildControls'
import Form from 'react-bootstrap/Form'
import ChildEditor from './ChildEditor'
import generalReducer from './reducers'
import { property, requireProperty } from './schemas'
import { isValidType, TYPE_GENERATORS, TYPE_NAMES } from './types'
import items, { keys } from './objectIterators'
import useOnFirstLoad from '../hooks/useOnFirstLoad'

export default function ObjectEditor({ value, schema }) {
  if (value === undefined || value === null || typeof value !== 'object') {
    throw Error(`${ObjectEditor}: Only type of 'object' is supported.`)
  }

  const dispatcher = requireProperty(schema, 'dispatcher', 'scheme').dispatcher

  const EMPTY = keys(value).length === 0

  const DEFAULT_NEW_CHILD = property(property(schema, 'others'), 'types', []).length === 0 ? {
    type: '',
    key: '',
    value: ''
  } : {
    type: schema.others.types[0],
    key: '',
    value: TYPE_GENERATORS[schema.others.types[0]]()
  }

  const [newChildInfo, dispatchNewChildInfo] = useReducer(generalReducer, DEFAULT_NEW_CHILD)

  const newChildSubmitted = useCallback(() => {
    dispatcher({
      type: 'append-key',
      key: newChildInfo.key,
      value: newChildInfo.value
    })
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_GENERATORS[newChildInfo.type]()
    })
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'key',
      value: ''
    })
  }, [dispatcher, dispatchNewChildInfo, newChildInfo])

  const setType = useCallback(type => {
    dispatcher({
      type: 'set-as',
      value: TYPE_GENERATORS[type]()
    })
  }, [dispatcher])

  const ensureRequired = useCallback(() => {
    if (schema === null || !('children' in schema)) {
      return
    }

    const newValue = { ...value }

    items(schema.children).forEach(pair => {
      const [key, scheme] = pair

      if ((!property(scheme, 'required', false) || key in value) && !('default' in scheme)) {
        return
      }

      let child = null
      if ('default' in scheme) {
        child = scheme.default
      } else if ('types' in scheme && scheme.types.length > 0) {
        if (!isValidType(schema.types[0])) {
          throw Error(`Type ${scheme.types[0]} is not supported.`)
        }
        child = TYPE_GENERATORS[scheme.types[0]]()
      } else {
        throw Error(`Required child ${key} must have a default or 1 type`)
      }

      newValue[key] = child
    })

    dispatcher({
      type: 'set-as',
      value: newValue
    })
  }, [schema, dispatcher, value])

  useOnFirstLoad(ensureRequired)

  return (
    <Card>
      <Card.Header>
        <Row>
          {
            property(schema, 'deleter', null) !== null &&
            <Col md='auto'>
              <CloseButton onClick={schema.deleter} />
            </Col>
          }
          {
            property(schema, 'types', []).length > 1 &&
            <Col md='auto'>
              <Form.Select value='object' onChange={evt => setType(evt.target.value)}>
                {
                  schema.others.types.map(type => (
                    <option key={type} value={type}>{TYPE_NAMES[type]}</option>
                  ))
                }
              </Form.Select>
            </Col>
          }
          {
            property(schema, 'label', null) !== null &&
            <Col>
              <label>
                {schema.label}
              </label>
            </Col>
          }
        </Row>
      </Card.Header>
      <Card.Body>
        <NewChildControls
          newChildInfo={newChildInfo}
          dispatchNewChildInfo={dispatchNewChildInfo}
          onSubmit={newChildSubmitted}
          isArray={false}
          schema={schema}
        />
        {
          EMPTY ?
          <em>...</em> :
          <Accordion alwaysOpen>
            {
              items(value).map(pair => (
                <ChildEditor
                  key={pair[0]}
                  childKey={pair[0]}
                  value={pair[1]}
                  schema={schema}
                  isArray={false}
                />
              ))
            }
          </Accordion>
        }
      </Card.Body>
    </Card>
  )
}
