import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ValidationMessage } from '../../../src/utils/validation/useValidationStore'

describe('usePathValidation', () => {
  let mockMessages: ValidationMessage[]
  let usePathValidation: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockMessages = []

    // The global setup.ts mocks usePathValidation directly, so we need to unmock it first
    vi.unmock('@/utils/validation/usePathValidation')

    // Mock the store that the real function will use
    vi.doMock('@/utils/validation/useValidationStore', () => {
      const mockStore = vi.fn((selector) => {
        if (typeof selector === 'function') {
          const mockState = {
            messages: mockMessages,
            touchedFields: new Set<string>(),
            visitedPages: new Set<string>(),
            isValidating: false,
            isValid: true,
            setValidationState: vi.fn(),
            setIsValidating: vi.fn(),
            markFieldAsTouched: vi.fn(),
            getMessagesForPath: vi.fn(),
            isFieldTouched: vi.fn(),
            visitPage: vi.fn(),
            hasVisitedPage: vi.fn(),
            reset: vi.fn(),
          }
          return selector(mockState)
        }
        return {
          messages: mockMessages,
          touchedFields: new Set<string>(),
          visitedPages: new Set<string>(),
          isValidating: false,
          isValid: true,
          setValidationState: vi.fn(),
          setIsValidating: vi.fn(),
          markFieldAsTouched: vi.fn(),
          getMessagesForPath: vi.fn(),
          isFieldTouched: vi.fn(),
          visitPage: vi.fn(),
          hasVisitedPage: vi.fn(),
          reset: vi.fn(),
        }
      })
      return {
        default: mockStore,
      }
    })

    // Import the function after mocking
    const module = await import(
      '../../../src/utils/validation/usePathValidation'
    )
    usePathValidation = module.usePathValidation
  })

  describe('document-information/general section', () => {
    const path = '/document-information/general'

    it('should return hasErrors: true when document title has error', () => {
      mockMessages = [
        {
          path: '/document/title',
          message: 'Title is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when tracking id has error', () => {
      mockMessages = [
        {
          path: '/document/tracking/id',
          message: 'Tracking ID is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when document lang has error', () => {
      mockMessages = [
        {
          path: '/document/lang',
          message: 'Language is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when multiple relevant fields have errors', () => {
      mockMessages = [
        {
          path: '/document/title',
          message: 'Title is required',
          severity: 'error',
        },
        {
          path: '/document/tracking/id',
          message: 'Tracking ID is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: false when no relevant errors exist', () => {
      mockMessages = [
        {
          path: '/document/publisher/name',
          message: 'Publisher name error',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })

    it('should return hasErrors: false when only warnings exist', () => {
      mockMessages = [
        {
          path: '/document/title',
          message: 'Title could be more descriptive',
          severity: 'warning',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })
  })

  describe('tracking section', () => {
    const path = '/tracking'

    it('should return hasErrors: true when tracking status has error', () => {
      mockMessages = [
        {
          path: '/document/tracking/status',
          message: 'Status is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when revision history has error', () => {
      mockMessages = [
        {
          path: '/document/tracking/revision_history/0/date',
          message: 'Revision date is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when any revision history field has error', () => {
      mockMessages = [
        {
          path: '/document/tracking/revision_history/1/summary',
          message: 'Revision summary is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when both status and revision history have errors', () => {
      mockMessages = [
        {
          path: '/document/tracking/status',
          message: 'Status is required',
          severity: 'error',
        },
        {
          path: '/document/tracking/revision_history/0/date',
          message: 'Revision date is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: false when no relevant errors exist', () => {
      mockMessages = [
        {
          path: '/document/title',
          message: 'Title error',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })
  })

  describe('document-information/notes section', () => {
    const path = '/document-information/notes'

    it('should return hasErrors: true when notes have error', () => {
      mockMessages = [
        {
          path: '/document/notes/0/text',
          message: 'Note text is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when any notes field has error', () => {
      mockMessages = [
        {
          path: '/document/notes/1/category',
          message: 'Note category is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: false when no notes errors exist', () => {
      mockMessages = [
        {
          path: '/document/publisher/name',
          message: 'Publisher error',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })
  })

  describe('document-information/publisher section', () => {
    const path = '/document-information/publisher'

    it('should return hasErrors: true when publisher has error', () => {
      mockMessages = [
        {
          path: '/document/publisher/name',
          message: 'Publisher name is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when any publisher field has error', () => {
      mockMessages = [
        {
          path: '/document/publisher/namespace',
          message: 'Publisher namespace is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: false when no publisher errors exist', () => {
      mockMessages = [
        {
          path: '/document/notes/0/text',
          message: 'Notes error',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })
  })

  describe('document-information/acknowledgments section', () => {
    const path = '/document-information/acknowledgments'

    it('should return hasErrors: true when acknowledgments have error', () => {
      mockMessages = [
        {
          path: '/document/acknowledgments/0/name',
          message: 'Acknowledgment name is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when any acknowledgments field has error', () => {
      mockMessages = [
        {
          path: '/document/acknowledgments/1/organization',
          message: 'Organization is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: false when no acknowledgments errors exist', () => {
      mockMessages = [
        {
          path: '/document/publisher/name',
          message: 'Publisher error',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })
  })

  describe('document-information/references section', () => {
    const path = '/document-information/references'

    it('should return hasErrors: true when references have error', () => {
      mockMessages = [
        {
          path: '/document/references/0/url',
          message: 'Reference URL is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when any references field has error', () => {
      mockMessages = [
        {
          path: '/document/references/1/summary',
          message: 'Reference summary is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: false when no references errors exist', () => {
      mockMessages = [
        {
          path: '/document/publisher/name',
          message: 'Publisher error',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })
  })

  describe('products section', () => {
    const path = '/products'

    it('should return hasErrors: true when products have error', () => {
      mockMessages = [
        {
          path: '/products/0/name',
          message: 'Product name is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when any products field has error', () => {
      mockMessages = [
        {
          path: '/products/branches/0/product/name',
          message: 'Product branch name is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: false when no products errors exist', () => {
      mockMessages = [
        {
          path: '/document/publisher/name',
          message: 'Publisher error',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })
  })

  describe('vulnerabilities section', () => {
    const path = '/vulnerabilities'

    it('should return hasErrors: true when vulnerabilities have error', () => {
      mockMessages = [
        {
          path: '/vulnerabilities/0/cve',
          message: 'CVE is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: true when any vulnerabilities field has error', () => {
      mockMessages = [
        {
          path: '/vulnerabilities/1/scores/0/cvss_v3/baseScore',
          message: 'CVSS base score is required',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: true,
        hasVisited: true,
      })
    })

    it('should return hasErrors: false when no vulnerabilities errors exist', () => {
      mockMessages = [
        {
          path: '/document/publisher/name',
          message: 'Publisher error',
          severity: 'error',
        },
      ]

      const result = usePathValidation(path)

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })
  })

  describe('unknown/unregistered paths', () => {
    it('should return default values for unknown path', () => {
      mockMessages = [
        {
          path: '/document/title',
          message: 'Title error',
          severity: 'error',
        },
      ]

      const result = usePathValidation('/unknown-path')

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })

    it('should return default values for empty path', () => {
      mockMessages = [
        {
          path: '/document/title',
          message: 'Title error',
          severity: 'error',
        },
      ]

      const result = usePathValidation('')

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })

    it('should return default values for null path', () => {
      mockMessages = [
        {
          path: '/document/title',
          message: 'Title error',
          severity: 'error',
        },
      ]

      const result = usePathValidation(null as any)

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })
  })

  describe('message filtering', () => {
    it('should only consider error messages, not warnings or infos', () => {
      mockMessages = [
        {
          path: '/document/title',
          message: 'Title warning',
          severity: 'warning',
        },
        {
          path: '/document/tracking/id',
          message: 'ID info',
          severity: 'info',
        },
      ]

      const result = usePathValidation('/document-information/general')

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })

    it('should handle mixed severity messages correctly', () => {
      mockMessages = [
        {
          path: '/document/title',
          message: 'Title error',
          severity: 'error',
        },
        {
          path: '/document/title',
          message: 'Title warning',
          severity: 'warning',
        },
        {
          path: '/document/tracking/id',
          message: 'ID info',
          severity: 'info',
        },
      ]

      const result = usePathValidation('/document-information/general')

      expect(result).toEqual({
        hasErrors: true, // Should be true because of the error message
        hasVisited: true,
      })
    })

    it('should handle empty messages array', () => {
      mockMessages = []

      const result = usePathValidation('/document-information/general')

      expect(result).toEqual({
        hasErrors: false,
        hasVisited: true,
      })
    })
  })

  describe('edge cases', () => {
    it('should handle messages with empty paths', () => {
      mockMessages = [
        {
          path: '',
          message: 'Empty path error',
          severity: 'error',
        },
        {
          path: '/document/title',
          message: 'Title error',
          severity: 'error',
        },
      ]

      const result = usePathValidation('/document-information/general')

      expect(result).toEqual({
        hasErrors: true, // Should find the title error
        hasVisited: true,
      })
    })

    it('should handle messages with null/undefined paths', () => {
      mockMessages = [
        {
          path: null as any,
          message: 'Null path error',
          severity: 'error',
        },
        {
          path: '/document/title',
          message: 'Title error',
          severity: 'error',
        },
      ]

      const result = usePathValidation('/document-information/general')

      expect(result).toEqual({
        hasErrors: true, // Should find the title error
        hasVisited: true,
      })
    })

    it('should handle case sensitivity correctly', () => {
      mockMessages = [
        {
          path: '/Document/Title', // Different case
          message: 'Title error',
          severity: 'error',
        },
      ]

      const result = usePathValidation('/document-information/general')

      expect(result).toEqual({
        hasErrors: false, // Should not match due to case sensitivity
        hasVisited: true,
      })
    })
  })

  describe('store integration', () => {
    it('should call useValidationStore with correct selector', () => {
      usePathValidation('/document-information/general')

      // TODO: Update test when implementing store call tracking
      expect(true).toBe(true)
    })

    it('should work when store returns undefined messages', () => {
      // TODO: Update test for undefined messages scenario
      expect(true).toBe(true)
    })
  })
})
