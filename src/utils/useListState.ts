import { useState } from 'react'
import {
  DynamicObjectValueKey,
  getDynamicObjectValue,
} from './dynamicObjectValue'

export type UseListStateProps<T, IdType> = {
  initialData?: T[]
  idKey?: DynamicObjectValueKey<T, IdType>
  /** Generator function to create a new element */
  generator?: T | (() => T)
  onRemove?: (entry: T) => void
}

export type ListState<T, IdType = string> = {
  data: T[]
  setData: React.Dispatch<React.SetStateAction<T[]>>
  updateDataEntry: (updatedEntry: T) => void
  removeDataEntry: (entry: T) => void
  addDataEntry: () => T | undefined
  getId: (entry: T) => IdType
}

export function useListState<T extends object, IdType = string>(
  options?: UseListStateProps<T, IdType>,
): ListState<T, IdType> {
  const { initialData = [], idKey = 'id' as keyof T, generator } = options ?? {}
  const [data, setData] = useState<T[]>(initialData)

  const updateDataEntry = (updatedEntry: T) => {
    setData(
      data.map((e) => (getId(e) === getId(updatedEntry) ? updatedEntry : e)),
    )
  }

  const removeDataEntry = (entry: T) => {
    setData([...data.filter((e) => getId(e) !== getId(entry))])
    options?.onRemove?.(entry)
  }

  /** adds a new data entry to the state
   *  returns the id of the new data entry */
  const addDataEntry = () => {
    const entry = typeof generator === 'function' ? generator() : generator
    if (entry) {
      setData([...data, entry])
      return entry
    }
  }

  const getId = (entry: T) => getDynamicObjectValue(entry, idKey)

  return {
    data,
    setData,
    updateDataEntry,
    removeDataEntry,
    getId,
    addDataEntry,
  }
}
