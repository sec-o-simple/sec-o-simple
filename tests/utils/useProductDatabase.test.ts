import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import useProductDatabase from '../../src/utils/useProductDatabase'

// Mock the useConfigStore
vi.mock('../../src/utils/useConfigStore')

import { useConfigStore } from '../../src/utils/useConfigStore'

const mockUseConfigStore = vi.mocked(useConfigStore)

// Helper function to mock the config store with productDatabase
function mockProductDatabase(productDatabase: any) {
  mockUseConfigStore.mockImplementation((selector: any) => {
    const state = { config: { productDatabase } }
    return selector(state)
  })
}

describe('useProductDatabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('enabled state with complete configuration', () => {
    it('should return enabled=true when all required fields are present and truthy', () => {
      mockProductDatabase({
        enabled: true,
        url: 'https://example.com/products',
        apiUrl: 'https://api.example.com',
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: true,
        url: 'https://example.com/products',
        apiUrl: 'https://api.example.com',
      })
    })

    it('should return enabled=true with different URL configurations', () => {
      mockProductDatabase({
        enabled: true,
        url: 'http://localhost:3000/db',
        apiUrl: 'http://localhost:3001/api/v1',
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: true,
        url: 'http://localhost:3000/db',
        apiUrl: 'http://localhost:3001/api/v1',
      })
    })
  })

  describe('disabled state scenarios', () => {
    it('should return enabled=false when enabled is false', () => {
      mockProductDatabase({
        enabled: false,
        url: 'https://example.com/products',
        apiUrl: 'https://api.example.com',
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: 'https://example.com/products',
        apiUrl: 'https://api.example.com',
      })
    })

    it('should return enabled=false when url is missing', () => {
      mockProductDatabase({
        enabled: true,
        apiUrl: 'https://api.example.com',
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: '',
        apiUrl: 'https://api.example.com',
      })
    })

    it('should return enabled=false when apiUrl is missing', () => {
      mockProductDatabase({
        enabled: true,
        url: 'https://example.com/products',
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: 'https://example.com/products',
        apiUrl: '',
      })
    })

    it('should return enabled=false when both url and apiUrl are missing', () => {
      mockProductDatabase({
        enabled: true,
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: '',
        apiUrl: '',
      })
    })

    it('should return enabled=false when url is empty string', () => {
      mockProductDatabase({
        enabled: true,
        url: '',
        apiUrl: 'https://api.example.com',
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: '',
        apiUrl: 'https://api.example.com',
      })
    })

    it('should return enabled=false when apiUrl is empty string', () => {
      mockProductDatabase({
        enabled: true,
        url: 'https://example.com/products',
        apiUrl: '',
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: 'https://example.com/products',
        apiUrl: '',
      })
    })

    it('should return enabled=false when all fields are falsy', () => {
      mockProductDatabase({
        enabled: false,
        url: '',
        apiUrl: '',
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: '',
        apiUrl: '',
      })
    })
  })

  describe('missing configuration scenarios', () => {
    it('should return default values when config is undefined', () => {
      mockProductDatabase(undefined)

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: '',
        apiUrl: '',
      })
    })

    it('should return default values when config is null', () => {
      mockProductDatabase(null)

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: '',
        apiUrl: '',
      })
    })

    it('should return default values when productDatabase is undefined', () => {
      mockProductDatabase(undefined)

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: '',
        apiUrl: '',
      })
    })

    it('should return default values when productDatabase is null', () => {
      mockProductDatabase(null)

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: '',
        apiUrl: '',
      })
    })
  })

  describe('edge cases and type coercion', () => {
    it('should handle truthy non-boolean enabled values', () => {
      mockProductDatabase({
        enabled: 1, // truthy number
        url: 'https://example.com/products',
        apiUrl: 'https://api.example.com',
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: true, // 1 && url && apiUrl = true
        url: 'https://example.com/products',
        apiUrl: 'https://api.example.com',
      })
    })

    it('should handle falsy non-boolean enabled values', () => {
      mockProductDatabase({
        enabled: 0, // falsy number
        url: 'https://example.com/products',
        apiUrl: 'https://api.example.com',
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false, // 0 && url && apiUrl = false
        url: 'https://example.com/products',
        apiUrl: 'https://api.example.com',
      })
    })

    it('should handle null/undefined individual fields within productDatabase', () => {
      mockProductDatabase({
        enabled: true,
        url: null,
        apiUrl: undefined,
      })

      const { result } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false, // true && null && undefined = false
        url: '',
        apiUrl: '',
      })
    })
  })

  describe('logical AND behavior in enabled calculation', () => {
    it('should verify that enabled uses AND logic for all three conditions', () => {
      const testCases = [
        { enabled: true, url: 'url', apiUrl: 'api', expectedEnabled: true },
        { enabled: false, url: 'url', apiUrl: 'api', expectedEnabled: false },
        { enabled: true, url: '', apiUrl: 'api', expectedEnabled: false },
        { enabled: true, url: 'url', apiUrl: '', expectedEnabled: false },
        { enabled: false, url: '', apiUrl: '', expectedEnabled: false },
        { enabled: true, url: null, apiUrl: 'api', expectedEnabled: false },
        { enabled: true, url: 'url', apiUrl: null, expectedEnabled: false },
      ]

      testCases.forEach(({ enabled, url, apiUrl, expectedEnabled }) => {
        mockProductDatabase({ enabled, url, apiUrl })

        const { result } = renderHook(() => useProductDatabase())

        expect(result.current.enabled).toBe(expectedEnabled)
        expect(result.current.url).toBe(url ?? '')
        expect(result.current.apiUrl).toBe(apiUrl ?? '')
      })
    })
  })

  describe('hook reactivity', () => {
    it('should return updated values when config changes', () => {
      // Initial config
      mockProductDatabase({
        enabled: false,
        url: 'https://old.example.com',
        apiUrl: 'https://api.old.example.com',
      })

      const { result, rerender } = renderHook(() => useProductDatabase())

      expect(result.current).toEqual({
        enabled: false,
        url: 'https://old.example.com',
        apiUrl: 'https://api.old.example.com',
      })

      // Updated config
      mockProductDatabase({
        enabled: true,
        url: 'https://new.example.com',
        apiUrl: 'https://api.new.example.com',
      })

      rerender()

      expect(result.current).toEqual({
        enabled: true,
        url: 'https://new.example.com',
        apiUrl: 'https://api.new.example.com',
      })
    })
  })
})