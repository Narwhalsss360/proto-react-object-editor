import './App.css';
import { useReducer } from 'react';
import SimpleEditor from './editor/SimpleEditor'
import generalReducer from './editor/reducers'
import { SIMPLE_TYPES, TYPES } from './editor/types';
import ObjectEditor from './editor/ObjectEditor';

function App() {
  const [simple, dispatchSimple] = useReducer(generalReducer, '')
  const [object, dispatchObject] = useReducer(generalReducer, {})

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
        true &&
        <ObjectEditor
          value={object}
          schema={{
            label: 'Object',
            dispatcher: dispatchObject,
            others: {
              types: TYPES
            }
          }}
        />
      }
    </div>
  );
}

export default App;
