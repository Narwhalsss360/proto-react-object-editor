import React, { useCallback, useReducer } from 'react'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import CloseButton from 'react-bootstrap/CloseButton'
import Accordion from 'react-bootstrap/Accordion'
import Form from 'react-bootstrap/Form'
import NewChildControls from './NewChildControls'
import ChildEditor from './ChildEditor'
import useOnFirstLoad from '../hooks/useOnFirstLoad'
import generalReducer from './generalReducer'
import { property, requireProperty } from './schemas'
import { isValidType, TYPE_GENERATORS } from './types'
import items, { keys } from './objectIterators'

export default function ObjectEditor({ value, schema }) {
  if (value === undefined || typeof value !== 'object' || Array.isArray(value)) {
    throw Error(`${ObjectEditor}: ${value} ${typeof value} is of an unsupported type.`)
  }

  const dispatcher = requireProperty(schema, 'dispatcher', 'scheme').dispatcher

  const PAIRS = items(value).filter(pair => !pair[0].match(/__hidden_[*+]__/))

  const EMPTY = keys(value).length === 0

  const DEFAULT_NEW_CHILD = property(property(schema, 'others'), 'types', []).length === 0 ? {
    type: undefined,
    key: '',
    value: undefined
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
      value: newChildInfo.type in TYPE_GENERATORS ? TYPE_GENERATORS[newChildInfo.type]() : ''
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

  const CAN_ADD_CHILD = property(property(schema, 'others'), 'types', []).length > 0

  const body = (
    <>
      {
        CAN_ADD_CHILD &&
        <>
          <NewChildControls
            newChildInfo={newChildInfo}
            dispatchNewChildInfo={dispatchNewChildInfo}
            onSubmit={newChildSubmitted}
            schema={schema}
            parent={value}
          />
          <hr />
        </>
      }
      {
        EMPTY ?
        <em>...</em> :
        <>
          <Accordion alwaysOpen>
            {
              PAIRS.map(pair => (
                <ChildEditor
                key={pair[0]}
                childKey={pair[0]}
                value={pair[1]}
                schema={schema}
                parent={value}
                />
              ))
            }
          </Accordion>
        </>
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
