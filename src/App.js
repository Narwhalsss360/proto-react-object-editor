import './App.css';
import React, { useReducer } from 'react';
import generalReducer from './editor/reducers';
import SimpleEditor from './editor/SimpleEditor';
import { keys } from './editor/objectIterators';
import { SIMPLE_TYPE_NAME } from './editor/types';
import ObjectEditor from './editor/ObjectEditor';

function validateName(name) {
  if (name.length > 32) {
    return name.slice(0, 32)
  }
  return null
}

function validateStudent(student) {
  return null
}

function validateGrade(grade) {
  const VALID_GRADES = [
    'A',
    'B',
    'C',
    'D',
    'F',
  ]

  if (grade === '') {
    return 'A'
  }

  if (grade.length !== 1) {
    const last = grade.slice(grade.length - 1)
    if (VALID_GRADES.includes(last)) {
      return last
    }
  }

  if (VALID_GRADES.includes(grade)) {
    return null
  }

  return 'A'
}

const STUDENT_SCHEMA = {
  label: 'Student',
  other: { types: [] },
  children: {
    'first': { label: 'First Name', types: ['string'], required: true, validator: validateName },
    'last': { label: 'Last Name', types: ['string'], required: true, validator: validateName },
    'grades': {
      label: 'Class Grades',
      types: ['object'],
      other: { types: ['string'], validator: validateGrade }
    }
  },
  strict: true,
  validator: validateStudent
}

function App() {
  const [simple, dispatchSimple] = useReducer(generalReducer, '')
  const [object, dispatchObject] = useReducer(generalReducer, {})
  const [student, dispatchStudent] = useReducer(generalReducer, {})

  return (
    <div className="App">
      {
        false &&
        <SimpleEditor
        value={simple}
        dispatcher={dispatchSimple}
        deleter={() => alert("Actually... You're not deleting.")}
        scheme={{
          label: 'Simple Entry',
          types: true ? ['string'] : keys(SIMPLE_TYPE_NAME),
          default: 'Simple!',
          validator: str => {
            if (typeof str === 'string' && str.length >= 20) {
              alert('Max length 20')
              return str.slice(0, 20)
            }
            return null
          },
          enableLabel: 'Enable',
          disableLabel: 'Disable'
        }}
        />
      }
      <hr style={{ margin: '10px' }} />
      {
        false &&
        <React.Fragment
        value={object}
        dispatcher={dispatchObject}
        deleter={() => alert("This object CANNOT be deleted!")}
        schema={{
          label: 'Object'
        }}
        />
      }
      <hr />
      {
        true &&
        <ObjectEditor
        value={student}
        dispatcher={dispatchStudent}
        schema={STUDENT_SCHEMA}
        />
      }
    </div>
  );
}

export default App;
