import useValidationStore from '@/utils/useValidationStore'

export function useFieldValidation(path?: string) {
  const validationStore = useValidationStore()

  const messages = !path ? [] : validationStore.getMessagesForPath(path)
  const errorMessages = messages.filter((m) => m.severity === 'error')
  const warningMessages = messages.filter((m) => m.severity === 'warning')
  const infoMessages = messages.filter((m) => m.severity === 'info')

  return {
    messages,
    hasErrors: errorMessages.length > 0,
    hasWarnings: warningMessages.length > 0,
    hasInfos: infoMessages.length > 0,
    errorMessages,
    warningMessages,
    infoMessages,
    isTouched: !path ? true : validationStore.isFieldTouched(path),
    markFieldAsTouched: validationStore.markFieldAsTouched,
  }
}
