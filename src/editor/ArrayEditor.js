import React, { useCallback, useReducer } from 'react'
import SimpleEditor from './SimpleEditor'
import ComplexEditor from './ComplexEditor'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import { isSimple, isSimpleType, requireValidType } from './types'
import generalReducer from './reducers'
import items, { keys } from './objectIterators'
import { TYPE_TO_GENERATOR, TYPE_PARSERS, TYPE_TO_NAME, SIMPLE_TYPE_TO_NAME, inputType } from './types'
import { Badge } from 'react-bootstrap'

export default function ArrayEditor({ value, dispatcher, deleter=null }) {
  if (isSimple(requireValidType(value))) {
    throw Error(`Type ${typeof value} is unsupported by ${ArrayEditor}`)
  } else if (!Array.isArray(value)) {
    throw Error(`Objects are unsupported by ${ArrayEditor}`)
  }

  const isEmpty = useCallback(() => value.length === 0, [value])

  const [newInfo, disptachNewInfo] = useReducer(generalReducer, {
    type: 'string',
    index: '',
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

  const add = useCallback(evt => {
    evt.preventDefault()
    dispatcher({
      type: newInfo.index === '' ? 'append-element' : 'insert-element',
      value: newInfo.value,
      index: newInfo.index
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_TO_GENERATOR[newInfo.type]()
    })
    disptachNewInfo({
      type: 'set-key',
      key: 'index',
      value: ''
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
    <Form onSubmit={add}>
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
          type='number'
          value={newInfo.key}
          placeholder='Index'
          onChange={evt => disptachNewInfo({ type: 'set-key', key: 'index', value: evt.target.value })}
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

  const generateChildEditor = useCallback((element, index) => {
    let editor = null

    function innerDispatcher(action) {
      if (action.type !== 'set-as') {
        throw Error('Expected "set-as" action type')
      }
      dispatcher({ type: 'set-element', index, value: action.value })
    }

    if (isSimple(requireValidType(element))) {
      editor = <SimpleEditor
        value={element}
        dispatcher={innerDispatcher}
        deleter={() => dispatcher({ type: 'delete-element', index })}
        types={keys(SIMPLE_TYPE_TO_NAME)}
      />
    } else {
      editor = <ComplexEditor
        value={element}
        dispatcher={action => dispatcher({
          type: 'set-element',
          index,
          value: generalReducer(element, action)
        })}
        deleter={() => dispatcher({ type: 'delete-element', index })}
      />
    }

    return (
      <ListGroup.Item as='li' key={index}>
        <Badge style={{ margin: '5px' }}>Index {index}</Badge>
        {editor}
      </ListGroup.Item>
    )
  }, [dispatcher])

  return (
    <Card body>
      {objectControls}
      {
        isEmpty() ?
        <em>[...]</em> :
        <ListGroup as='ol' numbered style={{ margin: '10px auto' }}>
          {value.map(generateChildEditor)}
        </ListGroup>
      }
      {objectControls}
    </Card>
  )
}
