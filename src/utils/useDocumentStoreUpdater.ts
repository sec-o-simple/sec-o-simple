import { useEffect } from 'react'
import useDocumentStore, { TDocumentStore } from './useDocumentStore'
import { useConfigStore } from './useConfigStore'
import useValidationStore from './useValidationStore'
import { validateDocument } from './documentValidator'

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

export function useDocumentValidation() {
  const documentStore = useDocumentStore()
  const setValidationState = useValidationStore(state => state.setValidationState)
  const setIsValidating = useValidationStore(state => state.setIsValidating)

  useEffect(() => {
    const validate = async () => {
      try {
        setIsValidating(true)
        const result = await validateDocument(documentStore)
        setValidationState({
          isValid: result.isValid,
          messages: result.messages,
        })
      } finally {
        setIsValidating(false)
      } 
    }

    validate()
    // JSON.stringify is used to avoid calling the validation function
    // if the documentStore has not changed
  }, [JSON.stringify(documentStore), setValidationState, setIsValidating])
}

export default function useDocumentStoreUpdater<T>({
  localState,
  valueField,
  valueUpdater,
  init,
}: useDocumentStoreUpdaterProps<T>) {
  const config = useConfigStore((state) => state.config)
  const documentStoreValue = useDocumentStore((state) => state[valueField]) as T
  const updateDocumentStoreValue = useDocumentStore(
    (state) => state[valueUpdater],
  ) as (update: T) => void
  useDocumentValidation()

  // initialize localState after config has been fetched
  useEffect(() => {
    if (config) {
      init(documentStoreValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

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
