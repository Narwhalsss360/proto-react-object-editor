import './App.css';
import { useReducer } from 'react';
import generalReducer from './editor/generalReducer';
import SimpleEditor from './editor/SimpleEditor';
import Button from 'react-bootstrap/Button'
import ObjectEditor from './editor/ObjectEditor';
import { SIMPLE_TYPES, TYPES } from './editor/types';

function createFreeGenerator(recursiveFree) {
  const scheme = {
    type: TYPES,
    others: { types: TYPES },
    canEditPosition: true,
    canEditKey: true 
  }

  const generator = (schema, childKey, child, parent) => scheme

  if (recursiveFree) {
    scheme.generator = generator
  }

  return generator
}

function App() {
  const [simple, dispatchSimple] = useReducer(generalReducer, '')
  const [justName, dispatchJustName] = useReducer(generalReducer, '')
  const [justAge, dispatchJustAge] = useReducer(generalReducer, 0)
  const [object, disptachObject] = useReducer(generalReducer, {})
  const [personalDetails, dispatchPersonalDetails] = useReducer(generalReducer, {
    first: '' //Can specify default here instead of schema
  })

  const BASIC_PERSONAL_DETAILS_CHILDREN_SCHEMA = {
    first: {
      label: 'First Name',
      default: '',
      required: true
    },
    last: {
      label: 'Last Name',
      default: '',
      required: true
    },
    age: {
      label: 'Age',
      default: 0,
      required: true
    }
  }

  const PERSONAL_DETAILS_SCHEMA = {
    label: "Personal Details",
    dispatcher: dispatchPersonalDetails,
    all: {
      types: [] //types of all children are restricted to no change
    },
    children: {
      ...BASIC_PERSONAL_DETAILS_CHILDREN_SCHEMA,
      friends: {
        label: 'Friends',
        default: [],
        required: true,
        others: {
          types: ['object'],
          children: BASIC_PERSONAL_DETAILS_CHILDREN_SCHEMA
        }
      },
      extra: {
        label: 'Extra',
        default: {},
        required: true,
        others: {
          types: ['string']
        }
      }
    }
  }

  return (
    <div className="App">
      {
        true &&
        <div>
          <SimpleEditor
            value={simple}
            scheme={{
              label: 'Simple',
              types: SIMPLE_TYPES,
              dispatcher: dispatchSimple
            }}
          />
          <hr />
        </div>
      }
      {
        true &&
        <div>
          <SimpleEditor
            value={justName}
            scheme={{
              label: 'Name',
              types: ['string'],
              dispatcher: dispatchJustName,
              headerGenerator: null,
              validator: name => {
                if (name.length > 32) {
                  return name.slice(0, 32)
                }
                return null
              }
            }}
          />
          <hr />
        </div>
      }
      {
        true &&
        <div>
          <SimpleEditor
            value={justAge}
            scheme={{
              label: 'Age',
              types: ['number'],
              dispatcher: dispatchJustAge,
              headerGenerator: (value, scheme) => <h3>Age</h3>,
              validator: age => {
                if (age === '') {
                  return 0
                }
                if (age < 0) {
                  return 0
                }
                if (age > 100) {
                  return 100
                }
                return null;
              }
            }}
          />
        <hr />
        </div>
      }
      {
        true &&
        <div>
          <ObjectEditor
            value={object}
            schema={{
              label: 'Object',
              TYPES: TYPES,
              dispatcher: disptachObject,
              others: { types: TYPES },
              generator: createFreeGenerator(true)
            }}
          />
          <hr />
        </div>
      }
      {
        true &&
        <div>
          <ObjectEditor
            value={personalDetails}
            schema={PERSONAL_DETAILS_SCHEMA}
          />
          <Button onClick={() => console.log(personalDetails)}>Print Personal Details To Console</Button>
          <hr />
        </div>
      }
    </div>
  );
}

export default App;
