import React, { useCallback, useEffect, useState } from 'react'
import { isSimple, requireValidType } from './types';
import SimpleEditor from './SimpleEditor';
import ComplexEditor from './ComplexEditor';

export default function Editor({  value, dispatcher, label=null, deleter=null, types=null, style={} }) {
  const generateEditor = useCallback(() => {
    if (isSimple(requireValidType(value))) {
      return <SimpleEditor value={value} dispatcher={dispatcher} label={label} deleter={deleter} types={types} overrideSimpleTypes={true} />
    } else {
      return <ComplexEditor value={value} dispatcher={dispatcher} deleter={deleter} />
    }
  }, [value, dispatcher, label, deleter, types]);

  const [editor, setEditor] = useState(generateEditor())

  useEffect(() => setEditor(generateEditor()), [value, setEditor, generateEditor])

  return editor;
}
