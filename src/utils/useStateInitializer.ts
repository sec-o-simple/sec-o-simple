import { useState } from 'react'

export enum UpdatePriority {
  Low = 1,
  Normal = 2,
}

export function useStateInitializer() {
  const [priorityState, setPriorityState] = useState(0)

  const updateState = (priority: UpdatePriority, callback: () => void) => {
    if (priority > priorityState) {
      setPriorityState(priority)
      callback()
    }
  }

  return { updateState }
}
