import './App.css';
import { useReducer } from 'react';
import ObjectEditor, { genericReducer } from './editor/ObjectEditor';

function App() {
  const [object, dispatch] = useReducer(genericReducer, {})

  console.debug(object)

  return (
    <>
      <ObjectEditor value={object} dispatcher={dispatch}/>
    </>
  );
}

export default App;
