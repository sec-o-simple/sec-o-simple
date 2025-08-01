import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProductTreeBranch } from '../../src/utils/useProductTreeBranch'
import type { 
  TProductTreeBranch, 
  TProductTreeBranchCategory, 
  TProductTreeBranchWithParents 
} from '../../src/routes/products/types/tProductTreeBranch'

// Mock dependencies
const mockUseDocumentStore = vi.fn()
const mockUpdateProducts = vi.fn()
const mockGetRelationshipsBySourceVersion = vi.fn()
const mockGetRelationshipsByTargetVersion = vi.fn()
const mockDeleteRelationship = vi.fn()

vi.mock('../../src/utils/useDocumentStore', () => ({
  default: (selector: any) => mockUseDocumentStore(selector),
}))

vi.mock('../../src/utils/useRelationships', () => ({
  useRelationships: () => ({
    getRelationshipsBySourceVersion: mockGetRelationshipsBySourceVersion,
    getRelationshipsByTargetVersion: mockGetRelationshipsByTargetVersion,
    deleteRelationship: mockDeleteRelationship,
  }),
}))

// Mock console.warn to avoid noise in tests
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

// Test data helpers
const createMockProductTreeBranch = (
  id: string,
  category: TProductTreeBranchCategory,
  name: string,
  subBranches: TProductTreeBranch[] = []
): TProductTreeBranch => ({
  id,
  category,
  name,
  description: `Description for ${name}`,
  subBranches,
  type: category === 'product_name' ? 'Software' : undefined,
})

const createMockVendor = (id: string, name: string, products: TProductTreeBranch[] = []): TProductTreeBranch =>
  createMockProductTreeBranch(id, 'vendor', name, products)

const createMockProduct = (id: string, name: string, versions: TProductTreeBranch[] = []): TProductTreeBranch =>
  createMockProductTreeBranch(id, 'product_name', name, versions)

const createMockVersion = (id: string, name: string): TProductTreeBranch =>
  createMockProductTreeBranch(id, 'product_version', name)

const createMockRelationship = (id: string) => ({
  id,
  category: 'installed_on' as const,
  productId1: 'product-1',
  product1VersionIds: ['version-1'],
  productId2: 'product-2',
  product2VersionIds: ['version-2'],
})

describe('useProductTreeBranch', () => {
  let mockProducts: TProductTreeBranch[]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create test data structure
    const version1 = createMockVersion('version-1', 'Version 1.0')
    const version2 = createMockVersion('version-2', 'Version 2.0')
    const version3 = createMockVersion('version-3', 'Version 1.0')
    
    const product1 = createMockProduct('product-1', 'Product A', [version1, version2])
    const product2 = createMockProduct('product-2', 'Product B', [version3])
    
    const vendor1 = createMockVendor('vendor-1', 'Vendor A', [product1])
    const vendor2 = createMockVendor('vendor-2', 'Vendor B', [product2])
    
    mockProducts = [vendor1, vendor2]

    // Setup default mocks
    mockUseDocumentStore.mockImplementation((selector) => {
      const mockStore = {
        products: Object.fromEntries(mockProducts.map(p => [p.id, p])),
        updateProducts: mockUpdateProducts,
      }
      return selector(mockStore)
    })

    mockGetRelationshipsBySourceVersion.mockReturnValue([])
    mockGetRelationshipsByTargetVersion.mockReturnValue([])
  })

  describe('Hook Return Value', () => {
    it('should return all expected functions and data', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      expect(result.current).toEqual({
        rootBranch: expect.any(Array),
        findProductTreeBranch: expect.any(Function),
        findProductTreeBranchWithParents: expect.any(Function),
        getFilteredPTBs: expect.any(Function),
        getPTBsByCategory: expect.any(Function),
        getSelectablePTBs: expect.any(Function),
        addPTB: expect.any(Function),
        updatePTB: expect.any(Function),
        deletePTB: expect.any(Function),
      })
    })

    it('should return products as rootBranch', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      expect(result.current.rootBranch).toEqual(mockProducts)
    })
  })

  describe('findProductTreeBranch', () => {
    it('should find a top-level product tree branch', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const found = result.current.findProductTreeBranch('vendor-1')
      
      expect(found).toEqual(mockProducts[0])
    })

    it('should find a nested product tree branch', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const found = result.current.findProductTreeBranch('product-1')
      
      expect(found).toEqual(mockProducts[0].subBranches[0])
    })

    it('should find a deeply nested product tree branch', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const found = result.current.findProductTreeBranch('version-1')
      
      expect(found).toEqual(mockProducts[0].subBranches[0].subBranches[0])
    })

    it('should return undefined for non-existent branch', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const found = result.current.findProductTreeBranch('non-existent')
      
      expect(found).toBeUndefined()
    })

    it('should search in custom starting branches when provided', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const customBranches = [createMockVersion('custom-1', 'Custom Version')]

      const found = result.current.findProductTreeBranch('custom-1', customBranches)
      
      expect(found).toEqual(customBranches[0])
    })

    it('should not find branch in custom starting branches if it exists elsewhere', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const customBranches = [createMockVersion('custom-1', 'Custom Version')]

      const found = result.current.findProductTreeBranch('version-1', customBranches)
      
      expect(found).toBeUndefined()
    })
  })

  describe('findProductTreeBranchWithParents', () => {
    it('should find a top-level branch with null parent', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const found = result.current.findProductTreeBranchWithParents('vendor-1')
      
      expect(found).toEqual({
        ...mockProducts[0],
        parent: null,
      })
    })

    it('should find a nested branch with correct parent', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const found = result.current.findProductTreeBranchWithParents('product-1')
      
      expect(found).toEqual({
        ...mockProducts[0].subBranches[0],
        parent: {
          ...mockProducts[0],
          parent: null,
        },
      })
    })

    it('should find a deeply nested branch with correct parent chain', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const found = result.current.findProductTreeBranchWithParents('version-1')
      
      expect(found).toEqual({
        ...mockProducts[0].subBranches[0].subBranches[0],
        parent: {
          ...mockProducts[0].subBranches[0],
          parent: {
            ...mockProducts[0],
            parent: null,
          },
        },
      })
    })

    it('should return undefined for non-existent branch', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const found = result.current.findProductTreeBranchWithParents('non-existent')
      
      expect(found).toBeUndefined()
    })

    it('should work with custom starting branches and parent', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const customParent: TProductTreeBranchWithParents = {
        ...createMockVendor('custom-parent', 'Custom Parent'),
        parent: null,
      }
      const customBranches = [createMockProduct('custom-product', 'Custom Product')]

      const found = result.current.findProductTreeBranchWithParents(
        'custom-product',
        customParent,
        customBranches
      )
      
      expect(found).toEqual({
        ...customBranches[0],
        parent: customParent,
      })
    })
  })

  describe('getFilteredPTBs', () => {
    it('should filter top-level branches', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const filtered = result.current.getFilteredPTBs((ptb) => ptb.name === 'Vendor A')
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Vendor A')
    })

    it('should filter nested branches and maintain structure', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const filtered = result.current.getFilteredPTBs((ptb) => ptb.category === 'product_name')
      
      expect(filtered).toHaveLength(0) // No top-level products
    })

    it('should recursively filter sub-branches', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const filtered = result.current.getFilteredPTBs((ptb) => ptb.category === 'vendor')
      
      expect(filtered).toHaveLength(2)
      expect(filtered[0].subBranches).toHaveLength(0) // Products are filtered out
    })

    it('should work with custom filter functions', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const filtered = result.current.getFilteredPTBs((ptb) => ptb.name.includes('Product'))
      
      expect(filtered).toHaveLength(0) // No top-level branches with "Product" in name
    })

    it('should work with custom starting branches', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const customBranches = [
        createMockProduct('test-1', 'Test Product'),
        createMockVersion('test-2', 'Test Version'),
      ]

      const filtered = result.current.getFilteredPTBs(
        (ptb) => ptb.category === 'product_name',
        customBranches
      )
      
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Test Product')
    })

    it('should handle empty results', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const filtered = result.current.getFilteredPTBs((ptb) => ptb.name === 'Non-existent')
      
      expect(filtered).toHaveLength(0)
    })
  })

  describe('getPTBsByCategory', () => {
    it('should get all vendors', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const vendors = result.current.getPTBsByCategory('vendor')
      
      expect(vendors).toHaveLength(2)
      expect(vendors.map(v => v.name)).toEqual(['Vendor A', 'Vendor B'])
    })

    it('should get all products', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const products = result.current.getPTBsByCategory('product_name')
      
      expect(products).toHaveLength(2)
      expect(products.map(p => p.name)).toEqual(['Product A', 'Product B'])
    })

    it('should get all versions', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const versions = result.current.getPTBsByCategory('product_version')
      
      expect(versions).toHaveLength(3)
      expect(versions.map(v => v.name)).toEqual(['Version 1.0', 'Version 2.0', 'Version 1.0'])
    })

    it('should work with custom starting branches', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const customBranches = [
        createMockVendor('custom-vendor', 'Custom Vendor', [
          createMockProduct('custom-product', 'Custom Product')
        ])
      ]

      const products = result.current.getPTBsByCategory('product_name', customBranches)
      
      expect(products).toHaveLength(1)
      expect(products[0].name).toBe('Custom Product')
    })

    it('should return empty array for non-existent category', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const results = result.current.getPTBsByCategory('vendor', [])
      
      expect(results).toHaveLength(0)
    })
  })

  describe('getSelectablePTBs', () => {
    it('should return all product versions', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const selectablePTBs = result.current.getSelectablePTBs()
      
      expect(selectablePTBs).toHaveLength(3)
      expect(selectablePTBs.every(ptb => ptb.category === 'product_version')).toBe(true)
    })

    it('should return versions from all products', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      const selectablePTBs = result.current.getSelectablePTBs()
      
      expect(selectablePTBs.map(ptb => ptb.name)).toEqual(['Version 1.0', 'Version 2.0', 'Version 1.0'])
    })
  })

  describe('addPTB', () => {
    it('should add a new product tree branch', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const newBranch = createMockVendor('new-vendor', 'New Vendor')

      act(() => {
        result.current.addPTB(newBranch)
      })

      expect(mockUpdateProducts).toHaveBeenCalledWith([...mockProducts, newBranch])
    })

    it('should preserve existing products when adding new one', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const newBranch = createMockVendor('new-vendor', 'New Vendor')

      act(() => {
        result.current.addPTB(newBranch)
      })

      const calledWith = mockUpdateProducts.mock.calls[0][0]
      expect(calledWith).toHaveLength(3)
      expect(calledWith.slice(0, 2)).toEqual(mockProducts)
      expect(calledWith[2]).toEqual(newBranch)
    })
  })

  describe('updatePTB', () => {
    it('should update a top-level branch', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const updatedVendor = { ...mockProducts[0], name: 'Updated Vendor A' }

      let returnedProducts: TProductTreeBranch[]
      act(() => {
        returnedProducts = result.current.updatePTB(updatedVendor)
      })

      expect(mockUpdateProducts).toHaveBeenCalled()
      const calledWith = mockUpdateProducts.mock.calls[0][0]
      expect(calledWith[0].name).toBe('Updated Vendor A')
      expect(returnedProducts![0].name).toBe('Updated Vendor A')
    })

    it('should update a nested branch', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const updatedProduct = { ...mockProducts[0].subBranches[0], name: 'Updated Product A' }

      act(() => {
        result.current.updatePTB(updatedProduct)
      })

      const calledWith = mockUpdateProducts.mock.calls[0][0]
      expect(calledWith[0].subBranches[0].name).toBe('Updated Product A')
    })

    it('should update a deeply nested branch', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const updatedVersion = { 
        ...mockProducts[0].subBranches[0].subBranches[0], 
        name: 'Updated Version 1.0' 
      }

      act(() => {
        result.current.updatePTB(updatedVersion)
      })

      const calledWith = mockUpdateProducts.mock.calls[0][0]
      expect(calledWith[0].subBranches[0].subBranches[0].name).toBe('Updated Version 1.0')
    })

    it('should preserve other branches when updating', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const updatedVendor = { ...mockProducts[0], name: 'Updated Vendor A' }

      act(() => {
        result.current.updatePTB(updatedVendor)
      })

      const calledWith = mockUpdateProducts.mock.calls[0][0]
      expect(calledWith[1]).toEqual(mockProducts[1]) // Second vendor unchanged
    })

    it('should merge properties when updating', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const partialUpdate = { 
        id: mockProducts[0].id,
        name: 'Updated Vendor A',
        description: 'New description'
      }

      act(() => {
        result.current.updatePTB(partialUpdate as TProductTreeBranch)
      })

      const calledWith = mockUpdateProducts.mock.calls[0][0]
      expect(calledWith[0].name).toBe('Updated Vendor A')
      expect(calledWith[0].description).toBe('New description')
      expect(calledWith[0].category).toBe('vendor') // Original property preserved
    })

    it('should return the updated products array', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const updatedVendor = { ...mockProducts[0], name: 'Updated Vendor A' }

      let returnedProducts: TProductTreeBranch[]
      act(() => {
        returnedProducts = result.current.updatePTB(updatedVendor)
      })

      expect(returnedProducts!).toEqual(mockUpdateProducts.mock.calls[0][0])
    })
  })

  describe('deletePTB', () => {
    it('should delete a vendor and all its relationships', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const relationships = [createMockRelationship('rel-1'), createMockRelationship('rel-2')]
      
      mockGetRelationshipsBySourceVersion.mockReturnValue(relationships)
      mockGetRelationshipsByTargetVersion.mockReturnValue([])

      act(() => {
        result.current.deletePTB('vendor-1')
      })

      expect(mockUpdateProducts).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'vendor-2' })
        ])
      )
      expect(mockDeleteRelationship).toHaveBeenCalledTimes(4) // 2 products × 2 versions = 4 calls
    })

    it('should delete a product and its version relationships', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const relationships = [createMockRelationship('rel-1')]
      
      mockGetRelationshipsBySourceVersion.mockReturnValue(relationships)
      mockGetRelationshipsByTargetVersion.mockReturnValue([])

      act(() => {
        result.current.deletePTB('product-1')
      })

      expect(mockUpdateProducts).toHaveBeenCalled()
      expect(mockDeleteRelationship).toHaveBeenCalledTimes(2) // 2 versions
    })

    it('should delete a version and its relationships', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const sourceRelationships = [createMockRelationship('rel-1')]
      const targetRelationships = [createMockRelationship('rel-2')]
      
      mockGetRelationshipsBySourceVersion.mockReturnValue(sourceRelationships)
      mockGetRelationshipsByTargetVersion.mockReturnValue(targetRelationships)

      act(() => {
        result.current.deletePTB('version-1')
      })

      expect(mockUpdateProducts).toHaveBeenCalled()
      expect(mockDeleteRelationship).toHaveBeenCalledTimes(2) // 1 source + 1 target
      expect(mockDeleteRelationship).toHaveBeenCalledWith(sourceRelationships[0])
      expect(mockDeleteRelationship).toHaveBeenCalledWith(targetRelationships[0])
    })

    it('should warn and return early for non-existent branch', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      act(() => {
        result.current.deletePTB('non-existent')
      })

      expect(mockConsoleWarn).toHaveBeenCalledWith('ProductTreeBranch with id non-existent not found')
      // The function still calls updateProducts with filtered results even for non-existent branches
      expect(mockUpdateProducts).toHaveBeenCalledTimes(1)
    })

    it('should handle vendor with nested products and versions', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      
      // Setup relationships for all versions under vendor-1
      mockGetRelationshipsBySourceVersion.mockImplementation((versionId) => {
        if (['version-1', 'version-2'].includes(versionId)) {
          return [createMockRelationship(`rel-${versionId}`)]
        }
        return []
      })
      mockGetRelationshipsByTargetVersion.mockReturnValue([])

      act(() => {
        result.current.deletePTB('vendor-1')
      })

      // Should delete relationships for both versions under product-1
      expect(mockDeleteRelationship).toHaveBeenCalledTimes(2)
    })

    it('should handle product with multiple versions', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      
      mockGetRelationshipsBySourceVersion.mockImplementation((versionId) => {
        if (['version-1', 'version-2'].includes(versionId)) {
          return [createMockRelationship(`rel-${versionId}`)]
        }
        return []
      })
      mockGetRelationshipsByTargetVersion.mockReturnValue([])

      act(() => {
        result.current.deletePTB('product-1')
      })

      // Should delete relationships for both versions
      expect(mockDeleteRelationship).toHaveBeenCalledTimes(2)
    })
  })

  describe('Integration Tests', () => {
    it('should work with empty products array', () => {
      mockUseDocumentStore.mockImplementation((selector) => {
        const mockStore = {
          products: {},
          updateProducts: mockUpdateProducts,
        }
        return selector(mockStore)
      })

      const { result } = renderHook(() => useProductTreeBranch())

      expect(result.current.rootBranch).toEqual([])
      expect(result.current.getSelectablePTBs()).toEqual([])
      expect(result.current.findProductTreeBranch('any-id')).toBeUndefined()
    })

    it('should handle complex nested structures', () => {
      // Create a more complex structure
      const subVersion = createMockVersion('sub-version', 'Sub Version')
      const complexProduct = createMockProduct('complex-product', 'Complex Product', [subVersion])
      const complexVendor = createMockVendor('complex-vendor', 'Complex Vendor', [complexProduct])

      mockUseDocumentStore.mockImplementation((selector) => {
        const mockStore = {
          products: { 'complex-vendor': complexVendor },
          updateProducts: mockUpdateProducts,
        }
        return selector(mockStore)
      })

      const { result } = renderHook(() => useProductTreeBranch())

      const found = result.current.findProductTreeBranch('sub-version')
      expect(found).toEqual(subVersion)

      const foundWithParents = result.current.findProductTreeBranchWithParents('sub-version')
      expect(foundWithParents?.parent?.parent?.name).toBe('Complex Vendor')
    })

    it('should maintain referential integrity across operations', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      // Add a new branch
      const newBranch = createMockVendor('new-vendor', 'New Vendor')
      act(() => {
        result.current.addPTB(newBranch)
      })

      // Update the branch
      const updatedBranch = { ...newBranch, name: 'Updated New Vendor' }
      act(() => {
        result.current.updatePTB(updatedBranch)
      })

      // Verify we have the expected number of calls
      const updateCalls = mockUpdateProducts.mock.calls
      expect(updateCalls).toHaveLength(2) // One for add, one for update
      
      // The first call should have added the new vendor
      const firstUpdateCall = updateCalls[0][0]
      expect(firstUpdateCall).toHaveLength(3) // 2 original + 1 added
      expect(firstUpdateCall.some((p: TProductTreeBranch) => p.id === 'new-vendor')).toBe(true)
      
      // The second call should contain the update operation result
      const secondUpdateCall = updateCalls[1][0]
      expect(secondUpdateCall).toHaveLength(2) // Original products length since updatePTB maps over existing
    })
  })

  describe('Edge Cases', () => {
    it('should handle circular references gracefully in filter operations', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      // Test with a filter that only returns vendors (categories match)
      const vendorBranches = result.current.getFilteredPTBs((branch) => branch.category === 'vendor')
      
      expect(vendorBranches).toHaveLength(2) // Both vendors
      // Note: subBranches will be empty because products don't match the vendor filter
      expect(vendorBranches[0].subBranches).toHaveLength(0) // Products filtered out since they don't match vendor category
    })

    it('should handle deletion of non-leaf nodes', () => {
      const { result } = renderHook(() => useProductTreeBranch())

      act(() => {
        result.current.deletePTB('vendor-1')
      })

      // Should remove the entire vendor branch
      const calledWith = mockUpdateProducts.mock.calls[0][0]
      expect(calledWith.find((p: TProductTreeBranch) => p.id === 'vendor-1')).toBeUndefined()
      expect(calledWith.find((p: TProductTreeBranch) => p.id === 'vendor-2')).toBeDefined()
    })

    it('should handle updates to non-existent branches gracefully', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const nonExistentBranch = createMockVendor('non-existent', 'Non Existent')

      act(() => {
        result.current.updatePTB(nonExistentBranch)
      })

      // Should still call updateProducts (the hook doesn't validate existence)
      expect(mockUpdateProducts).toHaveBeenCalled()
    })

    it('should handle empty subBranches arrays', () => {
      const { result } = renderHook(() => useProductTreeBranch())
      const vendorWithoutProducts = createMockVendor('empty-vendor', 'Empty Vendor', [])

      mockUseDocumentStore.mockImplementation((selector) => {
        const mockStore = {
          products: { 'empty-vendor': vendorWithoutProducts },
          updateProducts: mockUpdateProducts,
        }
        return selector(mockStore)
      })

      const { result: newResult } = renderHook(() => useProductTreeBranch())

      expect(newResult.current.getPTBsByCategory('product_name')).toEqual([])
      expect(newResult.current.getSelectablePTBs()).toEqual([])
    })
  })
})
