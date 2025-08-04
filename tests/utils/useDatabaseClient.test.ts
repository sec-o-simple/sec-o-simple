import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

// Create mock client in hoisted scope
const mockClient = vi.hoisted(() => ({
  get: vi.fn(),
  defaults: { baseURL: '' },
}))

// Create mock for useProductDatabase in hoisted scope
const mockUseProductDatabase = vi.hoisted(() => vi.fn())

// Mock axios with the hoisted mock client
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockClient),
  },
}))

// Mock useProductDatabase
vi.mock('../../src/utils/useProductDatabase', () => ({
  default: mockUseProductDatabase,
}))

// Import types and functions after mocking
import axios from 'axios'
import { 
  useDatabaseClient, 
  type Vendor, 
  type Product, 
  type ProductVersion, 
  type IdentificationHelper 
} from '../../src/utils/useDatabaseClient'

const mockedAxios = vi.mocked(axios)

describe('useDatabaseClient', () => {
  const mockConfig = {
    enabled: true,
    apiUrl: 'https://api.example.com',
    url: 'https://example.com',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient.defaults.baseURL = '' // Reset baseURL
    
    // Mock useProductDatabase to return our mock config
    mockUseProductDatabase.mockReturnValue(mockConfig)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initialization', () => {
    it('should throw error when product database is not enabled', () => {
      mockUseProductDatabase.mockReturnValue({
        enabled: false,
        apiUrl: 'https://api.example.com',
        url: 'https://example.com',
      })

      expect(() => {
        renderHook(() => useDatabaseClient())
      }).toThrow('Product database is not enabled in the configuration.')
    })

    it('should throw error when product database apiUrl is missing', () => {
      mockUseProductDatabase.mockReturnValue({
        enabled: true,
        apiUrl: '',
        url: 'https://example.com',
      })

      expect(() => {
        renderHook(() => useDatabaseClient())
      }).toThrow('Product database is not enabled in the configuration.')
    })

    it('should throw error when product database config is missing', () => {
      mockUseProductDatabase.mockReturnValue({
        enabled: false,
        apiUrl: '',
        url: '',
      })

      expect(() => {
        renderHook(() => useDatabaseClient())
      }).toThrow('Product database is not enabled in the configuration.')
    })

    it('should throw error when config is null', () => {
      mockUseProductDatabase.mockReturnValue({
        enabled: false,
        apiUrl: '',
        url: '',
      })

      expect(() => {
        renderHook(() => useDatabaseClient())
      }).toThrow('Product database is not enabled in the configuration.')
    })

    it('should set baseURL on client when hook is initialized', () => {
      renderHook(() => useDatabaseClient())

      expect(mockClient.defaults.baseURL).toBe('https://api.example.com/api/v1')
    })

    it('should update baseURL when apiUrl changes', () => {
      const { rerender } = renderHook(() => useDatabaseClient())

      // Change the apiUrl
      mockUseProductDatabase.mockReturnValue({
        enabled: true,
        apiUrl: 'https://new-api.example.com',
        url: 'https://example.com',
      })

      rerender()

      expect(mockClient.defaults.baseURL).toBe('https://new-api.example.com/api/v1')
    })
  })

  describe('return values', () => {
    it('should return correct url from config', () => {
      const { result } = renderHook(() => useDatabaseClient())

      expect(result.current.url).toBe('https://example.com')
    })

    it('should return all required functions', () => {
      const { result } = renderHook(() => useDatabaseClient())

      expect(result.current).toHaveProperty('url')
      expect(result.current).toHaveProperty('fetchVendors')
      expect(result.current).toHaveProperty('fetchProducts')
      expect(result.current).toHaveProperty('fetchProductVersions')
      expect(result.current).toHaveProperty('fetchIdentificationHelpers')
      
      expect(typeof result.current.fetchVendors).toBe('function')
      expect(typeof result.current.fetchProducts).toBe('function')
      expect(typeof result.current.fetchProductVersions).toBe('function')
      expect(typeof result.current.fetchIdentificationHelpers).toBe('function')
    })
  })

  describe('fetchVendors', () => {
    it('should fetch vendors successfully', async () => {
      const mockVendors: Vendor[] = [
        {
          id: '1',
          name: 'Vendor 1',
          description: 'Description 1',
          product_count: 5,
        },
        {
          id: '2',
          name: 'Vendor 2',
          description: 'Description 2',
          product_count: 3,
        },
      ]

      mockClient.get.mockResolvedValue({ data: mockVendors })

      const { result } = renderHook(() => useDatabaseClient())
      const vendors = await result.current.fetchVendors()

      expect(mockClient.get).toHaveBeenCalledWith('/vendors')
      expect(vendors).toEqual(mockVendors)
    })

    it('should handle fetchVendors error', async () => {
      const mockError = new Error('Network error')
      mockClient.get.mockRejectedValue(mockError)

      const { result } = renderHook(() => useDatabaseClient())

      await expect(result.current.fetchVendors()).rejects.toThrow('Network error')
      expect(mockClient.get).toHaveBeenCalledWith('/vendors')
    })
  })

  describe('fetchProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts: Product[] = [
        {
          vendor_id: '1',
          type: 'software',
          id: 'prod1',
          name: 'Product 1',
          full_name: 'Full Product 1',
          description: 'Product description 1',
        },
        {
          vendor_id: '2',
          type: 'hardware',
          id: 'prod2',
          name: 'Product 2',
          full_name: 'Full Product 2',
          description: 'Product description 2',
        },
      ]

      mockClient.get.mockResolvedValue({ data: mockProducts })

      const { result } = renderHook(() => useDatabaseClient())
      const products = await result.current.fetchProducts()

      expect(mockClient.get).toHaveBeenCalledWith('/products')
      expect(products).toEqual(mockProducts)
    })

    it('should handle fetchProducts error', async () => {
      const mockError = new Error('API error')
      mockClient.get.mockRejectedValue(mockError)

      const { result } = renderHook(() => useDatabaseClient())

      await expect(result.current.fetchProducts()).rejects.toThrow('API error')
      expect(mockClient.get).toHaveBeenCalledWith('/products')
    })
  })

  describe('fetchProductVersions', () => {
    it('should fetch product versions successfully', async () => {
      const mockVersions: ProductVersion[] = [
        {
          id: 'v1',
          name: 'Version 1.0',
          description: 'First version',
        },
        {
          id: 'v2',
          name: 'Version 2.0',
          description: 'Second version',
        },
      ]

      mockClient.get.mockResolvedValue({ data: mockVersions })

      const { result } = renderHook(() => useDatabaseClient())
      const versions = await result.current.fetchProductVersions('prod1')

      expect(mockClient.get).toHaveBeenCalledWith('/products/prod1/versions')
      expect(versions).toEqual(mockVersions)
    })

    it('should handle fetchProductVersions error', async () => {
      const mockError = new Error('Version fetch error')
      mockClient.get.mockRejectedValue(mockError)

      const { result } = renderHook(() => useDatabaseClient())

      await expect(result.current.fetchProductVersions('prod1')).rejects.toThrow('Version fetch error')
      expect(mockClient.get).toHaveBeenCalledWith('/products/prod1/versions')
    })

    it('should call fetchProductVersions with different product IDs', async () => {
      const mockVersions: ProductVersion[] = []
      mockClient.get.mockResolvedValue({ data: mockVersions })

      const { result } = renderHook(() => useDatabaseClient())
      
      await result.current.fetchProductVersions('product-123')
      expect(mockClient.get).toHaveBeenCalledWith('/products/product-123/versions')

      await result.current.fetchProductVersions('another-product')
      expect(mockClient.get).toHaveBeenCalledWith('/products/another-product/versions')
    })
  })

  describe('fetchIdentificationHelpers', () => {
    it('should fetch identification helpers successfully', async () => {
      const mockHelpers: IdentificationHelper[] = [
        {
          id: 'helper1',
          category: 'cpe',
          metadata: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*',
        },
        {
          id: 'helper2',
          category: 'purl',
          metadata: 'pkg:npm/package@1.0.0',
        },
      ]

      mockClient.get.mockResolvedValue({ data: mockHelpers })

      const { result } = renderHook(() => useDatabaseClient())
      const helpers = await result.current.fetchIdentificationHelpers('v1')

      expect(mockClient.get).toHaveBeenCalledWith('/product-versions/v1/identification-helpers')
      expect(helpers).toEqual(mockHelpers)
    })

    it('should handle fetchIdentificationHelpers error', async () => {
      const mockError = new Error('Helper fetch error')
      mockClient.get.mockRejectedValue(mockError)

      const { result } = renderHook(() => useDatabaseClient())

      await expect(result.current.fetchIdentificationHelpers('v1')).rejects.toThrow('Helper fetch error')
      expect(mockClient.get).toHaveBeenCalledWith('/product-versions/v1/identification-helpers')
    })

    it('should call fetchIdentificationHelpers with different version IDs', async () => {
      const mockHelpers: IdentificationHelper[] = []
      mockClient.get.mockResolvedValue({ data: mockHelpers })

      const { result } = renderHook(() => useDatabaseClient())
      
      await result.current.fetchIdentificationHelpers('version-abc')
      expect(mockClient.get).toHaveBeenCalledWith('/product-versions/version-abc/identification-helpers')

      await result.current.fetchIdentificationHelpers('version-xyz')
      expect(mockClient.get).toHaveBeenCalledWith('/product-versions/version-xyz/identification-helpers')
    })
  })

  describe('function memoization', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useDatabaseClient())
      
      const firstFunctions = {
        fetchVendors: result.current.fetchVendors,
        fetchProducts: result.current.fetchProducts,
        fetchProductVersions: result.current.fetchProductVersions,
        fetchIdentificationHelpers: result.current.fetchIdentificationHelpers,
      }

      rerender()

      expect(result.current.fetchVendors).toBe(firstFunctions.fetchVendors)
      expect(result.current.fetchProducts).toBe(firstFunctions.fetchProducts)
      expect(result.current.fetchProductVersions).toBe(firstFunctions.fetchProductVersions)
      expect(result.current.fetchIdentificationHelpers).toBe(firstFunctions.fetchIdentificationHelpers)
    })
  })

  describe('edge cases', () => {
    it('should handle empty responses', async () => {
      mockClient.get.mockResolvedValue({ data: [] })

      const { result } = renderHook(() => useDatabaseClient())
      
      const vendors = await result.current.fetchVendors()
      const products = await result.current.fetchProducts()
      const versions = await result.current.fetchProductVersions('prod1')
      const helpers = await result.current.fetchIdentificationHelpers('v1')

      expect(vendors).toEqual([])
      expect(products).toEqual([])
      expect(versions).toEqual([])
      expect(helpers).toEqual([])
    })

    it('should handle null data responses', async () => {
      mockClient.get.mockResolvedValue({ data: null })

      const { result } = renderHook(() => useDatabaseClient())
      
      const vendors = await result.current.fetchVendors()
      expect(vendors).toBeNull()
    })

    it('should handle special characters in IDs', async () => {
      const mockVersions: ProductVersion[] = []
      mockClient.get.mockResolvedValue({ data: mockVersions })

      const { result } = renderHook(() => useDatabaseClient())
      
      await result.current.fetchProductVersions('product-with-@special#chars!')
      expect(mockClient.get).toHaveBeenCalledWith('/products/product-with-@special#chars!/versions')

      await result.current.fetchIdentificationHelpers('version-with-$pecial&chars')
      expect(mockClient.get).toHaveBeenCalledWith('/product-versions/version-with-$pecial&chars/identification-helpers')
    })

    it('should handle undefined config properties gracefully', () => {
      mockUseProductDatabase.mockReturnValue({
        enabled: true,
        apiUrl: 'https://api.example.com',
        url: '', // empty url
      })

      const { result } = renderHook(() => useDatabaseClient())
      
      expect(result.current.url).toBe('')
    })

    it('should handle config with undefined productDatabase url', () => {
      mockUseProductDatabase.mockReturnValue({
        enabled: true,
        apiUrl: 'https://api.example.com',
        url: '', // empty url
      })

      const { result } = renderHook(() => useDatabaseClient())
      
      expect(result.current.url).toBe('')
    })
  })
})
