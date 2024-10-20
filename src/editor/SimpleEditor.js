import React, { useCallback, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import { inputType, isSimple, isValidType, requireValidType, TYPE_PARSERS, TYPE_TO_GENERATOR, TYPE_TO_NAME } from './types'

export default function SimpleEditor({ value, dispatcher, label=null, deleter=null, types=null, style={}, overrideSimpleTypes = false }) {
  if (!isSimple(requireValidType(value))) {
    throw Error(`${SimpleEditor} 'value' must be a "simple" type.`)
  }

  const set = useCallback(as => {
    dispatcher({
      type: 'set-as',
      value: TYPE_PARSERS[typeof value](as)
    })
  }, [dispatcher, value])

  const validateTypes = useCallback(() => {
    if (types === null) {
      return
    }
    types.forEach(type => {
      if (!isSimple(isValidType(type)) && !overrideSimpleTypes) {
        throw Error(`Type ${type} from the 'types' list is invalid.`)
      }
    })
  }, [types, overrideSimpleTypes])

  const typeSelect = useCallback(evt => {
    dispatcher({
      type: 'set-as',
      value: TYPE_TO_GENERATOR[evt.target.value]()
    })
  }, [dispatcher])

  useEffect(() => {
    if (deleter === null && value === null) {
      set('')
    }
  }, [deleter, value, set])

  useEffect(validateTypes, [validateTypes])

  return (
    <Card body>
      <Form style={style} onSubmit={evt => evt.preventDefault() }>
        <Row>
          {
            deleter !== null &&
            <Col md='auto'>
              <Button variant='outline-danger' onClick={deleter}>Delete</Button>
            </Col>
          }

          <Col>
            {
              types !== null &&
              <Form.Select value={typeof value} onChange={typeSelect}>
                {
                  types.map(type => (
                    <option key={type} value={type}>{TYPE_TO_NAME[type]}</option>
                  ))
                }
              </Form.Select>
            }
          </Col>

          <Col>
            {
              typeof value === 'boolean' ?
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
              }}>
                {
                  label !== null &&
                  <label>{label} </label>
                }
                <input
                type='checkbox'
                style={{ margin: '15px 10px 10px 10px' }}
                checked={value}
                onChange={evt => set(evt.target.checked)}
                />
              </div> :
              <input
              type={inputType(typeof value)}
              value={value}
              placeholder={label ?? ''}
              onChange={evt => set(evt.target.value)}
              style={{
                width: '100%',
                height: '100%',
                margin: 'auto 5px',
                borderRadius: '5px',
                borderWidth: '1px'
              }}
              />
            }
          </Col>
        </Row>
      </Form>
    </Card>
  )
}
