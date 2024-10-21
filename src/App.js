import './App.css';
import SimpleEditor, { SchemaSimpleEditor } from './editor/SimpleEditor';
import ObjectEditor from './editor/ObjectEditor';
import ArrayEditor from './editor/ArrayEditor';
import { useReducer } from 'react';
import generalReducer from './editor/reducers';
import { SIMPLE_TYPE_TO_NAME, TYPE_TO_NAME } from './editor/types';
import { keys } from './editor/objectIterators';
import Editor from './editor/Editor';

function SchemaApp() {
  const [entry, dispatchEntry] = useReducer(generalReducer, true)

  const [objectEntry, dispatchObjectEntry] = useReducer(generalReducer, {
    "My string": "abc",
    "My Inner": {
      "My inner string" : "def"
    }
  })

  const [arrayEntry, dispatchArrayEntry] = useReducer(generalReducer, [])

  const [anyEntry, dispatchAnyEntry] = useReducer(generalReducer, '')

  return (
    <>
      <div style={{ margin: '10px' }}>
        <SchemaSimpleEditor
          value={entry}
          dispatcher={dispatchEntry}
          schema={{
            label: 'Entry',
            types: keys(TYPE_TO_NAME),
            default: 'Default entry...',
            validator: entry => typeof entry === 'number' && entry > 100 ? 100 : null
          }}
        />
      </div>
      <hr />
      <div style={{ margin: '10px' }}>
        <ObjectEditor value={objectEntry} dispatcher={dispatchObjectEntry} />
      </div>
      <hr />
      <div style={{ margin: '10px' }}>
        <ArrayEditor value={arrayEntry} dispatcher={dispatchArrayEntry} />
      </div>
      <hr />
      <div>
        <Editor value={anyEntry} dispatcher={dispatchAnyEntry} label='Any...' types={keys(TYPE_TO_NAME)} />
      </div>
    </>
  );
}

function NoSchemaApp() {
  const [entry, dispatchEntry] = useReducer(generalReducer, true)

  const [objectEntry, dispatchObjectEntry] = useReducer(generalReducer, {
    "My string": "abc",
    "My Inner": {
      "My inner string" : "def"
    }
  })

  const [arrayEntry, dispatchArrayEntry] = useReducer(generalReducer, [])

  const [anyEntry, dispatchAnyEntry] = useReducer(generalReducer, '')

  return (
    <>
      <div style={{ margin: '10px' }}>
        <SimpleEditor value={entry} dispatcher={dispatchEntry} label='Entry' types={keys(SIMPLE_TYPE_TO_NAME)} />
      </div>
      <hr />
      <div style={{ margin: '10px' }}>
        <ObjectEditor value={objectEntry} dispatcher={dispatchObjectEntry} />
      </div>
      <hr />
      <div style={{ margin: '10px' }}>
        <ArrayEditor value={arrayEntry} dispatcher={dispatchArrayEntry} />
      </div>
      <hr />
      <div>
        <Editor value={anyEntry} dispatcher={dispatchAnyEntry} label='Any...' types={keys(TYPE_TO_NAME)} />
      </div>
    </>
  );
}

export default SchemaApp;
