import React, { useCallback, useEffect } from 'react'
import { isSimple, requireValidType, TYPE_PARSERS, TYPE_GENERATORS, isValidType, TYPE_NAMES, inputType, isSimpleType } from './types'
import useOnFirstLoad from '../hooks/useOnFirstLoad'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import CloseButton from 'react-bootstrap/CloseButton'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

export default function SimpleEditor({
  value,
  dispatcher,
  deleter = null,
  scheme = null,
  style = {},
  rowStyle = {},
  colStyle = {}
}) {
  if (!isSimple(requireValidType(value))) {
    throw Error(`Type ${typeof value} is an unsupported type of ${SimpleEditor}`)
  }

  const setType = useCallback(type => {
    dispatcher({
      type: 'set-as',
      value: TYPE_GENERATORS[type]()
    })
  }, [dispatcher])

  const set = useCallback(as => {
    const parsed = TYPE_PARSERS[typeof value](as)
    const validated = scheme?.validator?.(parsed) ??parsed 
    dispatcher({
      type: 'set-as',
      value: validated
    })
  }, [value, scheme, dispatcher])

  const validateTypes = useCallback(() => {
    if (scheme === null || !('types' in scheme)) {
      return
    }
    scheme.types.forEach(type => {
      if ((!isValidType(type) || !isSimpleType(type)) && (!('__OVERIDE_TYPES__' in scheme))) {
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

  const generateInput = useCallback(() => {
    if (typeof value !== 'boolean') {
      return <Form.Control
        type={inputType(typeof value)}
        value={value}
        placeholder={scheme?.label ?? ''}
        onChange={evt => set(evt.target.value)}
      />
    }

    const DEFAULT_CHECK = scheme === null || !('enableLabel' in scheme)

    if (DEFAULT_CHECK) {
      return <Form.Check
        type='checkbox'
        checked={value}
        onChange={evt => set(evt.target.checked)}
        label={scheme?.label ?? ''}
      />
    }

    if (!('disableLabel' in scheme)) {
      return <ToggleButton
        id='toggle-check'
        type='checkbox'
        checked={value}
        variant={value ? 'success' : 'outline-danger'}
        onChange={evt => set(evt.target.checked)}
      >
        {scheme.enableLabel}
      </ToggleButton>
    }

    return (
      <ButtonGroup>
        <ToggleButton
          id='toggle-check'
          type='checkbox'
          checked={value}
          variant={value ? 'success' : 'outline-secondary'}
          onChange={evt => set(evt.target.checked)}
        >
          {scheme.enableLabel}
        </ToggleButton>
        <ToggleButton
          id='toggle-check'
          type='checkbox'
          checked={!value}
          variant={!value ? 'success' : 'outline-secondary'}
          onChange={evt => set(evt.target.checked)}
        >
          {scheme.disableLabel}
        </ToggleButton>
      </ButtonGroup>
    )
  }, [value, scheme, set])

  useEffect(validateTypes, [validateTypes])

  useOnFirstLoad(setDefault, [setDefault])

  return (
    <Card style={style}>
      {
        scheme !== null&& 'label' in scheme &&
        <Card.Header>{scheme.label}</Card.Header>
      }
      <Card.Body>
        <Form onSubmit={evt => evt.preventDefault() }>
          <Row style={rowStyle}>
            {
              deleter !== null &&
              <Col style={colStyle} md='auto'>
                <CloseButton onClick={deleter} style={{ margin: '25%' }} />
              </Col>
            }

            <Col style={colStyle} md='auto'>
            {
              scheme === null || !('types' in scheme) || scheme.types.length === 1 ?
              <Badge style={{ margin: '25% auto' }}>{TYPE_NAMES[typeof value]}</Badge> :
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
              {generateInput()}
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  )
}
