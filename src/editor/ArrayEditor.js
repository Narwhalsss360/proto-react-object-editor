import React, { useReducer, useCallback } from 'react'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import CloseButton from 'react-bootstrap/CloseButton'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import NewChildControls from './NewChildControls'
import ChildEditor from './ChildEditor'
import generalReducer from './reducers'
import { property, requireProperty } from './schemas'
import { TYPE_GENERATORS, TYPE_NAMES } from './types'

export default function ArrayEditor({ value, schema }) {
  if (!Array.isArray(value)) {
    throw Error(`${ArrayEditor}: Only arrays are supported.`)
  }

  const dispatcher = requireProperty(schema, 'dispatcher', 'scheme').dispatcher

  const EMPTY = value.length === 0

  const DEFAULT_NEW_CHILD = property(property(schema, 'others'), 'types', []).length === 0 ? {
    type: '',
    position: '',
    value: ''
  } : {
    type: schema.others.types[0],
    position: '',
    value: TYPE_GENERATORS[schema.others.types[0]]()
  }

  const [newChildInfo, dispatchNewChildInfo] = useReducer(generalReducer, DEFAULT_NEW_CHILD)

  const newChildSubmitted = useCallback(() => {
    dispatcher({
      type: newChildInfo.position === '' ? 'append-element' : 'insert-element',
      index: newChildInfo.position - 1,
      value: newChildInfo.value
    })
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_GENERATORS[newChildInfo.type]()
    })
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'position',
      value: ''
    })
  }, [dispatcher, dispatchNewChildInfo, newChildInfo])

  const setType = useCallback(type => {
    dispatcher({
      type: 'set-as',
      value: TYPE_GENERATORS[type]()
    })
  }, [dispatcher])

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
              <Form.Select value='array' onChange={evt => setType(evt.target.value)}>
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
          isArray={true}
          schema={schema}
        />
        {
          EMPTY ?
          <em>...</em> :
          <ListGroup as='ol'>
            {
              value.map((item, index) => (
                <ChildEditor
                  key={index}
                  childKey={index}
                  value={item}
                  schema={schema}
                  isArray={true}
                />
              ))
            }
          </ListGroup>
        }
      </Card.Body>
    </Card>
  )
}
