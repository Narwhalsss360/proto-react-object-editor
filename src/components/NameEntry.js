import React from 'react'
import ValueEntry from '../editor/ValueEntry'

export default function NameEntry({ first, last, onChange }) {
  return (
    <div>
      <ValueEntry value={first} restrictions={['string']} placeholder='First Name' onChange={value => onChange({ value: value, isFirst: true })} />
      <ValueEntry value={last} restrictions={['string']} placeholder='Last Name' onChange={value => onChange({ value: value, isFirst: false })} />
    </div>
  )
}
