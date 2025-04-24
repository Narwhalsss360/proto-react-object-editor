import './App.css';
import { useReducer } from 'react';
import generalReducer from './editor/generalReducer';
import SimpleEditor from './editor/SimpleEditor';
import ObjectEditor from './editor/ObjectEditor';
import { isSimple, SIMPLE_TYPES, TYPES } from './editor/types';

function freeGenerator(schema, childKey, chid, parent) {
  return {
    types: TYPES,
    others: { types: TYPES }
  }
}

function App() {
  const [simple, dispatchSimple] = useReducer(generalReducer, '')
  const [justName, dispatchJustName] = useReducer(generalReducer, '')
  const [justAge, dispatchJustAge] = useReducer(generalReducer, 0)
  const [object, disptachObject] = useReducer(generalReducer, {})

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
              generator: (schema, childKey, child, parent) => ({ ...freeGenerator(), generator: freeGenerator })
            }}
          />
          <hr />
        </div>
      }
    </div>
  );
}

export default App;
