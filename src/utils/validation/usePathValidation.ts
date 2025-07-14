import useValidationStore from './useValidationStore'

type HasErrorFunction = (errorPaths: string[]) => boolean

const validationSections: Record<string, HasErrorFunction> = {
  '/document-information/general': (errorPaths) => {
    return ['/document/title', '/document/tracking/id', '/document/lang'].some(
      (path) => errorPaths.includes(path),
    )
  },
  '/tracking': (errorPaths) => {
    return (
      errorPaths.includes('/document/tracking/status') ||
      errorPaths.some((path) =>
        path.startsWith('/document/tracking/revision_history'),
      )
    )
  },
  '/document-information/notes': (errorPaths) => {
    return errorPaths.some((path) => path.startsWith('/document/notes'))
  },
  '/document-information/publisher': (errorPaths) => {
    return errorPaths.some((path) => path.startsWith('/document/publisher'))
  },
  '/document-information/acknowledgments': (errorPaths) => {
    return errorPaths.some((path) =>
      path.startsWith('/document/acknowledgments'),
    )
  },
  '/document-information/references': (errorPaths) => {
    return errorPaths.some((path) => path.startsWith('/document/references'))
  },
  '/products': (errorPaths) => {
    return errorPaths.some((path) => path.startsWith('/products'))
  },
  '/vulnerabilities': (errorPaths) => {
    return errorPaths.some((path) => path.startsWith('/vulnerabilities'))
  },
}

export function usePathValidation(path: string) {
  const messages = useValidationStore((state) => state.messages)
  const errorPaths = messages
    .filter((m) => m.severity === 'error')
    .map((e) => e.path)
  // const hasVisitedPage = useValidationStore((state) => state.hasVisitedPage)
  if (validationSections[path]) {
    const hasErrors = validationSections[path](errorPaths)
    return {
      hasErrors,
      // For now we mark all fields as touched until we have a better way to handle this
      // hasVisited: hasVisitedPage(path),
      hasVisited: true,
    }
  }

  return {
    hasErrors: false,
    // For now we mark all fields as touched until we have a better way to handle this
    // hasVisited: hasVisitedPage(path),
    hasVisited: true,
  }
}
