import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getDefaultProductTreeBranch,
  getPTBName,
  getFullPTBName,
  productTreeBranchCategories,
  productTreeBranchProductTypes,
} from '../../../../src/routes/products/types/tProductTreeBranch'
import type {
  TProductTreeBranch,
  TProductTreeBranchWithParents,
  TProductTreeBranchCategory,
} from '../../../../src/routes/products/types/tProductTreeBranch'
import { uid } from 'uid'

// Mock the uid module
vi.mock('uid', () => ({
  uid: vi.fn(() => 'mock-uid-123')
}))

const mockUid = vi.mocked(uid)

describe('tProductTreeBranch', () => {

  beforeEach(() => {
    mockUid.mockClear()
    mockUid.mockReturnValue('mock-uid-123')
  })

  describe('getDefaultProductTreeBranch', () => {
    it('should create default vendor branch', () => {
      const result = getDefaultProductTreeBranch('vendor')

      expect(result).toEqual({
        id: 'mock-uid-123',
        category: 'vendor',
        name: '',
        description: '',
        subBranches: [],
        type: undefined,
      })
      expect(mockUid).toHaveBeenCalledOnce()
    })

    it('should create default product_name branch with Software type', () => {
      const result = getDefaultProductTreeBranch('product_name')

      expect(result).toEqual({
        id: 'mock-uid-123',
        category: 'product_name',
        name: '',
        description: '',
        subBranches: [],
        type: 'Software',
      })
      expect(mockUid).toHaveBeenCalledOnce()
    })

    it('should create default product_version branch', () => {
      const result = getDefaultProductTreeBranch('product_version')

      expect(result).toEqual({
        id: 'mock-uid-123',
        category: 'product_version',
        name: '',
        description: '',
        subBranches: [],
        type: undefined,
      })
      expect(mockUid).toHaveBeenCalledOnce()
    })

    it('should generate unique IDs for multiple calls', () => {
      mockUid
        .mockReturnValueOnce('uid-1')
        .mockReturnValueOnce('uid-2')
        .mockReturnValueOnce('uid-3')

      const vendor = getDefaultProductTreeBranch('vendor')
      const product = getDefaultProductTreeBranch('product_name')
      const version = getDefaultProductTreeBranch('product_version')

      expect(vendor.id).toBe('uid-1')
      expect(product.id).toBe('uid-2')
      expect(version.id).toBe('uid-3')
      expect(mockUid).toHaveBeenCalledTimes(3)
    })

    it('should set type to Software only for product_name category', () => {
      const vendor = getDefaultProductTreeBranch('vendor')
      const product = getDefaultProductTreeBranch('product_name')
      const version = getDefaultProductTreeBranch('product_version')

      expect(vendor.type).toBeUndefined()
      expect(product.type).toBe('Software')
      expect(version.type).toBeUndefined()
    })

    it('should always return empty subBranches array', () => {
      productTreeBranchCategories.forEach(category => {
        const result = getDefaultProductTreeBranch(category)
        expect(result.subBranches).toEqual([])
        expect(Array.isArray(result.subBranches)).toBe(true)
      })
    })

    it('should always return empty name and description', () => {
      productTreeBranchCategories.forEach(category => {
        const result = getDefaultProductTreeBranch(category)
        expect(result.name).toBe('')
        expect(result.description).toBe('')
      })
    })
  })

  describe('getPTBName', () => {
    it('should return "unknown product tree branch" when branch is undefined', () => {
      const result = getPTBName(undefined)
      expect(result).toBe('unknown product tree branch')
    })

    it('should return "unknown product tree branch" when branch is null', () => {
      const result = getPTBName(null as any)
      expect(result).toBe('unknown product tree branch')
    })

    it('should return branch name when name is provided', () => {
      const branch: TProductTreeBranch = {
        id: 'test-id',
        category: 'vendor',
        name: 'Test Vendor',
        description: 'Test Description',
        subBranches: [],
      }

      const result = getPTBName(branch)
      expect(result).toBe('Test Vendor')
    })

    it('should return null when branch exists but name is empty string', () => {
      const branch: TProductTreeBranch = {
        id: 'test-id',
        category: 'vendor',
        name: '',
        description: 'Test Description',
        subBranches: [],
      }

      const result = getPTBName(branch)
      expect(result).toBeNull()
    })

    it('should return null when branch exists but name is null', () => {
      const branch: TProductTreeBranch = {
        id: 'test-id',
        category: 'vendor',
        name: null as any,
        description: 'Test Description',
        subBranches: [],
      }

      const result = getPTBName(branch)
      expect(result).toBeNull()
    })

    it('should return null when branch exists but name is undefined', () => {
      const branch: TProductTreeBranch = {
        id: 'test-id',
        category: 'vendor',
        name: undefined as any,
        description: 'Test Description',
        subBranches: [],
      }

      const result = getPTBName(branch)
      expect(result).toBeNull()
    })

    it('should handle whitespace-only names as truthy', () => {
      const branch: TProductTreeBranch = {
        id: 'test-id',
        category: 'vendor',
        name: '   ',
        description: 'Test Description',
        subBranches: [],
      }

      const result = getPTBName(branch)
      expect(result).toBe('   ')
    })

    it('should handle different branch categories', () => {
      productTreeBranchCategories.forEach(category => {
        const branch: TProductTreeBranch = {
          id: `test-${category}-id`,
          category: category,
          name: `Test ${category} Name`,
          description: 'Test Description',
          subBranches: [],
        }

        const result = getPTBName(branch)
        expect(result).toBe(`Test ${category} Name`)
      })
    })
  })

  describe('getFullPTBName', () => {
    it('should return single name for branch without parent', () => {
      const branch: TProductTreeBranchWithParents = {
        id: 'root-id',
        category: 'vendor',
        name: 'Root Vendor',
        description: 'Root Description',
        subBranches: [],
        parent: null,
      }

      const result = getFullPTBName(branch)
      expect(result).toBe('Root Vendor')
    })

    it('should return combined names for parent-child relationship', () => {
      const parent: TProductTreeBranchWithParents = {
        id: 'parent-id',
        category: 'vendor',
        name: 'Parent Vendor',
        description: 'Parent Description',
        subBranches: [],
        parent: null,
      }

      const child: TProductTreeBranchWithParents = {
        id: 'child-id',
        category: 'product_name',
        name: 'Child Product',
        description: 'Child Description',
        subBranches: [],
        parent: parent,
      }

      const result = getFullPTBName(child)
      expect(result).toBe('Parent Vendor Child Product')
    })

    it('should handle multi-level hierarchy', () => {
      const grandparent: TProductTreeBranchWithParents = {
        id: 'grandparent-id',
        category: 'vendor',
        name: 'Grandparent Vendor',
        description: 'Grandparent Description',
        subBranches: [],
        parent: null,
      }

      const parent: TProductTreeBranchWithParents = {
        id: 'parent-id',
        category: 'product_name',
        name: 'Parent Product',
        description: 'Parent Description',
        subBranches: [],
        parent: grandparent,
      }

      const child: TProductTreeBranchWithParents = {
        id: 'child-id',
        category: 'product_version',
        name: 'Child Version',
        description: 'Child Description',
        subBranches: [],
        parent: parent,
      }

      const result = getFullPTBName(child)
      expect(result).toBe('Grandparent Vendor Parent Product Child Version')
    })

    it('should handle branches with empty names in hierarchy', () => {
      const parent: TProductTreeBranchWithParents = {
        id: 'parent-id',
        category: 'vendor',
        name: '',
        description: 'Parent Description',
        subBranches: [],
        parent: null,
      }

      const child: TProductTreeBranchWithParents = {
        id: 'child-id',
        category: 'product_name',
        name: 'Child Product',
        description: 'Child Description',
        subBranches: [],
        parent: parent,
      }

      const result = getFullPTBName(child)
      expect(result).toBe(' Child Product')
    })

    it('should handle branches with null names in hierarchy', () => {
      const parent: TProductTreeBranchWithParents = {
        id: 'parent-id',
        category: 'vendor',
        name: null as any,
        description: 'Parent Description',
        subBranches: [],
        parent: null,
      }

      const child: TProductTreeBranchWithParents = {
        id: 'child-id',
        category: 'product_name',
        name: 'Child Product',
        description: 'Child Description',
        subBranches: [],
        parent: parent,
      }

      const result = getFullPTBName(child)
      expect(result).toBe(' Child Product')
    })

    it('should handle single branch with empty name', () => {
      const branch: TProductTreeBranchWithParents = {
        id: 'root-id',
        category: 'vendor',
        name: '',
        description: 'Root Description',
        subBranches: [],
        parent: null,
      }

      const result = getFullPTBName(branch)
      expect(result).toBe('')
    })

    it('should handle single branch with null name', () => {
      const branch: TProductTreeBranchWithParents = {
        id: 'root-id',
        category: 'vendor',
        name: null as any,
        description: 'Root Description',
        subBranches: [],
        parent: null,
      }

      const result = getFullPTBName(branch)
      expect(result).toBe('')
    })

    it('should handle very deep hierarchy', () => {
      const level4: TProductTreeBranchWithParents = {
        id: 'level4-id',
        category: 'vendor',
        name: 'Level 4',
        description: 'Level 4 Description',
        subBranches: [],
        parent: null,
      }

      const level3: TProductTreeBranchWithParents = {
        id: 'level3-id',
        category: 'product_name',
        name: 'Level 3',
        description: 'Level 3 Description',
        subBranches: [],
        parent: level4,
      }

      const level2: TProductTreeBranchWithParents = {
        id: 'level2-id',
        category: 'product_version',
        name: 'Level 2',
        description: 'Level 2 Description',
        subBranches: [],
        parent: level3,
      }

      const level1: TProductTreeBranchWithParents = {
        id: 'level1-id',
        category: 'vendor',
        name: 'Level 1',
        description: 'Level 1 Description',
        subBranches: [],
        parent: level2,
      }

      const result = getFullPTBName(level1)
      expect(result).toBe('Level 4 Level 3 Level 2 Level 1')
    })

    it('should handle mixed empty and non-empty names in hierarchy', () => {
      const parent: TProductTreeBranchWithParents = {
        id: 'parent-id',
        category: 'vendor',
        name: 'Valid Parent',
        description: 'Parent Description',
        subBranches: [],
        parent: null,
      }

      const middle: TProductTreeBranchWithParents = {
        id: 'middle-id',
        category: 'product_name',
        name: '',
        description: 'Middle Description',
        subBranches: [],
        parent: parent,
      }

      const child: TProductTreeBranchWithParents = {
        id: 'child-id',
        category: 'product_version',
        name: 'Valid Child',
        description: 'Child Description',
        subBranches: [],
        parent: middle,
      }

      const result = getFullPTBName(child)
      expect(result).toBe('Valid Parent  Valid Child')
    })

    it('should handle whitespace-only names in hierarchy', () => {
      const parent: TProductTreeBranchWithParents = {
        id: 'parent-id',
        category: 'vendor',
        name: '   ',
        description: 'Parent Description',
        subBranches: [],
        parent: null,
      }

      const child: TProductTreeBranchWithParents = {
        id: 'child-id',
        category: 'product_name',
        name: 'Valid Child',
        description: 'Child Description',
        subBranches: [],
        parent: parent,
      }

      const result = getFullPTBName(child)
      expect(result).toBe('    Valid Child')
    })
  })

  describe('constants and types', () => {
    it('should export correct productTreeBranchCategories', () => {
      expect(productTreeBranchCategories).toEqual(['vendor', 'product_name', 'product_version'])
      expect(productTreeBranchCategories).toHaveLength(3)
    })

    it('should export correct productTreeBranchProductTypes', () => {
      expect(productTreeBranchProductTypes).toEqual(['Software', 'Hardware'])
      expect(productTreeBranchProductTypes).toHaveLength(2)
    })

    it('should have readonly arrays for constants', () => {
      // Test that the constants are readonly by checking their type
      expect(productTreeBranchCategories).toEqual(['vendor', 'product_name', 'product_version'])
      expect(productTreeBranchProductTypes).toEqual(['Software', 'Hardware'])
      
      // TypeScript will prevent mutations at compile time
      // The arrays are defined with 'as const' making them readonly tuples
      expect(Object.isFrozen(productTreeBranchCategories)).toBe(false) // 'as const' doesn't freeze, just makes readonly at type level
      expect(Object.isFrozen(productTreeBranchProductTypes)).toBe(false)
    })
  })

  describe('integration tests', () => {
    it('should work together - create default branch and get its name', () => {
      mockUid.mockReturnValue('integration-test-id')
      
      const branch = getDefaultProductTreeBranch('vendor')
      const name = getPTBName(branch)
      
      expect(branch.id).toBe('integration-test-id')
      expect(branch.name).toBe('')
      expect(name).toBeNull() // Because default name is empty string
    })

    it('should work together - create branch with name and get full name', () => {
      const branchWithParent: TProductTreeBranchWithParents = {
        ...getDefaultProductTreeBranch('product_name'),
        name: 'Test Product',
        parent: null,
      }
      
      const fullName = getFullPTBName(branchWithParent)
      expect(fullName).toBe('Test Product')
    })

    it('should demonstrate the relationship between all functions', () => {
      mockUid
        .mockReturnValueOnce('parent-uid')
        .mockReturnValueOnce('child-uid')

      // Create parent branch
      const parentBase = getDefaultProductTreeBranch('vendor')
      const parent: TProductTreeBranchWithParents = {
        ...parentBase,
        name: 'Vendor Name',
        parent: null,
      }

      // Create child branch
      const childBase = getDefaultProductTreeBranch('product_name')
      const child: TProductTreeBranchWithParents = {
        ...childBase,
        name: 'Product Name',
        parent: parent,
      }

      // Test individual names
      expect(getPTBName(parent)).toBe('Vendor Name')
      expect(getPTBName(child)).toBe('Product Name')

      // Test full name
      expect(getFullPTBName(child)).toBe('Vendor Name Product Name')

      // Verify IDs are different
      expect(parent.id).toBe('parent-uid')
      expect(child.id).toBe('child-uid')

      // Verify types
      expect(parent.type).toBeUndefined()
      expect(child.type).toBe('Software')
    })
  })
})
