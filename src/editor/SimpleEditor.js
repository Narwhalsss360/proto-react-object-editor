import React, { useCallback, useEffect } from 'react'
import useOnFirstLoad from '../hooks/useOnFirstLoad'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import CloseButton from 'react-bootstrap/CloseButton'
import Badge from 'react-bootstrap/Badge'
import BooleanControl from './BooleanControl'
import { isSimple, requireValidType, TYPE_GENERATORS, TYPE_PARSERS, isValidType, isSimpleType, TYPE_NAMES, inputType } from './types'
import { property, requireProperty } from './schemas'

export default function SimpleEditor({ value, scheme }) {
  if (!isSimple(requireValidType(value))) {
    throw Error(`${SimpleEditor}: The type ${typeof value} is unsupported.`)
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
      if ((!isValidType(type) || !isSimpleType(type))) {
        throw Error(`Type ${type} from the 'types' is invalid.`)
      }
    })
  }, [scheme])

  const setDefault = useCallback(() => {
    if (scheme === null || !('default' in scheme)) {
      return
    }
    setType(typeof scheme.default)
    set(scheme.default)
  }, [scheme, setType, set])

  useOnFirstLoad(setDefault)

  useEffect(validateTypes, [validateTypes])

  return (
    <Card>
      {
        property(scheme, 'label') !== undefined &&
        <Card.Header>
          <label>
            {scheme.label}
          </label>
        </Card.Header>
      }
      <Card.Body>
        <Form onSubmit={evt => evt.preventDefault()}>
          <Row>
            {
              property(scheme, 'deleter', null) !== null &&
              <Col md='auto'>
                <CloseButton onClick={scheme.deleter} />
              </Col>
            }
            <Col>
              {
                (property(scheme, 'types', []).length) <= 1 ?
                <Badge>{TYPE_NAMES[typeof value]}</Badge> :
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
      </Card.Body>
    </Card>
  )
}
