import { create } from 'zustand'

export type ValidationSeverity = 'error' | 'warning' | 'info'

export type ValidationMessage = {
  path: string
  message: string
  severity: ValidationSeverity
}

type ValidationStore = {
  messages: ValidationMessage[]
  touchedFields: Set<string>
  visitedPages: Set<string>
  isValidating: boolean
  isValid: boolean

  setValidationState: (params: {
    messages: ValidationMessage[]
    isValid: boolean
  }) => void
  setIsValidating: (isValidating: boolean) => void
  markFieldAsTouched: (path: string) => void
  getMessagesForPath: (path: string) => ValidationMessage[]
  isFieldTouched: (path: string) => boolean
  visitPage: (path: string) => void
  hasVisitedPage: (path: string) => boolean

  warnings: ValidationMessage[]
  infos: ValidationMessage[]
}

const useValidationStore = create<ValidationStore>((set, get) => ({
  messages: [],
  touchedFields: new Set(),
  visitedPages: new Set(),
  isValidating: false,
  isValid: true,

  setValidationState: ({ messages, isValid }) =>
    set({
      messages,
      isValid,
    }),

  setIsValidating: (isValidating: boolean) => set({ isValidating }),

  getMessagesForPath: (path: string) => {
    return get().messages.filter((message) => message.path === path)
  },

  isFieldTouched(path: string) {
    return get().touchedFields.has(path)
  },

  visitPage: (path: string) =>
    set((state) => ({
      visitedPages: new Set([...state.visitedPages, path]),
    })),

  hasVisitedPage: (path: string) => {
    return get().visitedPages.has(path)
  },

  markFieldAsTouched: (path: string) =>
    set((state) => ({
      touchedFields: new Set([...state.touchedFields, path]),
    })),

  get errors() {
    return get().messages.filter((m) => m.severity === 'error')
  },

  get warnings() {
    return get().messages.filter((m) => m.severity === 'warning')
  },

  get infos() {
    return get().messages.filter((m) => m.severity === 'info')
  },
}))

export default useValidationStore
