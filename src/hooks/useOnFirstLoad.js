import { useEffect, useRef } from 'react'

export default function useOnFirstLoad(callback) {
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      isFirstLoad.previous = true
      callback()
    }
  }, [callback])
}