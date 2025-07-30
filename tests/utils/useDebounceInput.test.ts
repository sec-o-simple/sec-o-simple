import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Unmock the module to test the actual implementation
vi.unmock('@/utils/useDebounceInput')
import { useDebounceInput } from '../../src/utils/useDebounceInput'

describe('useDebounceInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with empty string by default', () => {
    const { result } = renderHook(() => useDebounceInput({}))
    
    expect(result.current.value).toBe('')
    expect(result.current.isDebouncing).toBe(false)
  })

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => 
      useDebounceInput({ value: 'initial' })
    )
    
    expect(result.current.value).toBe('initial')
    expect(result.current.isDebouncing).toBe(false)
  })

  it('should update value when prop value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounceInput({ value }),
      { initialProps: { value: 'initial' } }
    )
    
    expect(result.current.value).toBe('initial')
    
    rerender({ value: 'updated' })
    
    expect(result.current.value).toBe('updated')
  })

  describe('handleChange', () => {
    it('should update value immediately and set debouncing state', () => {
      const { result } = renderHook(() => useDebounceInput({}))
      
      const mockEvent = {
        target: { value: 'new value' },
        currentTarget: { value: 'new value' }
      } as React.ChangeEvent<HTMLInputElement>
      
      act(() => {
        result.current.handleChange(mockEvent)
      })
      
      expect(result.current.value).toBe('new value')
      expect(result.current.isDebouncing).toBe(true)
    })

    it('should call onChange after debounce timeout', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useDebounceInput({ onChange }))
      
      const mockEvent = {
        target: { value: 'debounced value' },
        currentTarget: { value: 'debounced value' }
      } as React.ChangeEvent<HTMLInputElement>
      
      act(() => {
        result.current.handleChange(mockEvent)
      })
      
      expect(onChange).not.toHaveBeenCalled()
      expect(result.current.isDebouncing).toBe(true)
      
      act(() => {
        vi.advanceTimersByTime(400)
      })
      
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
        target: { value: 'debounced value' }
      }))
      expect(result.current.isDebouncing).toBe(false)
    })

    it('should reset timeout on subsequent changes', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useDebounceInput({ onChange }))
      
      // First change
      act(() => {
        result.current.handleChange({
          target: { value: 'first' }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      
      // Advance time partially
      act(() => {
        vi.advanceTimersByTime(200)
      })
      
      // Second change should reset the timer
      act(() => {
        result.current.handleChange({
          target: { value: 'second' }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      
      // Advance time by 200ms (total 400ms from first change, 200ms from second)
      act(() => {
        vi.advanceTimersByTime(200)
      })
      
      // Should not have called onChange yet
      expect(onChange).not.toHaveBeenCalled()
      
      // Advance remaining 200ms to complete the second timeout
      act(() => {
        vi.advanceTimersByTime(200)
      })
      
      // Should now call onChange with the second value
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
        target: { value: 'second' }
      }))
    })
  })

  describe('handleBlur', () => {
    it('should call onBlur callback', () => {
      const onBlur = vi.fn()
      const { result } = renderHook(() => useDebounceInput({ onBlur }))
      
      const mockEvent = {
        target: { value: 'blur value' }
      } as React.FocusEvent<HTMLInputElement>
      
      act(() => {
        result.current.handleBlur(mockEvent)
      })
      
      expect(onBlur).toHaveBeenCalledWith(mockEvent)
    })

    it('should trigger onChange immediately if debouncing', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useDebounceInput({ onChange }))
      
      // Start debouncing
      act(() => {
        result.current.handleChange({
          target: { value: 'pending value' }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      
      expect(result.current.isDebouncing).toBe(true)
      expect(onChange).not.toHaveBeenCalled()
      
      // Trigger blur
      act(() => {
        result.current.handleBlur({
          target: { value: 'pending value' }
        } as React.FocusEvent<HTMLInputElement>)
      })
      
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
        target: { value: 'pending value' }
      }))
      expect(result.current.isDebouncing).toBe(false)
    })

    it('should clear pending timeout on blur', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useDebounceInput({ onChange }))
      
      // Start debouncing
      act(() => {
        result.current.handleChange({
          target: { value: 'pending value' }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      
      // Blur before timeout completes
      act(() => {
        result.current.handleBlur({
          target: { value: 'pending value' }
        } as React.FocusEvent<HTMLInputElement>)
      })
      
      // Advance time past original timeout
      act(() => {
        vi.advanceTimersByTime(500)
      })
      
      // onChange should only have been called once (from blur)
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('should not trigger onChange if not debouncing', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useDebounceInput({ onChange }))
      
      // Blur without any pending changes
      act(() => {
        result.current.handleBlur({
          target: { value: 'blur value' }
        } as React.FocusEvent<HTMLInputElement>)
      })
      
      expect(onChange).not.toHaveBeenCalled()
      expect(result.current.isDebouncing).toBe(false)
    })
  })

  describe('cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { result, unmount } = renderHook(() => useDebounceInput({}))
      
      // Start debouncing
      act(() => {
        result.current.handleChange({
          target: { value: 'pending value' }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      
      // Unmount before timeout completes
      unmount()
      
      // This should not throw or cause issues
      act(() => {
        vi.advanceTimersByTime(500)
      })
    })
  })
})
