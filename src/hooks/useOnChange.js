import { useEffect, useRef } from "react";

export default function useOnChange(cb, state) {
  const refState = useRef(state)

  useEffect(() => {
    if (refState.current !== state) {
      refState.previous = refState.current
      refState.current = state
      cb(refState)
    }
  }, [cb, state, refState])

  return refState
}
