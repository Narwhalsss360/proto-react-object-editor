import React, { useCallback } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import BooleanControl from './BooleanControl'
import { inputType, isSimple, TYPE_GENERATORS, TYPE_NAMES, TYPE_PARSERS, TYPES } from './types'
import { keys } from './objectIterators'
import { property } from './schemas'

export default function NewChildControls({ newChildInfo, dispatchNewChildInfo, onSubmit, schema, parent }) {
  const parentType = Array.isArray(parent) ? 'array' : 'object'

  const setType = useCallback(type => {
    const generatedType = (
      type in TYPE_GENERATORS ?
      TYPE_GENERATORS[type] :
      type in property(schema, 'templates') && property(schema.templates[type], 'generate') !== null ?
      schema.templates[type].generator :
      () => { throw Error(`Template ${type}: ${schema.templates[type]} does not have a generator`) }
    )()
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'value',
      value: generatedType
    })
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'type',
      value: type
    })
  }, [dispatchNewChildInfo, schema])

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
      key: parentType === 'object' ? 'key' : 'position',
      value: ''
    })
  }, [onSubmit, dispatchNewChildInfo, newChildInfo, parentType])

  const templateTypeCombo = property(property(schema, 'others'), 'types', [])
  .concat(keys(property(schema, 'templates', {})).filter(template => !TYPES.includes(template)))

  return (
    <Form onSubmit={submit}>
      <Row>
        <Col md='auto' style={{margin: 'auto'}}>
        {
          templateTypeCombo.length === 1 ?
          <Badge>{templateTypeCombo[0] in TYPE_NAMES ? TYPE_NAMES[templateTypeCombo[0]] : templateTypeCombo[0]}</Badge> :
          <Form.Select value={newChildInfo.type} onChange={evt => setType(evt.target.value)}>
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
        }
        </Col>
        <Col>
          <Form.Control
            type={parentType === 'object' ? 'text' : 'number'}
            value={newChildInfo[parentType === 'object' ? 'key' : 'position']}
            placeholder={parentType === 'object' ? 'Key' : 'Position'}
            onChange={evt =>
              parentType === 'object' ?
              dispatchNewChildInfo({
                type: 'set-key',
                key: 'key',
                value: evt.target.value
              }) :
              dispatchNewChildInfo({
                type: 'set-key',
                key: 'position',
                value: 0 <= evt.target.value && evt.target.value <= parent.length ? Number(evt.target.value) : ''
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
                disableLabel: 'False'
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
        <Col md='auto'>
          <Button variant='outline-success' type='submit'>+</Button>
        </Col>
      </Row>
    </Form>
  )
}
