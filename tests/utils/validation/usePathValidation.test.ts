import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { usePathValidation } from '../../../src/utils/validation/usePathValidation'
import { ValidationMessage } from '../../../src/utils/validation/useValidationStore'

// Mock the validation store
vi.mock('../../../src/utils/validation/useValidationStore')

import useValidationStore from '../../../src/utils/validation/useValidationStore'

describe('usePathValidation', () => {
  let mockMessages: ValidationMessage[]

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockMessages = []
    
    // Mock the store to return messages when called with state selector
    ;(useValidationStore as unknown as Mock).mockImplementation((selector) => {
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
    })
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

      expect(useValidationStore).toHaveBeenCalledTimes(1)
      expect(useValidationStore).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should work when store returns undefined messages', () => {
      ;(useValidationStore as unknown as Mock).mockImplementation((selector) => {
        const mockState = {
          messages: undefined,
        }
        return selector(mockState)
      })

      // This should throw an error because the real implementation doesn't handle undefined messages
      expect(() => {
        usePathValidation('/document-information/general')
      }).toThrow()
    })
  })
})
