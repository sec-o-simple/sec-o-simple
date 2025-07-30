import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useListState } from '../../src/utils/useListState'

interface TestItem {
  id: string
  name: string
  value: number
}

describe('useListState', () => {
  const mockItems: TestItem[] = [
    { id: '1', name: 'Item 1', value: 10 },
    { id: '2', name: 'Item 2', value: 20 },
    { id: '3', name: 'Item 3', value: 30 },
  ]

  describe('initialization', () => {
    it('should initialize with empty array by default', () => {
      const { result } = renderHook(() => useListState<TestItem>())
      
      expect(result.current.data).toEqual([])
    })

    it('should initialize with provided initial data', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ initialData: mockItems })
      )
      
      expect(result.current.data).toEqual(mockItems)
    })

    it('should use default id key if not provided', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ initialData: mockItems })
      )
      
      expect(result.current.getId(mockItems[0])).toBe('1')
    })

    it('should use custom id key when provided', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ 
          initialData: mockItems,
          idKey: 'name'
        })
      )
      
      expect(result.current.getId(mockItems[0])).toBe('Item 1')
    })

    it('should use function as id key', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ 
          initialData: mockItems,
          idKey: (item) => `${item.id}-${item.name}`
        })
      )
      
      expect(result.current.getId(mockItems[0])).toBe('1-Item 1')
    })
  })

  describe('updateDataEntry', () => {
    it('should update existing entry', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ initialData: mockItems })
      )
      
      const updatedItem = { ...mockItems[0], name: 'Updated Item 1' }
      
      act(() => {
        result.current.updateDataEntry(updatedItem)
      })
      
      expect(result.current.data[0]).toEqual(updatedItem)
      expect(result.current.data[1]).toEqual(mockItems[1])
      expect(result.current.data[2]).toEqual(mockItems[2])
    })

    it('should not affect other entries when updating', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ initialData: mockItems })
      )
      
      const updatedItem = { ...mockItems[1], value: 999 }
      
      act(() => {
        result.current.updateDataEntry(updatedItem)
      })
      
      expect(result.current.data).toHaveLength(3)
      expect(result.current.data[0]).toEqual(mockItems[0])
      expect(result.current.data[1]).toEqual(updatedItem)
      expect(result.current.data[2]).toEqual(mockItems[2])
    })
  })

  describe('removeDataEntry', () => {
    it('should remove entry from data', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ initialData: mockItems })
      )
      
      act(() => {
        result.current.removeDataEntry(mockItems[1])
      })
      
      expect(result.current.data).toHaveLength(2)
      expect(result.current.data).toEqual([mockItems[0], mockItems[2]])
    })

    it('should call onRemove callback when provided', () => {
      const onRemove = vi.fn()
      const { result } = renderHook(() => 
        useListState<TestItem>({ 
          initialData: mockItems,
          onRemove
        })
      )
      
      act(() => {
        result.current.removeDataEntry(mockItems[0])
      })
      
      expect(onRemove).toHaveBeenCalledWith(mockItems[0])
    })

    it('should not call onRemove if not provided', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ initialData: mockItems })
      )
      
      expect(() => {
        act(() => {
          result.current.removeDataEntry(mockItems[0])
        })
      }).not.toThrow()
    })
  })

  describe('addDataEntry', () => {
    it('should add entry from object generator', () => {
      const newItem = { id: '4', name: 'New Item', value: 40 }
      const { result } = renderHook(() => 
        useListState<TestItem>({ 
          initialData: mockItems,
          generator: newItem
        })
      )
      
      act(() => {
        const added = result.current.addDataEntry()
        expect(added).toEqual(newItem)
      })
      
      expect(result.current.data).toHaveLength(4)
      expect(result.current.data[3]).toEqual(newItem)
    })

    it('should add entry from function generator', () => {
      let counter = 0
      const generator = () => ({
        id: `gen-${++counter}`,
        name: `Generated ${counter}`,
        value: counter * 10
      })
      
      const { result } = renderHook(() => 
        useListState<TestItem>({ 
          initialData: mockItems,
          generator
        })
      )
      
      act(() => {
        const added = result.current.addDataEntry()
        expect(added).toEqual({ id: 'gen-1', name: 'Generated 1', value: 10 })
      })
      
      expect(result.current.data).toHaveLength(4)
      expect(result.current.data[3]).toEqual({ id: 'gen-1', name: 'Generated 1', value: 10 })
    })

    it('should return undefined if no generator provided', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ initialData: mockItems })
      )
      
      act(() => {
        const added = result.current.addDataEntry()
        expect(added).toBeUndefined()
      })
      
      expect(result.current.data).toHaveLength(3)
    })

    it('should return undefined if generator returns undefined', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ 
          initialData: mockItems,
          generator: undefined
        })
      )
      
      act(() => {
        const added = result.current.addDataEntry()
        expect(added).toBeUndefined()
      })
      
      expect(result.current.data).toHaveLength(3)
    })
  })

  describe('setData', () => {
    it('should allow direct data manipulation', () => {
      const { result } = renderHook(() => 
        useListState<TestItem>({ initialData: mockItems })
      )
      
      const newData = [{ id: 'new', name: 'New', value: 100 }]
      
      act(() => {
        result.current.setData(newData)
      })
      
      expect(result.current.data).toEqual(newData)
    })
  })
})
