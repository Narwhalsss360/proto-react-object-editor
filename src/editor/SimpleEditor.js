import React, { useCallback, useEffect } from 'react'
import useOnFirstLoad from '../hooks/useOnFirstLoad'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import CloseButton from 'react-bootstrap/CloseButton'
import Badge from 'react-bootstrap/Badge'
import BooleanControl from './BooleanControl'
import { property, requireProperty } from './schemas'
import { inputType, isSimple, isSimpleType, isValidType, TYPE_GENERATORS, TYPE_NAMES, TYPE_PARSERS } from './types'

export default function SimpleEditor({ value, scheme }) {
  if (value === undefined || !isSimple(value)) {
    throw Error(`${SimpleEditor}: ${value} ${typeof value} is of an unsupported type.`)
  }

  const dispatcher = requireProperty(scheme, 'dispatcher', 'scheme').dispatcher

  const setType = useCallback(type => {
    dispatcher({
      type: 'set-as',
      value: TYPE_GENERATORS[type]()
    })
  }, [dispatcher])

  const set = useCallback(as => {
    const parsed = TYPE_PARSERS[typeof value](as)
    const validated = property(scheme, 'validator', value => null)(parsed) ?? parsed
    dispatcher({
      type: 'set-as',
      value: validated
    })
  }, [value, scheme, dispatcher])

  const validateTypes = useCallback(() => {
    if (property(scheme, '__OVERRIDE_TYPES__', false)) {
      return
    }

    property(scheme, 'types', []).forEach(type => {
      if (!isValidType(type) || !isSimpleType(type)) {
        throw Error(`${SimpleEditor}.${validateTypes}: ${type} is an invalid type.`)
      }
    })
  }, [scheme])

  const setAsDefault = useCallback(() => {
    const defaultValue = property(scheme, 'default', undefined)
    if (defaultValue === undefined) {
      return
    }
    setType(typeof defaultValue)
    set(defaultValue)
  }, [scheme, setType, set])

  useOnFirstLoad(setAsDefault)

  useEffect(validateTypes, [validateTypes])

  const EMPTY_HEADER = property(scheme, 'label', null) === null && property(scheme, 'deleter', null) === null

  const headerGenerator = property(scheme, 'headerGenerator', (value, scheme) => (
    EMPTY_HEADER ?
    <>
    </> :
    <Row>
      {
        property(scheme, 'deleter', null) !== null &&
        <Col md='auto'>
          <CloseButton onClick={scheme.deleter} />
        </Col>
      }
      {
        property(scheme, 'label', null) !== null &&
        <Col>
          <label>{scheme.label}</label>
        </Col>
      }
    </Row>
  ))

  const body = (
    <Form onSubmit={evt => evt.preventDefault()}>
      <Row>
        <Col md='auto'>
          {
            property(scheme, 'types', []).length <= 1 ?
            <Badge>{typeof value}</Badge> :
            <Form.Select value={typeof value} onChange={evt => setType(evt.target.value)}>
              {
                scheme.types.map(type => (
                  <option key={type} value={type}>{TYPE_NAMES[type]}</option>
                ))
              }
            </Form.Select>
          }
        </Col>
        <Col>
          {
            typeof value === 'boolean' ?
            <BooleanControl value={value} set={set} scheme={scheme} /> :
            <Form.Control
              type={inputType(typeof value)}
              value={value}
              placeholder={property(scheme, 'label', '')}
              onChange={evt => set(evt.target.value)}
            />
          }
        </Col>
      </Row>
    </Form>
  )

  if (headerGenerator === null) {
    return (
      <Card body>
        {body}
      </Card>
    )
  }

  return (
    <Card>
      <Card.Header>
        {headerGenerator(value, scheme)}
      </Card.Header>
      <Card.Body>
        {body}
      </Card.Body>
    </Card>
  )
}
