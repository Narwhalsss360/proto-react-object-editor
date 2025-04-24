import React from 'react'
import Form from 'react-bootstrap/Form'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import { property } from './schemas'

export default function BooleanControl({ value, set, scheme }) {
  if (scheme !== undefined && scheme !== null && 'enableLabel' in scheme) {
    if ('disableLabel' in scheme) {
      return (
        <ButtonGroup>
          <ToggleButton
            id='toggle-check'
            type='checkbox'
            checked={value}
            onChange={evt => set(evt.target.checked)}
            variant={value ? 'success' : 'outline-danger'}
          >
            {scheme.enableLabel}
          </ToggleButton>
          <ToggleButton
            id='toggle-check'
            type='checkbox'
            checked={!value}
            onChange={evt => set(evt.target.checked)}
            variant={!value ? 'success' : 'outline-danger'}
          >
            {scheme.disableLabel}
          </ToggleButton>
        </ButtonGroup>
      )
    } else {
      return (
        <ToggleButton
          id='toggle-check'
          type='checkbox'
          checked={value}
          onChange={evt => set(evt.target.checked)}
          variant={value ? 'success' : 'outline-danger'}
        >
          {scheme.enableLabel}
        </ToggleButton>
      )
    }
  } else {
    return (
      <Form.Check
        label={property(scheme, 'label', '')}
        type='checkbox'
        checked={value}
        onChange={evt => set(evt.target.checked)}
      />
    )
  }
}
