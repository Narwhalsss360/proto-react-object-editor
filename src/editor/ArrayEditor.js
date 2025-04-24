import React, { useCallback, useReducer } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import CloseButton from 'react-bootstrap/CloseButton'
import Card from 'react-bootstrap/Card'
import NewChildControls from './NewChildControls'
import ChildEditor from './ChildEditor'
import ListGroup from 'react-bootstrap/ListGroup'
import generalReducer from './generalReducer'
import { requireProperty, property } from './schemas'
import { TYPE_GENERATORS } from './types'

export default function ArrayEditor({ value, schema }) {
  if (!Array.isArray(value)) {
    throw Error(`${ArrayEditor}: ${value} ${typeof value} is of an unsupported type.`)
  }

  const dispatcher = requireProperty(schema, 'dispatcher').dispatcher

  const EMPTY = value.length === 0

  const DEFAULT_NEW_CHILD = property(property(schema, 'others'), 'types', []).length === 0 ? {
    type: undefined,
    position: '',
    value: undefined
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
      value: newChildInfo.type in TYPE_GENERATORS ? TYPE_GENERATORS[newChildInfo.type]() : ''
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

  const headerGenerator = property(schema, 'headerGenerator', (value, schema) => (
    property(schema, 'label') === undefined && property(schema, 'deleter', null) !== null ?
    <></> :
    <>
      <Row>
        {
          property(schema, 'deleter', null) !== null &&
          <Col md='auto'>
            <CloseButton onClick={schema.deleter} />
          </Col>
        }
        {
          property(schema, 'label') !== undefined &&
          <Col>
          <label>{schema.label}</label>
          </Col>
        }
      </Row>
    </>
  ))

  const body = (
    <>
    {
      property(property(schema, 'others'), 'types', []).length > 0 &&
      <>
        <NewChildControls
          newChildInfo={newChildInfo}
          dispatchNewChildInfo={dispatchNewChildInfo}
          onSubmit={newChildSubmitted}
          schema={schema}
          parentType='array'
        />
        <hr />
      </>
    }
    {
      EMPTY ?
      <em>...</em> :
      <ListGroup>
        {
          value.map((item, index) => (
            <ChildEditor
            key={index}
            childKey={index}
            value={item}
            schema={schema}
              parent={value}
              />
          ))
        }
      </ListGroup>
    }
    </>
  )

  if (headerGenerator !== null) {
    return (
      <Card>
        <Card.Header>
          {headerGenerator(value, schema)}
        </Card.Header>
        <Card.Body>
          {body}
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card body>
      {body}
    </Card>
  )
}
