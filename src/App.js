import './App.css';
import { useReducer } from 'react';
import SimpleEditor from './editor/SimpleEditor'
import ObjectEditor from './editor/ObjectEditor';
import ArrayEditor from './editor/ArrayEditor';
import generalReducer from './editor/reducers'
import { SIMPLE_TYPES, TYPES } from './editor/types';
import { defaultGenerator } from './editor/schemas';

function validateName(name) {
  if (name.length > 32) {
    return name.slice(0, name.length - 1)
  }
  return null
}

function validateGrade(grade) {
  const GRADES = [
    'A',
    'B',
    'C',
    'D',
    'F'
  ]

  if (grade === '') {
    return 'A'
  } else if (grade.length > 1) {
    const newGrade = grade[grade.length - 1]
    if (GRADES.includes(newGrade)) {
      return newGrade
    } else {
      return grade[grade.length - 2]
    }
  } else if (GRADES.includes(grade)) {
    return null
  } else {
    return 'A'
  }
}

function App() {
  const [simple, dispatchSimple] = useReducer(generalReducer, '')
  const [object, dispatchObject] = useReducer(generalReducer, {})
  const [student, dispatchStudent] = useReducer(generalReducer, {})
  const [array, dispatchArray] = useReducer(generalReducer, [])
  const [students, dispatchStudents] = useReducer(generalReducer, [])

  return (
    <div className="App">
      {
        false &&
        <SimpleEditor
          value={simple}
          scheme={{
            label: 'Simple',
            types: SIMPLE_TYPES,
            dispatcher: dispatchSimple,
          }}
        />
      }
      <hr />
      {
        false &&
        <ObjectEditor
          value={object}
          schema={{
            label: 'Object',
            dispatcher: dispatchObject,
            others: {
              types: TYPES
            },
            generator: defaultGenerator
          }}
        />
      }
      <hr />
      {
        false &&
        <ObjectEditor
          value={student}
          schema={{
            label: 'Student',
            dispatcher: dispatchStudent,
            children: {
              first: { label: 'First Name', required: true, default: '', validator: validateName },
              last: { label: 'Last Name', required: true, default: '', validator: validateName },
              grades: {
                label: 'Grades',
                required: true,
                others: {
                  types: ['string'],
                  validator: validateGrade
                },
                default: { 'Example Class Name': 'A' }
              }
            }
          }}
        />
      }
      <hr />
      {
        false &&
        <ArrayEditor
          value={array}
          schema={{
            label: 'Array',
            others: { types: TYPES },
            dispatcher: dispatchArray,
            generator: defaultGenerator
          }}
        />
      }
      <hr />
      {
        true &&
        <ArrayEditor
          value={students}
          schema={{
            label: 'Students',
            others: {
              types: ['object'],
              children: {
                first: { label: 'First Name', required: true, default: '', validator: validateName },
                last: { label: 'Last Name', required: true, default: '', validator: validateName },
                grades: {
                  label: 'Grades',
                  required: true,
                  others: {
                    types: ['string'],
                    validator: validateGrade
                  },
                  default: { 'Example Class Name': 'A' }
                }
              }
            },
            dispatcher: dispatchStudents,
          }}
        />
      }
    </div>
  );
}

export default App;
