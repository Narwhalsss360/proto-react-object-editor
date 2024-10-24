import React, { useCallback, useReducer } from 'react'
import Card from 'react-bootstrap/Card'
import Accordion from 'react-bootstrap/Accordion'
import NewChildControls from './NewChildControls'
import generalReducer from './reducers'
import { property, requireProperty } from './schemas'
import { isValidType, TYPE_GENERATORS } from './types'
import items, { keys } from './objectIterators'
import useOnFirstLoad from '../hooks/useOnFirstLoad'
import ChildEditor from './ChildEditor'

export default function ObjectEditor({ value, schema }) {
  if (value === undefined || value === null || typeof value !== 'object') {
    throw Error(`${ObjectEditor}: Only type of 'object' is supported.`)
  }

  const dispatcher = requireProperty(schema, 'dispatcher', 'scheme').dispatcher

  const EMPTY = keys(value).length === 0

  const [newChildInfo, dispatchNewChildInfo] = useReducer(generalReducer, {
    type: 'string',
    key: '',
    value: ''
  })

  const newChildSubmitted = useCallback(() => {
    dispatcher({
      type: 'append-key',
      key: newChildInfo.key,
      value: newChildInfo.value
    })
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'value',
      value: TYPE_GENERATORS[newChildInfo.type]()
    })
    dispatchNewChildInfo({
      type: 'set-key',
      key: 'key',
      value: ''
    })
  }, [dispatcher, dispatchNewChildInfo, newChildInfo])

  const ensureRequired = useCallback(() => {
    if (schema === null || !('children' in schema)) {
      return
    }

    items(schema.children).forEach(pair => {
      const [key, scheme] = pair

      if (property(scheme, 'required', false) && key in value) {
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

      dispatcher({
        type: 'append-key',
        key,
        value: child
      })
    })
  }, [schema, dispatcher, value])

  useOnFirstLoad(ensureRequired)

  return (
    <Card>
      <Card.Body>
        <NewChildControls
          newChildInfo={newChildInfo}
          dispatchNewChildInfo={dispatchNewChildInfo}
          onSubmit={newChildSubmitted}
          isArray={false}
          schema={schema}
        />
        {
          EMPTY ?
          <em>...</em> :
          <Accordion alwaysOpen>
            {
              items(value).map(pair => (
                <ChildEditor
                  key={pair[0]}
                  childKey={pair[0]}
                  value={pair[1]}
                  schema={schema}
                  isArray={false}
                />
              ))
            }
          </Accordion>
        }
      </Card.Body>
    </Card>
  )
}
