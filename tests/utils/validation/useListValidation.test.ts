import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useListValidation } from '../../../src/utils/validation/useListValidation'

// Mock the dependencies
vi.mock('../../../src/utils/validation/useFieldValidation')
vi.mock('../../../src/utils/validation/useValidationStore')

import { useFieldValidation } from '../../../src/utils/validation/useFieldValidation'
import useValidationStore from '../../../src/utils/validation/useValidationStore'

const mockUseFieldValidation = vi.mocked(useFieldValidation)
const mockUseValidationStore = vi.mocked(useValidationStore)

describe('useListValidation', () => {
  let mockMarkFieldAsTouched: Mock
  let mockFieldValidationResult: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockMarkFieldAsTouched = vi.fn()
    
    // Mock the field validation result
    mockFieldValidationResult = {
      messages: [],
      hasErrors: false,
      hasWarnings: false,
      hasInfos: false,
      errorMessages: [],
      warningMessages: [],
      infoMessages: [],
      isTouched: false,
      markFieldAsTouched: mockMarkFieldAsTouched,
    }
    
    mockUseFieldValidation.mockReturnValue(mockFieldValidationResult)
    mockUseValidationStore.mockReturnValue(mockMarkFieldAsTouched)
  })

  describe('basic functionality', () => {
    it('should call useFieldValidation with the provided listPath', () => {
      const listPath = 'test.list.path'
      const data = ['item1', 'item2']

      renderHook(() => useListValidation(listPath, data))

      expect(mockUseFieldValidation).toHaveBeenCalledWith(listPath)
    })

    it('should call useValidationStore with the correct selector', () => {
      const listPath = 'test.path'
      const data = []

      renderHook(() => useListValidation(listPath, data))

      expect(mockUseValidationStore).toHaveBeenCalledWith(
        expect.any(Function)
      )
      
      // Test the selector function
      const selectorCall = mockUseValidationStore.mock.calls[0][0]
      const mockState = { 
        markFieldAsTouched: mockMarkFieldAsTouched,
        messages: [],
        touchedFields: new Set<string>(),
        visitedPages: new Set<string>(),
        isValidating: false,
        isValid: true,
        getMessagesForPath: vi.fn(),
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
      const result = selectorCall(mockState)
      expect(result).toBe(mockMarkFieldAsTouched)
    })

    it('should return the result from useFieldValidation', () => {
      const listPath = 'test.path'
      const data = []

      const { result } = renderHook(() => useListValidation(listPath, data))

      expect(result.current).toBe(mockFieldValidationResult)
    })
  })

  describe('markFieldAsTouched behavior', () => {
    it('should mark field as touched when data has items', () => {
      const listPath = 'test.list.path'
      const data = ['item1', 'item2', 'item3']

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should not mark field as touched when data is empty', () => {
      const listPath = 'test.list.path'
      const data: unknown[] = []

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).not.toHaveBeenCalled()
    })

    it('should mark field as touched when data length is exactly 1', () => {
      const listPath = 'test.list.path'
      const data = ['single-item']

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should handle data with different types of elements', () => {
      const listPath = 'mixed.data.path'
      const data = ['string', 123, { key: 'value' }, null, undefined, true]

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })
  })

  describe('useEffect dependency behavior', () => {
    it('should call markFieldAsTouched when data changes from empty to non-empty', () => {
      const listPath = 'test.path'
      let data: unknown[] = []

      const { rerender } = renderHook(
        ({ path, items }: { path: string; items: unknown[] }) => useListValidation(path, items),
        { initialProps: { path: listPath, items: data } }
      )

      expect(mockMarkFieldAsTouched).not.toHaveBeenCalled()

      // Change data to non-empty
      data = ['new-item']
      rerender({ path: listPath, items: data })

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should call markFieldAsTouched again when data changes from non-empty to different non-empty', () => {
      const listPath = 'test.path'
      const initialData = ['item1']

      const { rerender } = renderHook(
        ({ path, items }: { path: string; items: unknown[] }) => useListValidation(path, items),
        { initialProps: { path: listPath, items: initialData as unknown[] } }
      )

      expect(mockMarkFieldAsTouched).toHaveBeenCalledTimes(1)
      vi.clearAllMocks()

      // Change data to different non-empty array
      const newData = ['item1', 'item2']
      rerender({ path: listPath, items: newData as unknown[] })

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should not call markFieldAsTouched when data changes from non-empty to empty', () => {
      const listPath = 'test.path'
      const initialData = ['item1', 'item2']

      const { rerender } = renderHook(
        ({ path, items }: { path: string; items: unknown[] }) => useListValidation(path, items),
        { initialProps: { path: listPath, items: initialData as unknown[] } }
      )

      expect(mockMarkFieldAsTouched).toHaveBeenCalledTimes(1)
      vi.clearAllMocks()

      // Change data to empty
      const emptyData: unknown[] = []
      rerender({ path: listPath, items: emptyData })

      expect(mockMarkFieldAsTouched).not.toHaveBeenCalled()
    })

    it('should call markFieldAsTouched when listPath changes', () => {
      const initialPath = 'initial.path'
      const data = ['item1']

      const { rerender } = renderHook(
        ({ path, items }: { path: string; items: unknown[] }) => useListValidation(path, items),
        { initialProps: { path: initialPath, items: data as unknown[] } }
      )

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(initialPath)
      vi.clearAllMocks()

      // Change path
      const newPath = 'new.path'
      rerender({ path: newPath, items: data as unknown[] })

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(newPath)
    })

    it('should handle markFieldAsTouched function changing', () => {
      const listPath = 'test.path'
      const data = ['item1']

      const { rerender } = renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledTimes(1)

      // Create new mock function and update the store mock
      const newMarkFieldAsTouched = vi.fn()
      mockUseValidationStore.mockReturnValue(newMarkFieldAsTouched)

      rerender()

      expect(newMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })
  })

  describe('edge cases and different data types', () => {
    it('should handle array with null and undefined values', () => {
      const listPath = 'null.undefined.path'
      const data = [null, undefined]

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should handle array with boolean values', () => {
      const listPath = 'boolean.path'
      const data = [true, false, true]

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should handle array with number values including zero', () => {
      const listPath = 'number.path'
      const data = [0, 1, -1, 3.14]

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should handle array with empty strings', () => {
      const listPath = 'empty.strings.path'
      const data = ['', '', '']

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should handle array with complex objects', () => {
      const listPath = 'complex.objects.path'
      const data = [
        { id: 1, name: 'Object 1' },
        { nested: { deep: { value: 'test' } } },
        { array: [1, 2, 3] }
      ]

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should handle very large arrays', () => {
      const listPath = 'large.array.path'
      const data = Array.from({ length: 1000 }, (_, i) => `item-${i}`)

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should handle special characters in listPath', () => {
      const listPath = 'special.@#$%^&*()_+-={}[]|\\:";\'<>?,./.path'
      const data = ['item']

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })

    it('should handle empty string as listPath', () => {
      const listPath = ''
      const data = ['item']

      renderHook(() => useListValidation(listPath, data))

      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(listPath)
    })
  })

  describe('integration with useFieldValidation', () => {
    it('should pass different listPath values to useFieldValidation', () => {
      const paths = [
        'path1',
        'deeply.nested.path',
        'array[0].item',
        'complex.path.with.numbers.123'
      ]

      paths.forEach(path => {
        vi.clearAllMocks()
        renderHook(() => useListValidation(path, ['item']))
        expect(mockUseFieldValidation).toHaveBeenCalledWith(path)
      })
    })

    it('should return different validation results based on field validation', () => {
      const listPath = 'test.path'
      const data = ['item']

      // Mock different validation results
      const validationWithErrors = {
        ...mockFieldValidationResult,
        hasErrors: true,
        errorMessages: [{ text: 'Error message', severity: 'error' as const }]
      }

      mockUseFieldValidation.mockReturnValue(validationWithErrors)

      const { result } = renderHook(() => useListValidation(listPath, data))

      expect(result.current.hasErrors).toBe(true)
      expect(result.current.errorMessages).toHaveLength(1)
    })
  })

  describe('multiple hook instances', () => {
    it('should handle multiple instances with different paths', () => {
      const path1 = 'path1'
      const path2 = 'path2'
      const data1 = ['item1']
      const data2 = ['item2', 'item3']

      renderHook(() => useListValidation(path1, data1))
      renderHook(() => useListValidation(path2, data2))

      expect(mockUseFieldValidation).toHaveBeenCalledWith(path1)
      expect(mockUseFieldValidation).toHaveBeenCalledWith(path2)
      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(path1)
      expect(mockMarkFieldAsTouched).toHaveBeenCalledWith(path2)
    })

    it('should handle multiple instances with same path but different data', () => {
      const listPath = 'same.path'
      const data1 = ['item1']
      const data2: unknown[] = []

      renderHook(() => useListValidation(listPath, data1))
      renderHook(() => useListValidation(listPath, data2))

      expect(mockUseFieldValidation).toHaveBeenCalledTimes(2)
      expect(mockMarkFieldAsTouched).toHaveBeenCalledTimes(1) // Only called for non-empty data
    })
  })

  describe('performance and optimization', () => {
    it('should not cause unnecessary re-renders when data reference changes but content is same', () => {
      const listPath = 'test.path'
      const initialData = ['item1', 'item2']

      const { rerender } = renderHook(
        ({ items }: { items: unknown[] }) => useListValidation(listPath, items),
        { initialProps: { items: initialData as unknown[] } }
      )

      expect(mockMarkFieldAsTouched).toHaveBeenCalledTimes(1)
      vi.clearAllMocks()

      // Same content, different reference
      const sameContentData = ['item1', 'item2']
      rerender({ items: sameContentData as unknown[] })

      // markFieldAsTouched should still be called because the array reference changed
      // This is expected behavior with the current implementation
      expect(mockMarkFieldAsTouched).toHaveBeenCalledTimes(1)
    })

    it('should handle rapid data changes', () => {
      const listPath = 'rapid.changes.path'
      let data = ['initial']

      const { rerender } = renderHook(
        ({ items }: { items: unknown[] }) => useListValidation(listPath, items),
        { initialProps: { items: data as unknown[] } }
      )

      // Simulate rapid changes
      for (let i = 0; i < 10; i++) {
        data = [`item-${i}`]
        rerender({ items: data as unknown[] })
      }

      // Should be called 11 times (initial + 10 updates)
      expect(mockMarkFieldAsTouched).toHaveBeenCalledTimes(11)
    })
  })
})
