import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { useFieldValidation } from '../../../src/utils/validation/useFieldValidation'
import { ValidationMessage } from '../../../src/utils/validation/useValidationStore'

// Unmock the useFieldValidation function so we can test the actual implementation
vi.unmock('@/utils/validation/useFieldValidation')

// Mock the validation store
vi.mock('../../../src/utils/validation/useValidationStore', () => ({
  default: vi.fn()
}))

import useValidationStore from '../../../src/utils/validation/useValidationStore'

describe('useFieldValidation', () => {
  let mockGetMessagesForPath: Mock
  let mockMarkFieldAsTouched: Mock
  let mockStore: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockGetMessagesForPath = vi.fn()
    mockMarkFieldAsTouched = vi.fn()
    
    // Create a mock store object
    mockStore = {
      getMessagesForPath: mockGetMessagesForPath,
      markFieldAsTouched: mockMarkFieldAsTouched,
      messages: [],
      touchedFields: new Set<string>(),
      visitedPages: new Set<string>(),
      isValidating: false,
      isValid: true,
      setValidationState: vi.fn(),
      setIsValidating: vi.fn(),
      isFieldTouched: vi.fn(),
      visitPage: vi.fn(),
      hasVisitedPage: vi.fn(),
      reset: vi.fn(),
      errors: [],
      warnings: [],
      infos: [],
    }
    
    // Mock the store - zustand returns the store object directly when called without selector
    ;(useValidationStore as unknown as Mock).mockReturnValue(mockStore)
  })

  describe('basic functionality', () => {
    it('should return correct structure when called without path', () => {
      const result = useFieldValidation()

      expect(result).toHaveProperty('messages')
      expect(result).toHaveProperty('hasErrors')
      expect(result).toHaveProperty('hasWarnings')
      expect(result).toHaveProperty('hasInfos')
      expect(result).toHaveProperty('errorMessages')
      expect(result).toHaveProperty('warningMessages')
      expect(result).toHaveProperty('infoMessages')
      expect(result).toHaveProperty('isTouched')
      expect(result).toHaveProperty('markFieldAsTouched')
      
      // Should return empty arrays when no path provided
      expect(result.messages).toEqual([])
      expect(mockGetMessagesForPath).not.toHaveBeenCalled()
    })

    it('should not call getMessagesForPath when path is undefined', () => {
      useFieldValidation()
      expect(mockGetMessagesForPath).not.toHaveBeenCalled()
    })

    it('should call getMessagesForPath when path is provided', () => {
      mockGetMessagesForPath.mockReturnValue([])
      
      const result = useFieldValidation('/test/path')
      
      expect(mockGetMessagesForPath).toHaveBeenCalledWith('/test/path')
      expect(mockGetMessagesForPath).toHaveBeenCalledTimes(1)
    })

    it('should return empty arrays when no messages exist', () => {
      mockGetMessagesForPath.mockReturnValue([])
      const result = useFieldValidation('/test/path')

      expect(result.messages).toEqual([])
      expect(result.errorMessages).toEqual([])
      expect(result.warningMessages).toEqual([])
      expect(result.infoMessages).toEqual([])
      expect(result.hasErrors).toBe(false)
      expect(result.hasWarnings).toBe(false)
      expect(result.hasInfos).toBe(false)
    })

    it('should categorize error messages correctly', () => {
      const errorMessages: ValidationMessage[] = [
        { path: '/test', message: 'Error 1', severity: 'error' },
        { path: '/test', message: 'Error 2', severity: 'error' },
      ]
      mockGetMessagesForPath.mockReturnValue(errorMessages)
      
      const result = useFieldValidation('/test')

      expect(result.messages).toEqual(errorMessages)
      expect(result.errorMessages).toEqual(errorMessages)
      expect(result.warningMessages).toEqual([])
      expect(result.infoMessages).toEqual([])
      expect(result.hasErrors).toBe(true)
      expect(result.hasWarnings).toBe(false)
      expect(result.hasInfos).toBe(false)
    })

    it('should categorize warning messages correctly', () => {
      const warningMessages: ValidationMessage[] = [
        { path: '/test', message: 'Warning 1', severity: 'warning' },
      ]
      mockGetMessagesForPath.mockReturnValue(warningMessages)
      
      const result = useFieldValidation('/test')

      expect(result.warningMessages).toEqual(warningMessages)
      expect(result.hasWarnings).toBe(true)
      expect(result.hasErrors).toBe(false)
      expect(result.hasInfos).toBe(false)
    })

    it('should categorize info messages correctly', () => {
      const infoMessages: ValidationMessage[] = [
        { path: '/test', message: 'Info 1', severity: 'info' },
      ]
      mockGetMessagesForPath.mockReturnValue(infoMessages)
      
      const result = useFieldValidation('/test')

      expect(result.infoMessages).toEqual(infoMessages)
      expect(result.hasInfos).toBe(true)
      expect(result.hasErrors).toBe(false)
      expect(result.hasWarnings).toBe(false)
    })

    it('should categorize mixed messages correctly', () => {
      const mixedMessages: ValidationMessage[] = [
        { path: '/test', message: 'Error', severity: 'error' },
        { path: '/test', message: 'Warning', severity: 'warning' },
        { path: '/test', message: 'Info', severity: 'info' },
      ]
      mockGetMessagesForPath.mockReturnValue(mixedMessages)
      
      const result = useFieldValidation('/test')

      expect(result.messages).toEqual(mixedMessages)
      expect(result.errorMessages).toHaveLength(1)
      expect(result.warningMessages).toHaveLength(1)
      expect(result.infoMessages).toHaveLength(1)
      expect(result.hasErrors).toBe(true)
      expect(result.hasWarnings).toBe(true)
      expect(result.hasInfos).toBe(true)
    })

    it('should return isTouched as true', () => {
      const result = useFieldValidation()
      expect(result.isTouched).toBe(true)
    })

    it('should return markFieldAsTouched function from store', () => {
      const result = useFieldValidation()
      expect(result.markFieldAsTouched).toBe(mockMarkFieldAsTouched)
    })

    it('should handle empty string path', () => {
      const result = useFieldValidation('')
      expect(result.messages).toEqual([])
      expect(mockGetMessagesForPath).not.toHaveBeenCalled()
    })

    it('should handle whitespace path', () => {
      mockGetMessagesForPath.mockReturnValue([])
      const result = useFieldValidation('   ')
      expect(mockGetMessagesForPath).toHaveBeenCalledWith('   ')
    })

    it('should handle null path', () => {
      const result = useFieldValidation(null as any)
      expect(result.messages).toEqual([])
      expect(mockGetMessagesForPath).not.toHaveBeenCalled()
    })

    it('should filter messages by severity type correctly', () => {
      const messages: ValidationMessage[] = [
        { path: '/test', message: 'Error 1', severity: 'error' },
        { path: '/test', message: 'Warning 1', severity: 'warning' },
        { path: '/test', message: 'Info 1', severity: 'info' },
        { path: '/test', message: 'Error 2', severity: 'error' },
      ]
      mockGetMessagesForPath.mockReturnValue(messages)
      
      const result = useFieldValidation('/test')

      expect(result.errorMessages).toHaveLength(2)
      expect(result.warningMessages).toHaveLength(1)
      expect(result.infoMessages).toHaveLength(1)
      
      expect(result.errorMessages.every(m => m.severity === 'error')).toBe(true)
      expect(result.warningMessages.every(m => m.severity === 'warning')).toBe(true)
      expect(result.infoMessages.every(m => m.severity === 'info')).toBe(true)
    })
  })
})
