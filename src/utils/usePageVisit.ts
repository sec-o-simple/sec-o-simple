import { useEffect, useState } from 'react'
import useValidationStore from './useValidationStore'
import { useLocation } from 'react-router'

/**
 * A hook that tracks page visits and manages page visit state.
 * It marks a page as visited after a brief delay and tracks whether the current page
 * has been previously visited.
 *
 * @returns {boolean} Returns true if the current page has been previously visited, false otherwise
 *
 * @example
 * function MyComponent() {
 *   const hasVisited = usePageVisit();
 *   return hasVisited ? <div>Welcome back!</div> : <div>First time here!</div>;
 * }
 */
export default function usePageVisit() {
  const visitPage = useValidationStore((state) => state.visitPage)
  const hasVisitedPage = useValidationStore((state) => state.hasVisitedPage)
  const [visitedPage, setHasVisitedPage] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Check if page was previously visited
    if (hasVisitedPage(location.pathname)) {
      setHasVisitedPage(true)
    }

    // Mark page as visited after short delay
    const timeoutId = setTimeout(() => {
      visitPage(location.pathname)
    }, 500)

    // Cleanup timeout if user leaves page before delay
    return () => clearTimeout(timeoutId)
  }, [location.pathname, visitPage, hasVisitedPage])

  return visitedPage
}
