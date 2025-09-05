import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  TProductFamily,
  TProductTreeBranch,
} from '../../../src/routes/products/types/tProductTreeBranch'
import { parseProductTreeBranches } from '../../../src/utils/csafExport/parseProductTreeBranches'

// Mock the getFamilyChain function
vi.mock('../../../src/routes/products/ProductFamily', () => ({
  getFamilyChain: vi.fn(),
}))

import { getFamilyChain } from '../../../src/routes/products/ProductFamily'

const mockGetFamilyChain = vi.mocked(getFamilyChain)

describe('parseProductTreeBranches', () => {
  const mockGetFullProductName = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetFullProductName.mockReturnValue('Full Product Name')
  })

  describe('basic parsing', () => {
    it('should parse a simple vendor branch', () => {
      const branches: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Test Vendor',
          description: 'Test vendor description',
          subBranches: [],
          type: undefined,
        },
      ]

      const result = parseProductTreeBranches(
        branches,
        [],
        mockGetFullProductName,
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        category: 'vendor',
        name: 'Test Vendor',
      })
    })

    it('should parse nested product structure without families', () => {
      const branches: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Test Vendor',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Test Product',
              description: 'Product description',
              subBranches: [
                {
                  id: 'version-1',
                  category: 'product_version',
                  name: 'Version 1.0',
                  description: 'Version description',
                  productName: 'Test Product v1.0',
                  subBranches: [],
                  type: undefined,
                },
              ],
              type: undefined,
            },
          ],
          type: undefined,
        },
      ]

      const result = parseProductTreeBranches(
        branches,
        [],
        mockGetFullProductName,
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        category: 'vendor',
        name: 'Test Vendor',
        branches: [
          {
            category: 'product_name',
            name: 'Test Product',
            branches: [
              {
                category: 'product_version',
                name: 'Version 1.0',
                product: {
                  name: 'Test Product v1.0',
                  product_id: 'version-1',
                  product_identification_helper: undefined,
                },
              },
            ],
          },
        ],
      })
    })

    it('should use getFullProductName when productName is not available', () => {
      const branches: TProductTreeBranch[] = [
        {
          id: 'version-1',
          category: 'product_version',
          name: 'Version 1.0',
          description: 'Version description',
          subBranches: [],
          type: undefined,
        },
      ]

      mockGetFullProductName.mockReturnValue('Generated Full Name')

      const result = parseProductTreeBranches(
        branches,
        [],
        mockGetFullProductName,
      )

      expect(result[0]).toEqual({
        category: 'product_version',
        name: 'Version 1.0',
        product: {
          name: 'Generated Full Name',
          product_id: 'version-1',
          product_identification_helper: undefined,
        },
      })

      expect(mockGetFullProductName).toHaveBeenCalledWith('version-1')
    })

    it('should include product identification helper when available', () => {
      const branches: TProductTreeBranch[] = [
        {
          id: 'version-1',
          category: 'product_version',
          name: 'Version 1.0',
          description: 'Version description',
          productName: 'Product v1.0',
          identificationHelper: {
            cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*',
          },
          subBranches: [],
          type: undefined,
        },
      ]

      const result = parseProductTreeBranches(
        branches,
        [],
        mockGetFullProductName,
      )

      expect(result[0]).toEqual({
        category: 'product_version',
        name: 'Version 1.0',
        product: {
          name: 'Product v1.0',
          product_id: 'version-1',
          product_identification_helper: {
            cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*',
          },
        },
      })
    })
  })

  describe('family integration', () => {
    it('should integrate single-level family hierarchy', () => {
      const mockFamily: TProductFamily = {
        id: 'family-1',
        name: 'Test Family',
        parent: null,
      }

      const families: TProductFamily[] = [mockFamily]

      const branches: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Test Vendor',
          description: 'Vendor description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Test Product',
              description: 'Product description',
              familyId: 'family-1',
              subBranches: [
                {
                  id: 'version-1',
                  category: 'product_version',
                  name: 'Version 1.0',
                  description: 'Version description',
                  productName: 'Test Product v1.0',
                  subBranches: [],
                  type: undefined,
                },
              ],
              type: undefined,
            },
          ],
          type: undefined,
        },
      ]

      mockGetFamilyChain.mockReturnValue([mockFamily])

      const result = parseProductTreeBranches(
        branches,
        families,
        mockGetFullProductName,
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        category: 'vendor',
        name: 'Test Vendor',
        branches: [
          {
            category: 'product_family',
            name: 'Test Family',
            branches: [
              {
                category: 'product_name',
                name: 'Test Product',
                branches: [
                  {
                    category: 'product_version',
                    name: 'Version 1.0',
                    product: {
                      name: 'Test Product v1.0',
                      product_id: 'version-1',
                      product_identification_helper: undefined,
                    },
                  },
                ],
              },
            ],
          },
        ],
      })

      expect(mockGetFamilyChain).toHaveBeenCalledWith(mockFamily)
    })

    it('should integrate multi-level family hierarchy', () => {
      const parentFamily: TProductFamily = {
        id: 'parent-family',
        name: 'Parent Family',
        parent: null,
      }

      const childFamily: TProductFamily = {
        id: 'child-family',
        name: 'Child Family',
        parent: parentFamily,
      }

      const families: TProductFamily[] = [parentFamily, childFamily]

      const branches: TProductTreeBranch[] = [
        {
          id: 'product-1',
          category: 'product_name',
          name: 'Test Product',
          description: 'Product description',
          familyId: 'child-family',
          subBranches: [
            {
              id: 'version-1',
              category: 'product_version',
              name: 'Version 1.0',
              description: 'Version description',
              productName: 'Test Product v1.0',
              subBranches: [],
              type: undefined,
            },
          ],
          type: undefined,
        },
      ]

      // Mock the family chain from child to parent
      mockGetFamilyChain.mockReturnValue([parentFamily, childFamily])

      const result = parseProductTreeBranches(
        branches,
        families,
        mockGetFullProductName,
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        category: 'product_family',
        name: 'Parent Family',
        branches: [
          {
            category: 'product_family',
            name: 'Child Family',
            branches: [
              {
                category: 'product_name',
                name: 'Test Product',
                branches: [
                  {
                    category: 'product_version',
                    name: 'Version 1.0',
                    product: {
                      name: 'Test Product v1.0',
                      product_id: 'version-1',
                      product_identification_helper: undefined,
                    },
                  },
                ],
              },
            ],
          },
        ],
      })
    })

    it('should handle product with familyId but no matching family', () => {
      const branches: TProductTreeBranch[] = [
        {
          id: 'product-1',
          category: 'product_name',
          name: 'Test Product',
          description: 'Product description',
          familyId: 'non-existent-family',
          subBranches: [
            {
              id: 'version-1',
              category: 'product_version',
              name: 'Version 1.0',
              description: 'Version description',
              productName: 'Test Product v1.0',
              subBranches: [],
              type: undefined,
            },
          ],
          type: undefined,
        },
      ]

      const result = parseProductTreeBranches(
        branches,
        [],
        mockGetFullProductName,
      )

      // Should return the product without family hierarchy
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        category: 'product_name',
        name: 'Test Product',
        branches: [
          {
            category: 'product_version',
            name: 'Version 1.0',
            product: {
              name: 'Test Product v1.0',
              product_id: 'version-1',
              product_identification_helper: undefined,
            },
          },
        ],
      })
    })

    it('should handle product with familyId but empty family chain', () => {
      const mockFamily: TProductFamily = {
        id: 'family-1',
        name: 'Test Family',
        parent: null,
      }

      const families: TProductFamily[] = [mockFamily]

      const branches: TProductTreeBranch[] = [
        {
          id: 'product-1',
          category: 'product_name',
          name: 'Test Product',
          description: 'Product description',
          familyId: 'family-1',
          subBranches: [],
          type: undefined,
        },
      ]

      mockGetFamilyChain.mockReturnValue([]) // Empty chain

      const result = parseProductTreeBranches(
        branches,
        families,
        mockGetFullProductName,
      )

      // Should return the product without family hierarchy
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        category: 'product_name',
        name: 'Test Product',
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty branches array', () => {
      const result = parseProductTreeBranches([], [], mockGetFullProductName)
      expect(result).toEqual([])
    })

    it('should handle branches with no subBranches', () => {
      const branches: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Test Vendor',
          description: 'Vendor description',
          subBranches: [],
          type: undefined,
        },
      ]

      const result = parseProductTreeBranches(
        branches,
        [],
        mockGetFullProductName,
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        category: 'vendor',
        name: 'Test Vendor',
      })
    })

    it('should handle non-product_version and non-product_name branches', () => {
      const branches: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Test Vendor',
          description: 'Vendor description',
          subBranches: [],
          type: undefined,
        },
      ]

      const result = parseProductTreeBranches(
        branches,
        [],
        mockGetFullProductName,
      )

      expect(result[0]).toEqual({
        category: 'vendor',
        name: 'Test Vendor',
      })

      // Should not have product property
      expect(result[0]).not.toHaveProperty('product')
    })

    it('should not call getFullProductName for non-product_version branches', () => {
      const branches: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Test Vendor',
          description: 'Vendor description',
          subBranches: [],
          type: undefined,
        },
      ]

      parseProductTreeBranches(branches, [], mockGetFullProductName)

      expect(mockGetFullProductName).not.toHaveBeenCalled()
    })

    it('should handle deeply nested structures', () => {
      const branches: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Vendor',
          description: 'Description',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Product',
              description: 'Description',
              subBranches: [
                {
                  id: 'version-1',
                  category: 'product_version',
                  name: 'v1.0',
                  description: 'Description',
                  productName: 'Product v1.0',
                  subBranches: [
                    {
                      id: 'subversion-1',
                      category: 'product_version',
                      name: 'v1.0.1',
                      description: 'Description',
                      productName: 'Product v1.0.1',
                      subBranches: [],
                      type: undefined,
                    },
                  ],
                  type: undefined,
                },
              ],
              type: undefined,
            },
          ],
          type: undefined,
        },
      ]

      const result = parseProductTreeBranches(
        branches,
        [],
        mockGetFullProductName,
      )

      expect(result[0].branches![0].branches![0].branches![0]).toEqual({
        category: 'product_version',
        name: 'v1.0.1',
        product: {
          name: 'Product v1.0.1',
          product_id: 'subversion-1',
          product_identification_helper: undefined,
        },
      })
    })
  })
})
