import './App.css';
import { useCallback, useState } from 'react';
import NameEntry from './components/NameEntry';
import ArrayEntry from './editor/ArrayEntry';
import ValueEntry from './editor/ValueEntry';
import ObjectEditor from './editor/ObjectEditor';

function App() {
  const [num, setNum] = useState(0)
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [todos, setTodos] = useState([])
  const [obj, setObj] = useState({})

  const todosChange = useCallback(evt => {
    setTodos(todos => {
      const newTodos = [...todos]
      newTodos[evt.index] = evt.value
      return newTodos
    })
  }, [setTodos])

  const todosRemoveAt = useCallback(index => {
    setTodos(todos => {
      return todos.filter((_, i) => i !== index)
    })
  }, [setTodos])

  const todosAppend = useCallback(() => {
    setTodos(todos => [...todos, ''])
  }, [setTodos])

  const objChange = useCallback(evt => {
    setObj(obj => {
      const newObj  = { ...obj }
      newObj[evt.key] = evt.value
      return newObj
    })
  }, [setObj])

  const objRemove = useCallback(key => {
    setObj(obj => {
      const newObj  = { ...obj }
      delete newObj[key]
      return newObj
    })
  }, [setObj])

  const objAppend = useCallback((key, value) => {
    if (key in obj) {
      return
    }
    setObj(obj => {
      const newObj  = { ...obj }
      newObj[key] = value
      return newObj
    })
  }, [obj, setObj])

  return (
    <>
      <ValueEntry value={num} onChange={val => setNum(val)} restrictions={['number']}/>
      <hr />
      <NameEntry first={first} last={last} onChange={evt => (evt.isFirst ? setFirst : setLast)(evt.value)} />
      <hr />
      <ArrayEntry value={todos} onChange={todosChange} removeAt={todosRemoveAt} append={todosAppend} restrictions={{ 1: ['number'] }} />
      <hr />
      <ObjectEditor value={obj} onChange={objChange} append={objAppend} remove={objRemove} />
    </>
  );
}

export default App;
