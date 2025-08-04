import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseProductTree } from '../../../src/utils/csafImport/parseProductTree'
import { getDefaultProductTreeBranch } from '../../../src/routes/products/types/tProductTreeBranch'

// Mock the dependencies
vi.mock('../../../src/routes/products/types/tProductTreeBranch', () => ({
  getDefaultProductTreeBranch: vi.fn((category) => ({
    id: `default-${category}-id`,
    category: category,
    name: `Default ${category} name`,
    description: `Default ${category} description`,
    subBranches: [],
    type: category === 'product_name' ? 'Software' : undefined,
  })),
  productTreeBranchCategories: ['vendor', 'product_name', 'product_version'],
}))

describe('parseProductTree', () => {
  const mockGetDefaultProductTreeBranch = vi.mocked(getDefaultProductTreeBranch)

  beforeEach(() => {
    mockGetDefaultProductTreeBranch.mockClear()
  })

  describe('parseProductTree function', () => {
    it('should throw error when csafDocument is undefined', () => {
      expect(() => parseProductTree(undefined as any)).toThrow()
    })

    it('should return empty array when csafDocument is empty object', () => {
      const result = parseProductTree({})
      
      expect(result).toEqual([])
    })

    it('should return empty array when product_tree is undefined', () => {
      const csafDocument = {
        document: { title: 'Test Document' }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toEqual([])
    })

    it('should return empty array when product_tree.branches is undefined', () => {
      const csafDocument = {
        product_tree: {}
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toEqual([])
    })

    it('should return empty array when product_tree.branches is empty array', () => {
      const csafDocument = {
        product_tree: {
          branches: []
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toEqual([])
    })

    it('should parse single branch with minimal data', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              category: 'vendor',
              name: 'Test Vendor'
            }
          ]
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'default-vendor-id',
        category: 'vendor',
        name: 'Test Vendor',
        productName: undefined,
        description: 'Default vendor description',
        identificationHelper: undefined,
        subBranches: [],
        type: undefined,
      })
      expect(mockGetDefaultProductTreeBranch).toHaveBeenCalledWith('vendor')
    })

    it('should parse single branch with complete product data', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              category: 'product_name',
              name: 'Test Product',
              product: {
                product_id: 'prod-123',
                name: 'Product Description',
                product_identification_helper: {
                  cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*'
                }
              }
            }
          ]
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'prod-123',
        category: 'product_name',
        name: 'Test Product',
        productName: 'Product Description',
        description: 'Product Description',
        identificationHelper: {
          cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*'
        },
        subBranches: [],
        type: undefined,
      })
      expect(mockGetDefaultProductTreeBranch).toHaveBeenCalledWith('product_name')
    })

    it('should use default values when product data is missing', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              category: 'product_version',
              name: '', // Empty name should use default
              product: {
                // Missing product_id and name should use defaults
              }
            }
          ]
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'default-product_version-id',
        category: 'product_version',
        name: 'Default product_version name', // Should use default because name is empty
        productName: undefined,
        description: 'Default product_version description', // Should use default because product.name is missing
        identificationHelper: undefined,
        subBranches: [],
        type: undefined,
      })
    })

    it('should parse nested branches recursively', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              category: 'vendor',
              name: 'Parent Vendor',
              branches: [
                {
                  category: 'product_name',
                  name: 'Child Product',
                  product: {
                    product_id: 'child-prod-123',
                    name: 'Child Product Description'
                  }
                },
                {
                  category: 'product_version',
                  name: 'Child Version',
                  branches: [
                    {
                      category: 'product_name',
                      name: 'Grandchild Product',
                      product: {
                        product_id: 'grandchild-prod-456'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'default-vendor-id',
        category: 'vendor',
        name: 'Parent Vendor',
        productName: undefined,
        description: 'Default vendor description',
        identificationHelper: undefined,
        subBranches: [
          {
            id: 'child-prod-123',
            category: 'product_name',
            name: 'Child Product',
            productName: 'Child Product Description',
            description: 'Child Product Description',
            identificationHelper: undefined,
            subBranches: [],
            type: undefined,
          },
          {
            id: 'default-product_version-id',
            category: 'product_version',
            name: 'Child Version',
            productName: undefined,
            description: 'Default product_version description',
            identificationHelper: undefined,
            subBranches: [
              {
                id: 'grandchild-prod-456',
                category: 'product_name',
                name: 'Grandchild Product',
                productName: undefined,
                description: 'Default product_name description',
                identificationHelper: undefined,
                subBranches: [],
                type: undefined,
              }
            ],
            type: undefined,
          }
        ],
        type: undefined,
      })
    })

    it('should handle multiple top-level branches', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              category: 'vendor',
              name: 'Vendor 1',
              product: {
                product_id: 'vendor-1-id',
                name: 'Vendor 1 Description'
              }
            },
            {
              category: 'vendor',
              name: 'Vendor 2',
              product: {
                product_id: 'vendor-2-id',
                name: 'Vendor 2 Description'
              }
            },
            {
              category: 'product_name',
              name: 'Product 1'
            }
          ]
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toHaveLength(3)
      expect(result[0].name).toBe('Vendor 1')
      expect(result[0].id).toBe('vendor-1-id')
      expect(result[1].name).toBe('Vendor 2')
      expect(result[1].id).toBe('vendor-2-id')
      expect(result[2].name).toBe('Product 1')
      expect(result[2].id).toBe('default-product_name-id')
    })

    it('should handle branches with empty sub-branches array', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              category: 'vendor',
              name: 'Test Vendor',
              branches: [] // Explicitly empty
            }
          ]
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toHaveLength(1)
      expect(result[0].subBranches).toEqual([])
    })

    it('should handle product identification helper with various properties', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              category: 'product_name',
              name: 'Complex Product',
              product: {
                product_id: 'complex-prod-123',
                name: 'Complex Product Description',
                product_identification_helper: {
                  cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*',
                  purl: 'pkg:npm/example@1.0.0',
                  model_numbers: ['MODEL-123', 'MODEL-456'],
                  serial_numbers: ['SN-789', 'SN-012'],
                  hashes: [
                    {
                      filename: 'file1.exe',
                      file_hashes: [
                        { algorithm: 'SHA256', value: 'abc123def456' }
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toHaveLength(1)
      expect(result[0].identificationHelper).toEqual({
        cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*',
        purl: 'pkg:npm/example@1.0.0',
        model_numbers: ['MODEL-123', 'MODEL-456'],
        serial_numbers: ['SN-789', 'SN-012'],
        hashes: [
          {
            filename: 'file1.exe',
            file_hashes: [
              { algorithm: 'SHA256', value: 'abc123def456' }
            ]
          }
        ]
      })
    })

    it('should handle null and undefined values gracefully', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              category: 'vendor',
              name: undefined, // undefined name
              product: {
                product_id: undefined, // undefined product_id
                name: undefined, // undefined name
                product_identification_helper: null
              }
            }
          ]
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'default-vendor-id', // Should use default when product_id is undefined
        category: 'vendor',
        name: 'Default vendor name', // Should use default when name is undefined/falsy
        productName: undefined,
        description: 'Default vendor description', // Should use default when product.name is undefined
        identificationHelper: null,
        subBranches: [],
        type: undefined,
      })
    })

    it('should preserve type as undefined for all branches', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              category: 'vendor',
              name: 'Test Vendor'
            },
            {
              category: 'product_name',
              name: 'Test Product'
            },
            {
              category: 'product_version',
              name: 'Test Version'
            }
          ]
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toHaveLength(3)
      result.forEach(branch => {
        expect(branch.type).toBeUndefined()
      })
    })

    it('should call getDefaultProductTreeBranch for each branch with correct category', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            { category: 'vendor', name: 'Vendor' },
            { category: 'product_name', name: 'Product' },
            { category: 'product_version', name: 'Version' }
          ]
        }
      }
      
      parseProductTree(csafDocument)
      
      expect(mockGetDefaultProductTreeBranch).toHaveBeenCalledTimes(3)
      expect(mockGetDefaultProductTreeBranch).toHaveBeenCalledWith('vendor')
      expect(mockGetDefaultProductTreeBranch).toHaveBeenCalledWith('product_name')
      expect(mockGetDefaultProductTreeBranch).toHaveBeenCalledWith('product_version')
    })

    it('should handle very deep nesting', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              category: 'vendor',
              name: 'Level 1',
              branches: [
                {
                  category: 'product_name',
                  name: 'Level 2',
                  branches: [
                    {
                      category: 'product_version',
                      name: 'Level 3',
                      branches: [
                        {
                          category: 'vendor',
                          name: 'Level 4'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
      
      const result = parseProductTree(csafDocument)
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Level 1')
      expect(result[0].subBranches).toHaveLength(1)
      expect(result[0].subBranches[0].name).toBe('Level 2')
      expect(result[0].subBranches[0].subBranches).toHaveLength(1)
      expect(result[0].subBranches[0].subBranches[0].name).toBe('Level 3')
      expect(result[0].subBranches[0].subBranches[0].subBranches).toHaveLength(1)
      expect(result[0].subBranches[0].subBranches[0].subBranches[0].name).toBe('Level 4')
    })
  })

  describe('edge cases and error handling', () => {
    it('should throw error when branches is not an array', () => {
      const csafDocument = {
        product_tree: {
          branches: 'invalid' // Should be array
        }
      }
      
      expect(() => parseProductTree(csafDocument as any)).toThrow()
    })

    it('should throw error when branches array contains null/undefined elements', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            null,
            {
              category: 'vendor',
              name: 'Valid Vendor'
            },
            undefined
          ]
        }
      }
      
      expect(() => parseProductTree(csafDocument as any)).toThrow()
    })

    it('should handle missing required properties without throwing', () => {
      const csafDocument = {
        product_tree: {
          branches: [
            {
              // Missing category - but implementation handles it
              name: 'Test Name'
            }
          ]
        }
      }
      
      // The implementation doesn't validate required properties
      expect(() => parseProductTree(csafDocument as any)).not.toThrow()
    })
  })
})
