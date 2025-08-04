import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePrefixValidation } from '../../../src/utils/validation/usePrefixValidation'
import { ValidationMessage } from '../../../src/utils/validation/useValidationStore'

// Mock the validation store
vi.mock('../../../src/utils/validation/useValidationStore', () => ({
  default: vi.fn(),
}))

import useValidationStore from '../../../src/utils/validation/useValidationStore'

describe('usePrefixValidation', () => {
  const mockUseValidationStore = useValidationStore as unknown as Mock

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should return hasErrors as false when there are no messages', () => {
      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages: [] }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(false)
    })

    it('should return hasErrors as false when there are no error messages', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefix/field1',
          message: 'Warning message',
          severity: 'warning',
        },
        {
          path: 'test/prefix/field2',
          message: 'Info message',
          severity: 'info',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(false)
    })

    it('should return hasErrors as false when there are errors but none match the prefix', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'different/prefix/field1',
          message: 'Error message 1',
          severity: 'error',
        },
        {
          path: 'another/path/field2',
          message: 'Error message 2',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(false)
    })

    it('should return hasErrors as true when there are errors that match the prefix', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefix/field1',
          message: 'Error message 1',
          severity: 'error',
        },
        {
          path: 'different/prefix/field2',
          message: 'Error message 2',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(true)
    })

    it('should return hasErrors as true when multiple errors match the prefix', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefix/field1',
          message: 'Error message 1',
          severity: 'error',
        },
        {
          path: 'test/prefix/field2',
          message: 'Error message 2',
          severity: 'error',
        },
        {
          path: 'test/prefix/nested/field3',
          message: 'Error message 3',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(true)
    })
  })

  describe('mixed message types', () => {
    it('should only consider error severity messages and ignore warnings/info', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefix/field1',
          message: 'Warning message',
          severity: 'warning',
        },
        {
          path: 'test/prefix/field2',
          message: 'Info message',
          severity: 'info',
        },
        {
          path: 'test/prefix/field3',
          message: 'Error message',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(true)
    })

    it('should return false when only non-error messages match the prefix', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefix/field1',
          message: 'Warning message',
          severity: 'warning',
        },
        {
          path: 'test/prefix/field2',
          message: 'Info message',
          severity: 'info',
        },
        {
          path: 'other/path/field3',
          message: 'Error message',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(false)
    })
  })

  describe('prefix edge cases', () => {
    it('should handle empty prefix', () => {
      const messages: ValidationMessage[] = [
        {
          path: '/field1',
          message: 'Error message',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation(''))

      expect(result.current.hasErrors).toBe(true)
    })

    it('should handle single character prefix', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'a/field1',
          message: 'Error message',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('a'))

      expect(result.current.hasErrors).toBe(true)
    })

    it('should handle prefix with special characters', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test-prefix_123/field1',
          message: 'Error message',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test-prefix_123'))

      expect(result.current.hasErrors).toBe(true)
    })

    it('should not match partial prefix matches', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefixabc/field1',
          message: 'Error message',
          severity: 'error',
        },
        {
          path: 'test/prefix-extra/field2',
          message: 'Error message 2',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(false)
    })

    it('should match exact prefix with slash separator', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefix/field1',
          message: 'Error message',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(true)
    })
  })

  describe('path matching behavior', () => {
    it('should match deeply nested paths under the prefix', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefix/level1/level2/level3/field',
          message: 'Error message',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(true)
    })

    it('should not match paths that start with prefix but without slash separator', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefixother',
          message: 'Error message',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(false)
    })

    it('should handle paths with array indices', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefix/items/0/field',
          message: 'Error message',
          severity: 'error',
        },
        {
          path: 'test/prefix/items/1/field',
          message: 'Error message 2',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(true)
    })
  })

  describe('store integration', () => {
    it('should call useValidationStore with correct selector', () => {
      const messages: ValidationMessage[] = []
      
      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      renderHook(() => usePrefixValidation('test/prefix'))

      expect(mockUseValidationStore).toHaveBeenCalledTimes(1)
      expect(mockUseValidationStore).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should react to changes in validation store', () => {
      let messages: ValidationMessage[] = []
      
      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result, rerender } = renderHook(() => usePrefixValidation('test/prefix'))

      expect(result.current.hasErrors).toBe(false)

      // Simulate store update
      messages = [
        {
          path: 'test/prefix/field1',
          message: 'Error message',
          severity: 'error',
        },
      ]

      rerender()

      expect(result.current.hasErrors).toBe(true)
    })
  })

  describe('performance and memoization', () => {
    it('should return consistent results for same inputs', () => {
      const messages: ValidationMessage[] = [
        {
          path: 'test/prefix/field1',
          message: 'Error message',
          severity: 'error',
        },
      ]

      mockUseValidationStore.mockImplementation((selector) => {
        const mockState = { messages }
        return selector(mockState)
      })

      const { result, rerender } = renderHook(() => usePrefixValidation('test/prefix'))

      const firstResult = result.current

      rerender()

      expect(result.current.hasErrors).toBe(firstResult.hasErrors)
    })
  })
})
