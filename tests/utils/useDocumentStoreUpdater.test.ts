import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

// Mock all dependencies
vi.mock('@/utils/useConfigStore')
vi.mock('@/utils/useDocumentStore')
vi.mock('@/utils/useProductTreeBranch')
vi.mock('@/utils/validation/documentValidator')
vi.mock('@/utils/validation/useValidationStore')

import { useConfigStore } from '../../src/utils/useConfigStore'
import useDocumentStore from '../../src/utils/useDocumentStore'
import { useProductTreeBranch } from '../../src/utils/useProductTreeBranch'
import { validateDocument } from '../../src/utils/validation/documentValidator'
import useValidationStore from '../../src/utils/validation/useValidationStore'

// Import the hooks to test
vi.unmock('@/utils/useDocumentStoreUpdater')
import useDocumentStoreUpdater, { 
  useDocumentValidation, 
  useDocumentStoreUpdaterProps 
} from '../../src/utils/useDocumentStoreUpdater'

// Mock data types
interface TestData {
  id: string
  name: string
  value: number
}

describe('useDocumentStoreUpdater', () => {
  // Mock functions
  const mockInit = vi.fn()
  const mockShouldUpdate = vi.fn()
  const mockUpdateDocumentStoreValue = vi.fn()
  const mockGetFullProductName = vi.fn()
  const mockGetRelationshipFullProductName = vi.fn()
  const mockSetValidationState = vi.fn()
  const mockSetIsValidating = vi.fn()

  const mockConfig = { test: 'config' }
  const mockDocumentStoreValue: TestData = { id: '1', name: 'test', value: 10 }
  const mockDocumentStore = { documents: [], products: [] }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock implementations
    vi.mocked(useConfigStore).mockReturnValue(mockConfig)
    vi.mocked(useDocumentStore).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        const mockState = {
          testField: mockDocumentStoreValue,
          updateTestField: mockUpdateDocumentStoreValue,
          documents: [],
          products: [],
        }
        return selector(mockState)
      }
      return mockDocumentStore
    })

    vi.mocked(useProductTreeBranch).mockReturnValue({
      rootBranch: [],
      findProductTreeBranch: vi.fn(),
      findProductTreeBranchWithParents: vi.fn(),
      getFullProductName: mockGetFullProductName,
      getRelationshipFullProductName: mockGetRelationshipFullProductName,
      getFilteredPTBs: vi.fn(),
      getPTBsByCategory: vi.fn(),
      getSelectableRefs: vi.fn(),
      getGroupedSelectableRefs: vi.fn(),
      addPTB: vi.fn(),
      updatePTB: vi.fn(),
      deletePTB: vi.fn(),
    })

    vi.mocked(validateDocument).mockResolvedValue({
      isValid: true,
      messages: [],
    })

    vi.mocked(useValidationStore).mockImplementation((selector: any) => {
      const mockState = {
        setValidationState: mockSetValidationState,
        setIsValidating: mockSetIsValidating,
      }
      return selector(mockState)
    })

    mockShouldUpdate.mockReturnValue(true)
  })

  describe('useDocumentStoreUpdater hook', () => {
    it('should initialize with correct props and call init when config is available', () => {
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: { name: 'updated' },
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(mockInit).toHaveBeenCalledWith(mockDocumentStoreValue)
      expect(useConfigStore).toHaveBeenCalled()
      expect(useDocumentStore).toHaveBeenCalled()
    })

    it('should not call init when config is not available', () => {
      vi.mocked(useConfigStore).mockReturnValue(null)

      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: { name: 'updated' },
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(mockInit).not.toHaveBeenCalled()
    })

    it('should update document store with merged data by default', () => {
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: { name: 'updated' },
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'updated',
      })
    })

    it('should update document store with replaced data when mergeUpdate is false', () => {
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: { name: 'updated' },
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
        mergeUpdate: false,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        name: 'updated',
      })
    })

    it('should handle tuple localState with trigger and callback', () => {
      const mockCallback = vi.fn().mockReturnValue({ name: 'callback-updated' })
      const trigger = 'trigger-value'

      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: [trigger, mockCallback],
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(mockCallback).toHaveBeenCalled()
      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'callback-updated',
      })
    })

    it('should respect shouldUpdate condition when provided', () => {
      mockShouldUpdate.mockReturnValue(false)

      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: { name: 'updated' },
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
        shouldUpdate: mockShouldUpdate,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(mockShouldUpdate).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'updated',
      })
      expect(mockUpdateDocumentStoreValue).not.toHaveBeenCalled()
    })

    it('should update when shouldUpdate returns true', () => {
      mockShouldUpdate.mockReturnValue(true)

      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: { name: 'updated' },
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
        shouldUpdate: mockShouldUpdate,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(mockShouldUpdate).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'updated',
      })
      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'updated',
      })
    })

    it('should update when no shouldUpdate is provided', () => {
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: { name: 'updated' },
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'updated',
      })
    })

    it('should handle localState changes and trigger updates', () => {
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: { name: 'initial' },
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      const { rerender } = renderHook(
        (currentProps) => useDocumentStoreUpdater(currentProps),
        { initialProps: props }
      )

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'initial',
      })

      mockUpdateDocumentStoreValue.mockClear()

      // Update localState
      rerender({
        ...props,
        localState: { name: 'changed' },
      })

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'changed',
      })
    })

    it('should handle tuple localState changes correctly', () => {
      const mockCallback = vi.fn().mockReturnValue({ name: 'callback1' })
      let trigger = 1

      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: [trigger, mockCallback],
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      const { rerender } = renderHook(
        (currentProps) => useDocumentStoreUpdater(currentProps),
        { initialProps: props }
      )

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'callback1',
      })

      mockUpdateDocumentStoreValue.mockClear()
      mockCallback.mockReturnValue({ name: 'callback2' })
      trigger = 2

      // Update trigger
      rerender({
        ...props,
        localState: [trigger, mockCallback],
      })

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'callback2',
      })
    })
  })

  describe('useDocumentValidation hook', () => {
    beforeEach(() => {
      vi.mocked(useDocumentStore).mockReturnValue(mockDocumentStore)
    })

    it('should call validation on mount', async () => {
      renderHook(() => useDocumentValidation())

      expect(mockSetIsValidating).toHaveBeenCalledWith(true)
      
      // Wait for async validation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(validateDocument).toHaveBeenCalledWith(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig
      )
      expect(mockSetValidationState).toHaveBeenCalledWith({
        isValid: true,
        messages: [],
      })
      expect(mockSetIsValidating).toHaveBeenCalledWith(false)
    })

    it('should handle validation completion with finally block', async () => {
      // Test the finally block execution path
      vi.mocked(validateDocument).mockResolvedValue({
        isValid: false,
        messages: [{ path: 'test', message: 'error', severity: 'error' }],
      })

      renderHook(() => useDocumentValidation())

      expect(mockSetIsValidating).toHaveBeenCalledWith(true)
      
      // Wait for async validation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      expect(validateDocument).toHaveBeenCalledWith(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig
      )
      expect(mockSetValidationState).toHaveBeenCalledWith({
        isValid: false,
        messages: [{ path: 'test', message: 'error', severity: 'error' }],
      })
      expect(mockSetIsValidating).toHaveBeenCalledWith(false)
    })

    it('should re-validate when document store changes', async () => {
      const { rerender } = renderHook(() => useDocumentValidation())

      // Clear initial calls
      vi.clearAllMocks()

      // Change document store
      const newDocumentStore = { documents: ['new'], products: ['new'] }
      vi.mocked(useDocumentStore).mockReturnValue(newDocumentStore)

      rerender()

      // Wait for async validation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(validateDocument).toHaveBeenCalledWith(
        newDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig
      )
    })

    it('should use JSON.stringify to track document store changes', async () => {
      const store1 = { documents: ['a'], products: ['b'] }
      const store2 = { documents: ['a'], products: ['b'] } // Same content
      const store3 = { documents: ['c'], products: ['d'] } // Different content

      vi.mocked(useDocumentStore).mockReturnValue(store1)

      const { rerender } = renderHook(() => useDocumentValidation())

      // Clear initial calls
      vi.clearAllMocks()

      // Same content, different object reference - should not trigger validation
      vi.mocked(useDocumentStore).mockReturnValue(store2)
      rerender()

      expect(validateDocument).not.toHaveBeenCalled()

      // Different content - should trigger validation
      vi.mocked(useDocumentStore).mockReturnValue(store3)
      rerender()

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(validateDocument).toHaveBeenCalledWith(
        store3,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig
      )
    })
  })

  describe('getStateObject utility (internal)', () => {
    // These tests cover the internal getStateObject function through the public API

    it('should handle regular state object', () => {
      const state = { name: 'test', value: 42 }
      
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: state,
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        ...state,
      })
    })

    it('should handle tuple with trigger and callback', () => {
      const callback = vi.fn().mockReturnValue({ name: 'from-callback' })
      const trigger = 'test-trigger'
      
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: [trigger, callback],
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(callback).toHaveBeenCalled()
      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'from-callback',
      })
    })

    it('should handle invalid tuple (not length 2)', () => {
      const invalidTuple = ['only-one-item'] as any
      
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: invalidTuple,
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      // Should treat as regular state object
      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        ...invalidTuple,
      })
    })

    it('should handle tuple with non-function second element', () => {
      const invalidTuple = ['trigger', 'not-a-function'] as any
      
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: invalidTuple,
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      // Should treat as regular state object
      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        ...invalidTuple,
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle empty localState', () => {
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: {},
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      renderHook(() => useDocumentStoreUpdater(props))

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith(mockDocumentStoreValue)
    })

    it('should handle null/undefined in localState gracefully', () => {
      const props: useDocumentStoreUpdaterProps<TestData> = {
        localState: null as any,
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: mockInit,
      }

      expect(() => renderHook(() => useDocumentStoreUpdater(props))).not.toThrow()
    })

    it('should handle config changes correctly', () => {
      const { rerender } = renderHook(() => {
        const props: useDocumentStoreUpdaterProps<TestData> = {
          localState: { name: 'test' },
          valueField: 'testField' as any,
          valueUpdater: 'updateTestField' as any,
          init: mockInit,
        }
        return useDocumentStoreUpdater(props)
      })

      expect(mockInit).toHaveBeenCalledTimes(1)

      // Clear and change config
      mockInit.mockClear()
      const newConfig = { test: 'new-config' }
      vi.mocked(useConfigStore).mockReturnValue(newConfig)

      rerender()

      expect(mockInit).toHaveBeenCalledTimes(1)
      expect(mockInit).toHaveBeenCalledWith(mockDocumentStoreValue)
    })

    it('should handle documentStoreValue changes', () => {
      const newDocumentStoreValue: TestData = { id: '2', name: 'new', value: 20 }
      
      const { rerender } = renderHook(() => {
        const props: useDocumentStoreUpdaterProps<TestData> = {
          localState: { name: 'updated' },
          valueField: 'testField' as any,
          valueUpdater: 'updateTestField' as any,
          init: mockInit,
        }
        return useDocumentStoreUpdater(props)
      })

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...mockDocumentStoreValue,
        name: 'updated',
      })

      // Clear and change document store value
      mockUpdateDocumentStoreValue.mockClear()
      vi.mocked(useDocumentStore).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const mockState = {
            testField: newDocumentStoreValue,
            updateTestField: mockUpdateDocumentStoreValue,
          }
          return selector(mockState)
        }
        return mockDocumentStore
      })

      rerender()

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...newDocumentStoreValue,
        name: 'updated',
      })
    })
  })

  describe('type safety and prop validation', () => {
    it('should work with different data types', () => {
      interface StringData {
        text: string
      }

      const stringProps: useDocumentStoreUpdaterProps<StringData> = {
        localState: { text: 'hello' },
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: vi.fn(),
      }

      expect(() => renderHook(() => useDocumentStoreUpdater(stringProps))).not.toThrow()
    })

    it('should work with complex nested objects', () => {
      interface ComplexData {
        nested: {
          deep: {
            value: string
          }
        }
        array: number[]
      }

      const complexData: ComplexData = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, 3]
      }

      vi.mocked(useDocumentStore).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          const mockState = {
            testField: complexData,
            updateTestField: mockUpdateDocumentStoreValue,
          }
          return selector(mockState)
        }
        return mockDocumentStore
      })

      const complexProps: useDocumentStoreUpdaterProps<ComplexData> = {
        localState: { nested: { deep: { value: 'updated' } } },
        valueField: 'testField' as any,
        valueUpdater: 'updateTestField' as any,
        init: vi.fn(),
      }

      renderHook(() => useDocumentStoreUpdater(complexProps))

      expect(mockUpdateDocumentStoreValue).toHaveBeenCalledWith({
        ...complexData,
        nested: { deep: { value: 'updated' } }
      })
    })
  })
})
