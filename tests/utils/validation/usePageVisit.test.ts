import { describe, it, expect, vi, beforeEach, Mock, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import usePageVisit from '../../../src/utils/validation/usePageVisit'

// Mock external dependencies
vi.mock('../../../src/utils/validation/useValidationStore')
vi.mock('react-router')

// Mock timers
vi.useFakeTimers()

import useValidationStore from '../../../src/utils/validation/useValidationStore'
import { useLocation } from 'react-router'

describe('usePageVisit', () => {
  let mockVisitPage: Mock
  let mockHasVisitedPage: Mock
  let mockUseLocation: Mock

  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()

    // Setup mocks
    mockVisitPage = vi.fn()
    mockHasVisitedPage = vi.fn()
    mockUseLocation = useLocation as Mock

    // Mock validation store
    ;(useValidationStore as unknown as Mock).mockImplementation((selector) => {
      const mockState = {
        visitPage: mockVisitPage,
        hasVisitedPage: mockHasVisitedPage,
        messages: [],
        touchedFields: new Set<string>(),
        visitedPages: new Set<string>(),
        isValidating: false,
        isValid: true,
        setValidationState: vi.fn(),
        setIsValidating: vi.fn(),
        markFieldAsTouched: vi.fn(),
        getMessagesForPath: vi.fn(),
        isFieldTouched: vi.fn(),
        reset: vi.fn(),
      }
      return selector(mockState)
    })

    // Default location mock
    mockUseLocation.mockReturnValue({
      pathname: '/test-path',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.useFakeTimers()
  })

  describe('basic functionality', () => {
    it('should return false initially for a new page', () => {
      mockHasVisitedPage.mockReturnValue(false)

      const { result } = renderHook(() => usePageVisit())

      expect(result.current).toBe(false)
      expect(mockHasVisitedPage).toHaveBeenCalledWith('/test-path')
    })

    it('should return true if page has been previously visited', () => {
      mockHasVisitedPage.mockReturnValue(true)

      const { result } = renderHook(() => usePageVisit())

      expect(result.current).toBe(true)
      expect(mockHasVisitedPage).toHaveBeenCalledWith('/test-path')
    })

    it('should call visitPage after 500ms delay', () => {
      mockHasVisitedPage.mockReturnValue(false)

      renderHook(() => usePageVisit())

      // Initially should not be called
      expect(mockVisitPage).not.toHaveBeenCalled()

      // Fast-forward time by 500ms
      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(mockVisitPage).toHaveBeenCalledWith('/test-path')
      expect(mockVisitPage).toHaveBeenCalledTimes(1)
    })

    it('should not call visitPage before 500ms delay', () => {
      mockHasVisitedPage.mockReturnValue(false)

      renderHook(() => usePageVisit())

      // Fast-forward time by 499ms (just before the delay)
      act(() => {
        vi.advanceTimersByTime(499)
      })

      expect(mockVisitPage).not.toHaveBeenCalled()

      // Fast-forward the remaining 1ms
      act(() => {
        vi.advanceTimersByTime(1)
      })

      expect(mockVisitPage).toHaveBeenCalledWith('/test-path')
    })
  })

  describe('location changes', () => {
    it('should handle location changes correctly', () => {
      mockHasVisitedPage.mockReturnValue(false)

      const { rerender } = renderHook(() => usePageVisit())

      // Initial location
      expect(mockHasVisitedPage).toHaveBeenCalledWith('/test-path')

      // Change location
      mockUseLocation.mockReturnValue({
        pathname: '/new-path',
        search: '',
        hash: '',
        state: null,
        key: 'new',
      })

      rerender()

      expect(mockHasVisitedPage).toHaveBeenCalledWith('/new-path')
    })

    it('should clear previous timeout and set new one on location change', () => {
      mockHasVisitedPage.mockReturnValue(false)

      const { rerender } = renderHook(() => usePageVisit())

      // Fast-forward time by 300ms
      act(() => {
        vi.advanceTimersByTime(300)
      })

      // visitPage should not be called yet
      expect(mockVisitPage).not.toHaveBeenCalled()

      // Change location
      mockUseLocation.mockReturnValue({
        pathname: '/new-path',
        search: '',
        hash: '',
        state: null,
        key: 'new',
      })

      rerender()

      // Fast-forward by another 300ms (600ms total from initial, but only 300ms from location change)
      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Should not be called yet because the timeout was reset
      expect(mockVisitPage).not.toHaveBeenCalled()

      // Fast-forward by remaining 200ms to complete the 500ms for new location
      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(mockVisitPage).toHaveBeenCalledWith('/new-path')
      expect(mockVisitPage).toHaveBeenCalledTimes(1)
    })

    it('should update visitedPage state when location changes to a previously visited page', () => {
      // Initially on a new page
      mockHasVisitedPage.mockReturnValueOnce(false)

      const { result, rerender } = renderHook(() => usePageVisit())

      expect(result.current).toBe(false)

      // Change to a previously visited page
      mockUseLocation.mockReturnValue({
        pathname: '/visited-page',
        search: '',
        hash: '',
        state: null,
        key: 'visited',
      })
      mockHasVisitedPage.mockReturnValueOnce(true)

      rerender()

      expect(result.current).toBe(true)
      expect(mockHasVisitedPage).toHaveBeenCalledWith('/visited-page')
    })

    it('should maintain visitedPage state when moving to a new unvisited page', () => {
      // Start on a previously visited page
      mockHasVisitedPage.mockReturnValueOnce(true)

      const { result, rerender } = renderHook(() => usePageVisit())

      expect(result.current).toBe(true)

      // Change to a new unvisited page
      mockUseLocation.mockReturnValue({
        pathname: '/new-unvisited-page',
        search: '',
        hash: '',
        state: null,
        key: 'new-unvisited',
      })
      mockHasVisitedPage.mockReturnValueOnce(false)

      rerender()

      // The state should remain true because the hook doesn't reset local state
      // It only sets it to true when hasVisitedPage returns true
      expect(result.current).toBe(true)
      expect(mockHasVisitedPage).toHaveBeenCalledWith('/new-unvisited-page')
    })
  })

  describe('cleanup behavior', () => {
    it('should cleanup timeout when component unmounts', () => {
      mockHasVisitedPage.mockReturnValue(false)

      const { unmount } = renderHook(() => usePageVisit())

      // Fast-forward time by 300ms
      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Unmount the component
      unmount()

      // Fast-forward past the original timeout
      act(() => {
        vi.advanceTimersByTime(300)
      })

      // visitPage should not be called because timeout was cleared
      expect(mockVisitPage).not.toHaveBeenCalled()
    })

    it('should cleanup timeout when location changes', () => {
      mockHasVisitedPage.mockReturnValue(false)

      const { rerender } = renderHook(() => usePageVisit())

      // Fast-forward time by 300ms
      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Change location (this should clear the previous timeout)
      mockUseLocation.mockReturnValue({
        pathname: '/another-path',
        search: '',
        hash: '',
        state: null,
        key: 'another',
      })

      rerender()

      // The original timeout should be cleared, so no call to visitPage for original path
      act(() => {
        vi.advanceTimersByTime(200) // 500ms total from original
      })

      expect(mockVisitPage).not.toHaveBeenCalledWith('/test-path')

      // But the new timeout should work
      act(() => {
        vi.advanceTimersByTime(300) // 500ms from location change
      })

      expect(mockVisitPage).toHaveBeenCalledWith('/another-path')
      expect(mockVisitPage).toHaveBeenCalledTimes(1)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined location pathname', () => {
      mockUseLocation.mockReturnValue({
        pathname: undefined,
        search: '',
        hash: '',
        state: null,
        key: 'undefined',
      })
      mockHasVisitedPage.mockReturnValue(false)

      const { result } = renderHook(() => usePageVisit())

      expect(result.current).toBe(false)
      expect(mockHasVisitedPage).toHaveBeenCalledWith(undefined)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(mockVisitPage).toHaveBeenCalledWith(undefined)
    })

    it('should handle empty string pathname', () => {
      mockUseLocation.mockReturnValue({
        pathname: '',
        search: '',
        hash: '',
        state: null,
        key: 'empty',
      })
      mockHasVisitedPage.mockReturnValue(false)

      const { result } = renderHook(() => usePageVisit())

      expect(result.current).toBe(false)
      expect(mockHasVisitedPage).toHaveBeenCalledWith('')

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(mockVisitPage).toHaveBeenCalledWith('')
    })

    it('should handle null location', () => {
      mockUseLocation.mockReturnValue(null)
      mockHasVisitedPage.mockReturnValue(false)

      expect(() => {
        renderHook(() => usePageVisit())
      }).toThrow()
    })

    it('should handle special characters in pathname', () => {
      const specialPath = '/test-path?query=1&param=2#section'
      mockUseLocation.mockReturnValue({
        pathname: specialPath,
        search: '?query=1&param=2',
        hash: '#section',
        state: null,
        key: 'special',
      })
      mockHasVisitedPage.mockReturnValue(false)

      renderHook(() => usePageVisit())

      expect(mockHasVisitedPage).toHaveBeenCalledWith(specialPath)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(mockVisitPage).toHaveBeenCalledWith(specialPath)
    })
  })

  describe('store function calls', () => {
    it('should call hasVisitedPage and visitPage with correct arguments', () => {
      const testPath = '/specific-test-path'
      mockUseLocation.mockReturnValue({
        pathname: testPath,
        search: '',
        hash: '',
        state: null,
        key: 'specific',
      })
      mockHasVisitedPage.mockReturnValue(false)

      renderHook(() => usePageVisit())

      expect(mockHasVisitedPage).toHaveBeenCalledWith(testPath)
      expect(mockHasVisitedPage).toHaveBeenCalledTimes(1)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(mockVisitPage).toHaveBeenCalledWith(testPath)
      expect(mockVisitPage).toHaveBeenCalledTimes(1)
    })

    it('should call store selectors correctly', () => {
      mockHasVisitedPage.mockReturnValue(false)

      renderHook(() => usePageVisit())

      expect(useValidationStore).toHaveBeenCalledTimes(2)
      expect(useValidationStore).toHaveBeenNthCalledWith(1, expect.any(Function))
      expect(useValidationStore).toHaveBeenNthCalledWith(2, expect.any(Function))
    })

    it('should handle hasVisitedPage returning true', () => {
      mockHasVisitedPage.mockReturnValue(true)

      const { result } = renderHook(() => usePageVisit())

      expect(result.current).toBe(true)
      expect(mockHasVisitedPage).toHaveBeenCalledWith('/test-path')

      // Should still set up the timeout to mark as visited
      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(mockVisitPage).toHaveBeenCalledWith('/test-path')
    })
  })

  describe('multiple rapid location changes', () => {
    it('should handle multiple rapid location changes correctly', () => {
      mockHasVisitedPage.mockReturnValue(false)

      const { rerender } = renderHook(() => usePageVisit())

      // Change location multiple times rapidly
      const paths = ['/path1', '/path2', '/path3', '/path4']

      paths.forEach((path, index) => {
        mockUseLocation.mockReturnValue({
          pathname: path,
          search: '',
          hash: '',
          state: null,
          key: `path${index + 1}`,
        })

        rerender()

        // Advance time by 100ms each time (not enough to trigger timeout)
        act(() => {
          vi.advanceTimersByTime(100)
        })
      })

      // At this point, no visitPage should have been called
      expect(mockVisitPage).not.toHaveBeenCalled()

      // Now advance time by 400ms more to complete the 500ms for the last location
      act(() => {
        vi.advanceTimersByTime(400)
      })

      // Only the last location should be visited
      expect(mockVisitPage).toHaveBeenCalledWith('/path4')
      expect(mockVisitPage).toHaveBeenCalledTimes(1)
    })
  })

  describe('timer precision', () => {
    it('should use exactly 500ms delay', () => {
      mockHasVisitedPage.mockReturnValue(false)

      renderHook(() => usePageVisit())

      // Advance by 499ms - should not trigger
      act(() => {
        vi.advanceTimersByTime(499)
      })
      expect(mockVisitPage).not.toHaveBeenCalled()

      // Advance by 1ms more (500ms total) - should trigger
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(mockVisitPage).toHaveBeenCalledTimes(1)
    })

    it('should not accumulate delays across location changes', () => {
      mockHasVisitedPage.mockReturnValue(false)

      const { rerender } = renderHook(() => usePageVisit())

      // Wait 400ms
      act(() => {
        vi.advanceTimersByTime(400)
      })

      // Change location
      mockUseLocation.mockReturnValue({
        pathname: '/new-location',
        search: '',
        hash: '',
        state: null,
        key: 'new-loc',
      })

      rerender()

      // Wait another 400ms (800ms total, but only 400ms since location change)
      act(() => {
        vi.advanceTimersByTime(400)
      })

      // Should not be called yet
      expect(mockVisitPage).not.toHaveBeenCalled()

      // Wait the remaining 100ms
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(mockVisitPage).toHaveBeenCalledWith('/new-location')
      expect(mockVisitPage).toHaveBeenCalledTimes(1)
    })
  })
})
