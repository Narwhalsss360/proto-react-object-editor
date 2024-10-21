import React, { useCallback, useReducer } from 'react'
import SimpleEditor from './SimpleEditor'
import ComplexEditor from './ComplexEditor'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'
import items, { keys } from './objectIterators'
import { inputType, isSimple, isSimpleType, requireValidType, SIMPLE_TYPE_TO_NAME, TYPE_PARSERS, TYPE_TO_GENERATOR, TYPE_TO_NAME } from './types'
import generalReducer from './reducers'

export default function ObjectEditor({ value, dispatcher, deleter= null }) {
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

  const switchNewType = useCallback(evt => {
    disptachNewInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_TO_GENERATOR[evt.target.value]()
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'type',
      value: evt.target.value
    })
  }, [disptachNewInfo])

  const append = useCallback(evt => {
    evt.preventDefault()
    dispatcher({
      type: 'append-key',
      key: newInfo.key,
      value: newInfo.value
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_TO_GENERATOR[newInfo.type]()
    })
  }, [dispatcher, newInfo, disptachNewInfo])

  const newInfoValueChanged = useCallback(evt => {
    disptachNewInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_PARSERS[newInfo.type](evt.target.value)
    })
  }, [disptachNewInfo, newInfo])

  const objectControls = (
    <Form onSubmit={append}>
      <Row>
        {
          deleter !== null &&
          <Col md='auto'>
            <Button variant='outline-danger' onClick={deleter}>Delete</Button>
          </Col>
        }
        <Col>
          <Form.Select value={newInfo.type} onChange={switchNewType}>
            {
              items(TYPE_TO_NAME).map(pair => {
                const [type, typeName] = pair
                return <option key={type} value={type}>{typeName}</option>
              })
            }
          </Form.Select>
        </Col>
        <Col>
        <Form.Control
        value={newInfo.key}
        placeholder='Key'
        onChange={evt => disptachNewInfo({ type: 'set-key', key: 'key', value: evt.target.value })}
        />
        </Col>
        <Col>
          {
            newInfo.type === 'boolean' ?
            <input
              type={inputType(newInfo.type)}
              placeholder='TODO'
              value={newInfo.value}
              onChange={newInfoValueChanged}
            /> :
            <>
              {
                isSimpleType(newInfo.type) &&
                <Form.Control
                type={inputType(newInfo.type)}
                placeholder='Value'
                value={newInfo.value}
                onChange={newInfoValueChanged}
                />
              }
            </>
          }
        </Col>
        <Col md='auto'>
          <Button variant='outline-success' type='submit'>+</Button>
        </Col>
      </Row>
    </Form>
  )

  const generateChildEditor = useCallback(kvp => {
    const [key, value] = kvp
    let editor = null

    function innerDispatcher(action) {
      if (action.type !== 'set-as') {
        Error('Expected "set-as" action type')
      }
      dispatcher({ type: 'set-key', key, value: action.value })
    }

    if (isSimple(requireValidType(value))) {
      editor = <SimpleEditor
        value={value}
        dispatcher={innerDispatcher}
        label={key}
        deleter={() => dispatcher({ type: 'delete-key', key })}
        types={keys(SIMPLE_TYPE_TO_NAME)}
      />
    } else {
      editor = <ComplexEditor
        value={value}
        dispatcher={action => dispatcher({
          type: 'set-key',
          key,
          value: generalReducer(value, action)
        })}
        deleter={() => dispatcher({ type: 'delete-key', key })}
      />
    }

    return (
      <ListGroup.Item key={key}>
        <Badge style={{ margin: '5px' }}>{key}</Badge>
        <Form.Control />
        {editor}
      </ListGroup.Item>
    )
  }, [dispatcher])

  if (value === null) {
    return <em>null</em>
  }

  return (
    <Card body>
      {objectControls}
      {
        isEmpty() ?
        <em>{"{...}"}</em> :
        <ListGroup style={{ margin: '10px auto' }}>
          {items(value).map(generateChildEditor)}
        </ListGroup>
      }
      {objectControls}
    </Card>
  )
}
