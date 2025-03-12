import { useEffect } from 'react'
import useDocumentStore, { TDocumentStore } from './useDocumentStore'

type TDocumentStoreFunction<T> = {
  [K in keyof TDocumentStore]: TDocumentStore[K] extends (update: T) => void
    ? K
    : never
}[keyof TDocumentStore]

type TDocumentStoreValue<T> = Exclude<
  keyof TDocumentStore,
  TDocumentStoreFunction<T>
>

export type useDocumentStoreUpdaterProps<T> = {
  /** react state that triggers the update or tuple with state and callback for update data */
  localState: Partial<T> | [unknown, () => Partial<T>]
  /** key of the DocumentStore field that should be updated */
  valueField: TDocumentStoreValue<T>
  /** key of the DocumentStore update function */
  valueUpdater: TDocumentStoreFunction<T>
  /** callback function to initilize the localState */
  init: (initialData: T) => void
}

export default function useDocumentStoreUpdater<T>({
  localState,
  valueField,
  valueUpdater,
  init,
}: useDocumentStoreUpdaterProps<T>) {
  const documentStoreValue = useDocumentStore((state) => state[valueField]) as T
  const updateDocumentStoreValue = useDocumentStore(
    (state) => state[valueUpdater],
  ) as (update: T) => void

  // initialize localState
  useEffect(() => {
    init(documentStoreValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // TODO: enhance performance:
  // TODO: add debounce (and save on dismount in case component gets dismounted before save)
  useEffect(() => {
    updateDocumentStoreValue({
      ...documentStoreValue,
      ...getStateObject(localState).getUpdate(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStateObject(localState).trigger, updateDocumentStoreValue])
}

function getStateObject<T>(
  stateVar: Partial<T> | [unknown, () => Partial<T>],
): { trigger: unknown; getUpdate: () => Partial<T> } {
  return stateVar instanceof Array &&
    stateVar.length === 2 &&
    typeof stateVar[1] === 'function'
    ? {
        trigger: stateVar[0],
        getUpdate: stateVar[1],
      }
    : {
        trigger: stateVar as Partial<T>,
        getUpdate: () => stateVar as Partial<T>,
      }
}
