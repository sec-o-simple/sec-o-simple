import useValidationStore from "./useValidationStore"

export function usePrefixValidation(prefix: string) {
    const messages = useValidationStore((state) => state.messages)
    const errorPaths = messages
        .filter((m) => m.severity === 'error')
        .map((e) => e.path)

    const hasErrors = errorPaths.some((path) => path.startsWith(prefix + '/'))

    return {
        hasErrors,
    }
}