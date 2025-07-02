import useValidationStore from '@/utils/validation/useValidationStore'

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
    // For now we mark all fields as touched until we have a better way to handle this
    isTouched: true,
    markFieldAsTouched: validationStore.markFieldAsTouched,
  }
}
