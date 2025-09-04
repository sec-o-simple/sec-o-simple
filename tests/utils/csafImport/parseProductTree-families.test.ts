import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDefaultProductTreeBranch } from '../../../src/routes/products/types/tProductTreeBranch'
import { parseProductTree } from '../../../src/utils/csafImport/parseProductTree'

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

describe('parseProductTree - Family Integration', () => {
  const mockGetDefaultProductTreeBranch = vi.mocked(getDefaultProductTreeBranch)

  beforeEach(() => {
    mockGetDefaultProductTreeBranch.mockClear()
  })

  it('should return correct structure with products and families arrays', () => {
    const result = parseProductTree({})

    expect(result).toHaveProperty('products')
    expect(result).toHaveProperty('families')
    expect(Array.isArray(result.products)).toBe(true)
    expect(Array.isArray(result.families)).toBe(true)
  })

  it('should extract families from product_family branches', () => {
    const csafDocument = {
      product_tree: {
        branches: [
          {
            category: 'vendor',
            name: 'Apple Inc.',
            branches: [
              {
                category: 'product_family',
                name: 'MacBook',
                branches: [
                  {
                    category: 'product_family',
                    name: 'MacBook Pro',
                    branches: [
                      {
                        category: 'product_name',
                        name: 'MacBook Pro 16-inch',
                        product: {
                          product_id: 'mbp-16',
                          name: 'MacBook Pro 16-inch',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    }

    const result = parseProductTree(csafDocument)

    // Should extract 2 families: MacBook and MacBook Pro
    expect(result.families).toHaveLength(2)

    const macbookFamily = result.families.find((f) => f.name === 'MacBook')
    const macbookProFamily = result.families.find(
      (f) => f.name === 'MacBook Pro',
    )

    expect(macbookFamily).toBeDefined()
    expect(macbookProFamily).toBeDefined()

    // MacBook should have no parent (root family)
    expect(macbookFamily?.parent).toBeNull()

    // MacBook Pro should have MacBook as parent
    expect(macbookProFamily?.parent).toBe(macbookFamily)
  })

  it('should link products to families via familyId', () => {
    const csafDocument = {
      product_tree: {
        branches: [
          {
            category: 'vendor',
            name: 'Apple Inc.',
            branches: [
              {
                category: 'product_family',
                name: 'MacBook',
                branches: [
                  {
                    category: 'product_name',
                    name: 'MacBook Air',
                    product: {
                      product_id: 'mba-13',
                      name: 'MacBook Air 13-inch',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    }

    const result = parseProductTree(csafDocument)

    // Should have 1 family and 1 vendor with 1 product
    expect(result.families).toHaveLength(1)
    expect(result.products).toHaveLength(1)

    const macbookFamily = result.families[0]
    const vendor = result.products[0]
    const product = vendor.subBranches[0]

    // Product should reference the family via familyId
    expect(product.familyId).toBe(macbookFamily.id)
    expect(product.name).toBe('MacBook Air')
  })

  it('should handle multiple nested families correctly', () => {
    const csafDocument = {
      product_tree: {
        branches: [
          {
            category: 'vendor',
            name: 'Apple Inc.',
            branches: [
              {
                category: 'product_family',
                name: 'iPhone',
                branches: [
                  {
                    category: 'product_family',
                    name: 'iPhone Pro',
                    branches: [
                      {
                        category: 'product_name',
                        name: 'iPhone 15 Pro',
                        product: { product_id: 'iphone-15-pro' },
                      },
                    ],
                  },
                  {
                    category: 'product_name',
                    name: 'iPhone 15',
                    product: { product_id: 'iphone-15' },
                  },
                ],
              },
            ],
          },
        ],
      },
    }

    const result = parseProductTree(csafDocument)

    // Should have 2 families: iPhone and iPhone Pro
    expect(result.families).toHaveLength(2)

    const iphoneFamily = result.families.find((f) => f.name === 'iPhone')
    const iphoneProFamily = result.families.find((f) => f.name === 'iPhone Pro')

    expect(iphoneFamily?.parent).toBeNull()
    expect(iphoneProFamily?.parent).toBe(iphoneFamily)

    // Should have 1 vendor with 2 products
    const vendor = result.products[0]
    expect(vendor.subBranches).toHaveLength(2)

    const iphone15Pro = vendor.subBranches.find(
      (p) => p.name === 'iPhone 15 Pro',
    )
    const iphone15 = vendor.subBranches.find((p) => p.name === 'iPhone 15')

    // iPhone 15 Pro should reference iPhone Pro family
    expect(iphone15Pro?.familyId).toBe(iphoneProFamily?.id)

    // iPhone 15 should reference iPhone family (the parent family context)
    expect(iphone15?.familyId).toBe(iphoneFamily?.id)
  })
})
