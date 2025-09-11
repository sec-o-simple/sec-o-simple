import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  UpdatePriority,
  useStateInitializer,
} from '../../src/utils/useStateInitializer'

describe('useStateInitializer', () => {
  it('should return updateState function', () => {
    const { result } = renderHook(() => useStateInitializer())

    expect(result.current).toHaveProperty('updateState')
    expect(typeof result.current.updateState).toBe('function')
  })

  it('should execute callback when priority is higher than current state', () => {
    const { result } = renderHook(() => useStateInitializer())
    const mockCallback = vi.fn()

    act(() => {
      result.current.updateState(UpdatePriority.Low, mockCallback)
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('should not execute callback when priority is lower than current state', () => {
    const { result } = renderHook(() => useStateInitializer())
    const mockCallback1 = vi.fn()
    const mockCallback2 = vi.fn()

    // First call with Normal priority
    act(() => {
      result.current.updateState(UpdatePriority.Normal, mockCallback1)
    })

    // Second call with Low priority should not execute
    act(() => {
      result.current.updateState(UpdatePriority.Low, mockCallback2)
    })

    expect(mockCallback1).toHaveBeenCalledTimes(1)
    expect(mockCallback2).not.toHaveBeenCalled()
  })

  it('should not execute callback when priority is equal to current state', () => {
    const { result } = renderHook(() => useStateInitializer())
    const mockCallback1 = vi.fn()
    const mockCallback2 = vi.fn()

    // First call with Normal priority
    act(() => {
      result.current.updateState(UpdatePriority.Normal, mockCallback1)
    })

    // Second call with same priority should not execute
    act(() => {
      result.current.updateState(UpdatePriority.Normal, mockCallback2)
    })

    expect(mockCallback1).toHaveBeenCalledTimes(1)
    expect(mockCallback2).not.toHaveBeenCalled()
  })

  it('should maintain priority state across multiple calls', () => {
    const { result } = renderHook(() => useStateInitializer())
    const mockCallbackLow = vi.fn()
    const mockCallbackNormal = vi.fn()
    const mockCallbackLow2 = vi.fn()

    // First call with Low priority
    act(() => {
      result.current.updateState(UpdatePriority.Low, mockCallbackLow)
    })

    // Second call with Normal priority (higher)
    act(() => {
      result.current.updateState(UpdatePriority.Normal, mockCallbackNormal)
    })

    // Third call with Low priority again (lower than current state)
    act(() => {
      result.current.updateState(UpdatePriority.Low, mockCallbackLow2)
    })

    expect(mockCallbackLow).toHaveBeenCalledTimes(1)
    expect(mockCallbackNormal).toHaveBeenCalledTimes(1)
    expect(mockCallbackLow2).not.toHaveBeenCalled()
  })

  it('should handle multiple sequential priority upgrades', () => {
    const { result } = renderHook(() => useStateInitializer())
    const callbacks = [vi.fn(), vi.fn(), vi.fn()]

    // First call with low priority
    act(() => {
      result.current.updateState(UpdatePriority.Low, callbacks[0])
    })

    // Second call with higher priority - should execute
    act(() => {
      result.current.updateState(UpdatePriority.Normal, callbacks[1])
    })

    // Third call with same priority - should not execute
    act(() => {
      result.current.updateState(UpdatePriority.Normal, callbacks[2])
    })

    expect(callbacks[0]).toHaveBeenCalledTimes(1)
    expect(callbacks[1]).toHaveBeenCalledTimes(1)
    expect(callbacks[2]).not.toHaveBeenCalled()
  })

  it('should correctly handle UpdatePriority enum values', () => {
    expect(UpdatePriority.Low).toBe(1)
    expect(UpdatePriority.Normal).toBe(2)
    expect(UpdatePriority.Low < UpdatePriority.Normal).toBe(true)
  })

  it('should execute callback immediately when initial state is 0', () => {
    const { result } = renderHook(() => useStateInitializer())
    const mockCallback = vi.fn()

    // Initial state should be 0, so any positive priority should execute
    act(() => {
      result.current.updateState(UpdatePriority.Low, mockCallback)
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)
  })
})
