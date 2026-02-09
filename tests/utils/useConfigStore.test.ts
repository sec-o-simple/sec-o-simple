import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Unmock the module to test the actual implementation
vi.unmock('@/utils/useConfigStore')
vi.unmock('../../src/utils/useConfigStore')

import { useConfigStore, useConfigInitializer, TConfig } from '../../src/utils/useConfigStore'

// Mock console.error to clean up test output
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

// Mock fetch for testing config loading
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useConfigStore', () => {
  beforeEach(() => {
    // Clear all mocks
    mockConsoleError.mockClear()
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('store state management', () => {
    it('should have updateConfig function', () => {
      const { result } = renderHook(() => useConfigStore(state => state.updateConfig))
      
      expect(typeof result.current).toBe('function')
    })

    it('should update config via updateConfig', () => {
      const { result } = renderHook(() => useConfigStore())
      
      const newConfig: TConfig = {
        template: { custom: 'value' },
        productDatabase: { enabled: true, url: 'https://example.com' }
      }
      
      act(() => {
        result.current.updateConfig(newConfig)
      })

      const { result: configResult } = renderHook(() => useConfigStore(state => state.config))
      expect(configResult.current).toEqual(newConfig)
    })

    it('should handle minimal config updates', () => {
      const { result } = renderHook(() => useConfigStore())
      
      const minimalConfig: TConfig = {
        template: {},
        productDatabase: { enabled: false }
      }
      
      act(() => {
        result.current.updateConfig(minimalConfig)
      })

      const { result: configResult } = renderHook(() => useConfigStore(state => state.config))
      expect(configResult.current).toEqual(minimalConfig)
    })

    it('should handle complex config with all properties', () => {
      const { result } = renderHook(() => useConfigStore())
      
      const complexConfig: TConfig = {
        template: { 
          customTemplate: 'advanced',
          nested: { value: 123 }
        },
        productDatabase: { 
          enabled: true, 
          url: 'https://products.example.com',
          apiUrl: 'https://api.products.example.com'
        },
        exportTexts: {
          productDescription: {
            en: 'English description',
            de: 'German description'
          }
        },
        cveApiUrl: 'https://cve.mitre.org/api'
      }
      
      act(() => {
        result.current.updateConfig(complexConfig)
      })

      const { result: configResult } = renderHook(() => useConfigStore(state => state.config))
      expect(configResult.current).toEqual(complexConfig)
    })
  })

  describe('useConfigInitializer', () => {
    it('should fetch config from default endpoint', async () => {
      const mockConfig: TConfig = {
        template: { fetched: true },
        productDatabase: { enabled: true, url: 'https://fetched.com' }
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      })

      renderHook(() => useConfigInitializer())
      
      // Wait for async effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(mockFetch).toHaveBeenCalledWith('.well-known/appspecific/io.github.sec-o-simple.json')
      
      const { result: configResult } = renderHook(() => useConfigStore(state => state.config))
      expect(configResult.current).toEqual(mockConfig)
    })

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      renderHook(() => useConfigInitializer())
      
      // Wait for async effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to parse sec-o-simple configuration. Falling back to default configuration',
        expect.any(Error)
      )
      
      // Should fallback to default config
      const { result: configResult } = renderHook(() => useConfigStore(state => state.config))
      expect(configResult.current).toEqual({
        template: {},
        productDatabase: { enabled: false }
      })
    })

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON') }
      })

      renderHook(() => useConfigInitializer())
      
      // Wait for async effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to parse sec-o-simple configuration. Falling back to default configuration',
        expect.any(Error)
      )
      
      // Should fallback to default config
      const { result: configResult } = renderHook(() => useConfigStore(state => state.config))
      expect(configResult.current).toEqual({
        template: {},
        productDatabase: { enabled: false }
      })
    })

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      renderHook(() => useConfigInitializer())
      
      // Wait for async effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to parse sec-o-simple configuration. Falling back to default configuration',
        expect.any(Error)
      )
      
      // Should fallback to default config
      const { result: configResult } = renderHook(() => useConfigStore(state => state.config))
      expect(configResult.current).toEqual({
        template: {},
        productDatabase: { enabled: false }
      })
    })
  })

  describe('store reactivity', () => {
    it('should trigger re-renders when config changes', () => {
      const { result } = renderHook(() => useConfigStore(state => state.config?.productDatabase.enabled))
      const { result: storeResult } = renderHook(() => useConfigStore())
      
      // Store state might carry over from previous tests, check if it exists first
      const initialValue = result.current
      
      act(() => {
        storeResult.current.updateConfig({
          template: {},
          productDatabase: { enabled: true }
        })
      })
      
      expect(result.current).toBe(true)
    })

    it('should allow multiple selectors to work independently', () => {
      const { result: enabledResult } = renderHook(() => 
        useConfigStore(state => state.config?.productDatabase.enabled)
      )
      const { result: urlResult } = renderHook(() => 
        useConfigStore(state => state.config?.productDatabase.url)
      )
      const { result: storeResult } = renderHook(() => useConfigStore())
      
      // Store state might carry over, check initial values  
      const initialEnabled = enabledResult.current
      const initialUrl = urlResult.current
      
      act(() => {
        storeResult.current.updateConfig({
          template: { test: true },
          productDatabase: { 
            enabled: false, // Changed to false to ensure we see the change
            url: 'https://multi-selector.com' 
          }
        })
      })
      
      expect(enabledResult.current).toBe(false)
      expect(urlResult.current).toBe('https://multi-selector.com')
    })
  })
})
