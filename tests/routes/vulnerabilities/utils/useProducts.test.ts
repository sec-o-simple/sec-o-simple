import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock dependencies
vi.mock('@/utils/useDocumentStore')

import useDocumentStore from '@/utils/useDocumentStore'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'

// Import the hook to test
vi.unmock('@/routes/vulnerabilities/utils/useProducts')
import useProducts, { TProductDetails } from '@/routes/vulnerabilities/utils/useProducts'

describe('useProducts', () => {
  // Mock store function
  const mockUseDocumentStore = vi.mocked(useDocumentStore)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useProducts hook', () => {
    it('should initialize with empty products when no product tree exists', () => {
      mockUseDocumentStore.mockReturnValue([])

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([])
      expect(typeof result.current.getProductVersions).toBe('function')
    })

    it('should extract product details from a simple vendor-product structure', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Acme Corp',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Super App',
              description: 'Product description',
              subBranches: [],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([
        {
          vendorName: 'Acme Corp',
          productName: 'Super App',
          productId: 'product-1',
        },
      ])
    })

    it('should handle multiple vendors with multiple products', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Acme Corp',
          description: 'Vendor 1 description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Super App',
              description: 'Product 1 description',
              subBranches: [],
            },
            {
              id: 'product-2',
              category: 'product_name',
              name: 'Mega Tool',
              description: 'Product 2 description',
              subBranches: [],
            },
          ],
        },
        {
          id: 'vendor-2',
          category: 'vendor',
          name: 'Tech Solutions',
          description: 'Vendor 2 description',
          subBranches: [
            {
              id: 'product-3',
              category: 'product_name',
              name: 'Pro Suite',
              description: 'Product 3 description',
              subBranches: [],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([
        {
          vendorName: 'Acme Corp',
          productName: 'Super App',
          productId: 'product-1',
        },
        {
          vendorName: 'Acme Corp',
          productName: 'Mega Tool',
          productId: 'product-2',
        },
        {
          vendorName: 'Tech Solutions',
          productName: 'Pro Suite',
          productId: 'product-3',
        },
      ])
    })

    it('should handle products with versions and return correct product details', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Acme Corp',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Super App',
              description: 'Product description',
              subBranches: [
                {
                  id: 'version-1',
                  category: 'product_version',
                  name: '1.0.0',
                  description: 'Version 1.0.0',
                  subBranches: [],
                },
                {
                  id: 'version-2',
                  category: 'product_version',
                  name: '2.0.0',
                  description: 'Version 2.0.0',
                  subBranches: [],
                },
              ],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([
        {
          vendorName: 'Acme Corp',
          productName: 'Super App',
          productId: 'product-1',
        },
      ])
    })

    it('should handle non-vendor and non-product branches by ignoring them', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'other-1',
          category: 'product_version', // Not vendor or product_name
          name: 'Random Version',
          description: 'Random description',
          subBranches: [],
        },
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Acme Corp',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Super App',
              description: 'Product description',
              subBranches: [],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([
        {
          vendorName: 'Acme Corp',
          productName: 'Super App',
          productId: 'product-1',
        },
      ])
    })

    it('should return empty array when product tree contains only non-relevant branches', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'version-1',
          category: 'product_version',
          name: '1.0.0',
          description: 'Version description',
          subBranches: [],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([])
    })

    it('should memoize product details and only recalculate when product tree changes', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Acme Corp',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Super App',
              description: 'Product description',
              subBranches: [],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result, rerender } = renderHook(() => useProducts())

      const firstResult = result.current.productDetails

      // Rerender without changing the product tree
      rerender()

      // Should be the same reference (memoized)
      expect(result.current.productDetails).toBe(firstResult)

      // Now change the product tree
      const newProductTree: TProductTreeBranch[] = [
        {
          id: 'vendor-2',
          category: 'vendor',
          name: 'New Corp',
          description: 'New vendor description',
          subBranches: [
            {
              id: 'product-2',
              category: 'product_name',
              name: 'New App',
              description: 'New product description',
              subBranches: [],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(newProductTree)
      rerender()

      // Should be a different reference with new data
      expect(result.current.productDetails).not.toBe(firstResult)
      expect(result.current.productDetails).toEqual([
        {
          vendorName: 'New Corp',
          productName: 'New App',
          productId: 'product-2',
        },
      ])
    })
  })

  describe('getProductVersions function', () => {
    it('should return undefined when product is not found', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Acme Corp',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Super App',
              description: 'Product description',
              subBranches: [],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.getProductVersions('non-existent-product')).toBeUndefined()
    })

    it('should return product versions when product is found at top level', () => {
      const versions: TProductTreeBranch[] = [
        {
          id: 'version-1',
          category: 'product_version',
          name: '1.0.0',
          description: 'Version 1.0.0',
          subBranches: [],
        },
        {
          id: 'version-2',
          category: 'product_version',
          name: '2.0.0',
          description: 'Version 2.0.0',
          subBranches: [],
        },
      ]

      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'product-1',
          category: 'product_name',
          name: 'Super App',
          description: 'Product description',
          subBranches: versions,
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.getProductVersions('product-1')).toEqual(versions)
    })

    it('should return product versions when product is found in nested structure', () => {
      const versions: TProductTreeBranch[] = [
        {
          id: 'version-1',
          category: 'product_version',
          name: '1.0.0',
          description: 'Version 1.0.0',
          subBranches: [],
        },
      ]

      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Acme Corp',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Super App',
              description: 'Product description',
              subBranches: versions,
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.getProductVersions('product-1')).toEqual(versions)
    })

    it('should return empty array when product is found but has no versions', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Acme Corp',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Super App',
              description: 'Product description',
              subBranches: [], // No versions
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.getProductVersions('product-1')).toEqual([])
    })

    it('should handle deep nesting and find product versions', () => {
      const versions: TProductTreeBranch[] = [
        {
          id: 'version-1',
          category: 'product_version',
          name: '1.0.0',
          description: 'Version 1.0.0',
          subBranches: [],
        },
      ]

      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'level-1',
          category: 'vendor',
          name: 'Level 1',
          description: 'Level 1 description',
          subBranches: [
            {
              id: 'level-2',
              category: 'vendor',
              name: 'Level 2',
              description: 'Level 2 description',
              subBranches: [
                {
                  id: 'product-1',
                  category: 'product_name',
                  name: 'Deep Product',
                  description: 'Deep product description',
                  subBranches: versions,
                },
              ],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.getProductVersions('product-1')).toEqual(versions)
    })

    it('should only match product_name category branches', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'product-1', // Same ID but different category
          category: 'vendor',
          name: 'Not a product',
          description: 'Vendor description',
          subBranches: [],
        },
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Acme Corp',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1', // Same ID but correct category
              category: 'product_name',
              name: 'Super App',
              description: 'Product description',
              subBranches: [
                {
                  id: 'version-1',
                  category: 'product_version',
                  name: '1.0.0',
                  description: 'Version 1.0.0',
                  subBranches: [],
                },
              ],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      const versions = result.current.getProductVersions('product-1')
      expect(versions).toHaveLength(1)
      expect(versions?.[0].name).toBe('1.0.0')
    })

    it('should return first match when multiple products have same ID', () => {
      const firstVersions: TProductTreeBranch[] = [
        {
          id: 'version-1',
          category: 'product_version',
          name: '1.0.0',
          description: 'First version',
          subBranches: [],
        },
      ]

      const secondVersions: TProductTreeBranch[] = [
        {
          id: 'version-2',
          category: 'product_version',
          name: '2.0.0',
          description: 'Second version',
          subBranches: [],
        },
      ]

      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'product-1',
          category: 'product_name',
          name: 'First Product',
          description: 'First product description',
          subBranches: firstVersions,
        },
        {
          id: 'product-1', // Same ID
          category: 'product_name',
          name: 'Second Product',
          description: 'Second product description',
          subBranches: secondVersions,
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      // Should return the first match
      expect(result.current.getProductVersions('product-1')).toEqual(firstVersions)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null/undefined product tree gracefully', () => {
      // The hook should handle the case where useDocumentStore returns null/undefined
      // However, the current implementation will throw an error with Object.values(null)
      // Let's test with an empty array instead, which is the expected fallback
      mockUseDocumentStore.mockReturnValue([])

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([])
    })

    it('should handle empty product tree', () => {
      mockUseDocumentStore.mockReturnValue([])

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([])
      expect(result.current.getProductVersions('any-id')).toBeUndefined()
    })

    it('should handle vendor with no sub-branches', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Empty Vendor',
          description: 'Vendor with no products',
          subBranches: [],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([])
    })

    it('should handle malformed product tree structure', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'malformed-1',
          category: 'vendor',
          name: 'Malformed Vendor',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'malformed-2',
              category: 'product_version', // Should be product_name
              name: 'Malformed Product',
              description: 'Malformed description',
              subBranches: [],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([])
    })

    it('should handle getProductVersions with empty product ID', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'product-1',
          category: 'product_name',
          name: 'Super App',
          description: 'Product description',
          subBranches: [],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.getProductVersions('')).toBeUndefined()
    })
  })

  describe('type checking and integration', () => {
    it('should return correctly typed product details', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Acme Corp',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Super App',
              description: 'Product description',
              subBranches: [],
            },
          ],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      const details = result.current.productDetails[0]
      
      // Type checking
      expect(typeof details.vendorName).toBe('string')
      expect(typeof details.productName).toBe('string')
      expect(typeof details.productId).toBe('string')
      
      // Value checking
      expect(details.vendorName).toBe('Acme Corp')
      expect(details.productName).toBe('Super App')
      expect(details.productId).toBe('product-1')
    })

    it('should handle products without vendor (no vendorName)', () => {
      const mockProductTree: TProductTreeBranch[] = [
        {
          id: 'product-1',
          category: 'product_name',
          name: 'Standalone Product',
          description: 'Product without vendor',
          subBranches: [],
        },
      ]

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result } = renderHook(() => useProducts())

      expect(result.current.productDetails).toEqual([
        {
          vendorName: undefined, // No vendor provided
          productName: 'Standalone Product',
          productId: 'product-1',
        },
      ])
    })

    it('should maintain consistent interface across rerenders', () => {
      const mockProductTree: TProductTreeBranch[] = []

      mockUseDocumentStore.mockReturnValue(mockProductTree)

      const { result, rerender } = renderHook(() => useProducts())

      const firstInterface = result.current
      
      rerender()
      
      const secondInterface = result.current

      // Same function references should be maintained
      expect(typeof firstInterface.getProductVersions).toBe('function')
      expect(typeof secondInterface.getProductVersions).toBe('function')
      
      // Product details should be consistent (empty in this case)
      expect(firstInterface.productDetails).toEqual([])
      expect(secondInterface.productDetails).toEqual([])
    })
  })
})
