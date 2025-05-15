import { useState, useCallback } from 'react'
import { DEFAULT_ARRAY_SIZE, MIN_VALUE, MAX_VALUE } from '../../constants/sortSettings'

export interface UseSortableArrayReturn {
  array: number[]
  setArray: React.Dispatch<React.SetStateAction<number[]>>
  arraySize: number
  setArraySize: React.Dispatch<React.SetStateAction<number>>
  regenerateArray: (currentSize: number) => number[]
}

export function useSortableArray(initialSize: number = DEFAULT_ARRAY_SIZE): UseSortableArrayReturn {
  const [array, setArray] = useState<number[]>([])
  const [arraySize, setArraySize] = useState<number>(initialSize)

  const regenerateArray = useCallback((currentSize: number): number[] => {
    const newArray: number[] = Array.from(
      { length: currentSize },
      () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
    )
    setArray(newArray)
    return newArray
  }, []) // MAX_VALUE and MIN_VALUE are constants, no need for them in deps if imported directly

  return {
    array,
    setArray,
    arraySize,
    setArraySize,
    regenerateArray,
  }
}
