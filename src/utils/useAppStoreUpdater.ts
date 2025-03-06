import { useEffect } from 'react'
import useAppStore, { TAppStore } from './useAppStore'

type TAppStoreFunction<T> = {
  [K in keyof TAppStore]: TAppStore[K] extends (update: T) => void ? K : never
}[keyof TAppStore]

type TAppStoreValue<T> = Exclude<keyof TAppStore, TAppStoreFunction<T>>

export type UseAppStoreUpdaterProps<T> = {
  /** react state that triggers the update or tuple with state and callback for update data */
  localState: Partial<T> | [unknown, () => Partial<T>]
  /** key of the AppStore field that should be updated */
  valueField: TAppStoreValue<T>
  /** key of the AppStore update function */
  valueUpdater: TAppStoreFunction<T>
  /** callback function to initilize the localState */
  init: (initialData: T) => void
}

export default function useAppStoreUpdater<T>({
  localState,
  valueField,
  valueUpdater,
  init,
}: UseAppStoreUpdaterProps<T>) {
  const appStoreValue = useAppStore((state) => state[valueField]) as T
  const updateAppStoreValue = useAppStore((state) => state[valueUpdater]) as (
    update: T,
  ) => void

  // initialize localState
  useEffect(() => {
    init(appStoreValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // TODO: enhance performance:
  // TODO: add debounce (and save on dismount in case component gets dismounted before save)
  useEffect(() => {
    updateAppStoreValue({
      ...appStoreValue,
      ...getStateObject(localState).getUpdate(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStateObject(localState).trigger, updateAppStoreValue])
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
