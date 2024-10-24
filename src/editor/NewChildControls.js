import React, { useCallback } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import BooleanControl from './BooleanControl'
import { inputType, isSimple, TYPE_GENERATORS, TYPE_NAMES, TYPE_PARSERS } from './types'
import { property } from './schemas'

export default function NewChildControls({ newChildInfo, dispatchNewChildInfo, onSubmit, isArray, schema }) {
  const newTypeChanged = useCallback(newType => {
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_GENERATORS[newType]()
    })
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'type',
      value: newType
    })
  }, [dispatchNewChildInfo])

  const submit = useCallback(evt => {
    evt.preventDefault()
    onSubmit()
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_GENERATORS[newChildInfo.type]()
    })
    dispatchNewChildInfo({
      type: 'set-key',
      key: isArray ? 'position' : 'key',
      value: ''
    })
  }, [onSubmit, dispatchNewChildInfo, newChildInfo, isArray])

  if (property(property(schema, 'others', {}), 'types', []).length <= 0) {
    return <></>
  }

  return (
    <Form onSubmit={submit}>
      <Row>
        <Col>
          <Form.Select value={newChildInfo.type} onChange={evt => newTypeChanged(evt.target.value)}>
            {
              schema.others.types.map(type => (
                <option key={type} value={type}>{TYPE_NAMES[type]}</option>
              ))
            }
          </Form.Select>
        </Col>
        <Col md='auto'>
          <Form.Control
            value={isArray ? newChildInfo.index + 1 : newChildInfo.key}
            placeholder={isArray ? 'Position' : 'Key'}
            onChange={evt =>
              isArray ?
              dispatchNewChildInfo({
                type: 'set-key',
                key: 'position',
                value: Number(evt.target.value)
              }) :
              dispatchNewChildInfo({
                type: 'set-key',
                key: 'key',
                value: evt.target.value
              })
            }
          />
        </Col>
        <Col>
          {
            newChildInfo.type === 'boolean' ?
            <BooleanControl
              value={newChildInfo.value}
              set={value => dispatchNewChildInfo({
                type: 'set-key',
                key: 'value',
                value
              })}
              scheme={{
                enableLabel: 'True',
                disableLabel: 'False',
              }}
            /> :
            isSimple(newChildInfo.value) ?
            <Form.Control
              type={inputType(newChildInfo.type)}
              placeholder='Value'
              value={newChildInfo.value}
              onChange={evt => dispatchNewChildInfo({
                type: 'set-key',
                key: 'value',
                value: TYPE_PARSERS[newChildInfo.type](evt.target.value)
              })}
            /> :
            <em>...</em>
          }
        </Col>
        <Col>
          <Button variant='outline-success' type='submit'>+</Button>
        </Col>
      </Row>
    </Form>
  )
}
