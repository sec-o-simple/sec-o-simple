import { uid } from 'uid'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  TProductTreeBranch,
  TProductTreeBranchWithParents,
} from '../../../../src/routes/products/types/tProductTreeBranch'
import {
  getDefaultProductTreeBranch,
  getPTBName,
  productTreeBranchCategories,
  productTreeBranchProductTypes,
} from '../../../../src/routes/products/types/tProductTreeBranch'

// Mock the uid module
vi.mock('uid', () => ({
  uid: vi.fn(() => 'mock-uid-123'),
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
      productTreeBranchCategories.forEach((category) => {
        const result = getDefaultProductTreeBranch(category)
        expect(result.subBranches).toEqual([])
        expect(Array.isArray(result.subBranches)).toBe(true)
      })
    })

    it('should always return empty name and description', () => {
      productTreeBranchCategories.forEach((category) => {
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
      productTreeBranchCategories.forEach((category) => {
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

  describe('constants and types', () => {
    it('should export correct productTreeBranchCategories', () => {
      expect(productTreeBranchCategories).toEqual([
        'vendor',
        'product_name',
        'product_version',
        'product_family',
      ])
      expect(productTreeBranchCategories).toHaveLength(4)
    })

    it('should export correct productTreeBranchProductTypes', () => {
      expect(productTreeBranchProductTypes).toEqual(['Software', 'Hardware'])
      expect(productTreeBranchProductTypes).toHaveLength(2)
    })

    it('should have readonly arrays for constants', () => {
      // Test that the constants are readonly by checking their type
      expect(productTreeBranchCategories).toEqual([
        'vendor',
        'product_name',
        'product_version',
        'product_family',
      ])
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

    it('should demonstrate the relationship between all functions', () => {
      mockUid.mockReturnValueOnce('parent-uid').mockReturnValueOnce('child-uid')

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

      // Verify IDs are different
      expect(parent.id).toBe('parent-uid')
      expect(child.id).toBe('child-uid')

      // Verify types
      expect(parent.type).toBeUndefined()
      expect(child.type).toBe('Software')
    })
  })
})
