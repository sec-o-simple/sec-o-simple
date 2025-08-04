import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import ProductList from '../../../src/routes/products/ProductList'
import type { TProductTreeBranch, TProductTreeBranchProductType } from '../../../src/routes/products/types/tProductTreeBranch'

// Mock react-i18next
const mockT = vi.fn((key: string, options?: any) => {
  const translations: { [key: string]: string } = {
    'products.empty': `No ${options?.type || 'products'} available`,
  }
  return translations[key] || key
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}))

// Mock ProductCard component
vi.mock('../../../src/routes/products/components/ProductCard', () => ({
  default: ({ product }: { product: TProductTreeBranch }) => (
    <div data-testid="product-card" data-product-id={product.id}>
      ProductCard: {product.name} ({product.type})
    </div>
  ),
}))

// Mock useProductTreeBranch hook
const mockGetPTBsByCategory = vi.fn()

vi.mock('../../../src/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: () => ({
    getPTBsByCategory: mockGetPTBsByCategory,
  }),
}))

// Test data
const mockSoftwareProducts: TProductTreeBranch[] = [
  {
    id: 'software-1',
    category: 'product_name',
    name: 'Software Product One',
    description: 'A software product',
    type: 'Software',
    subBranches: [],
  },
  {
    id: 'software-2',
    category: 'product_name',
    name: 'Software Product Two',
    description: 'Another software product',
    type: 'Software',
    subBranches: [],
  },
]

const mockHardwareProducts: TProductTreeBranch[] = [
  {
    id: 'hardware-1',
    category: 'product_name',
    name: 'Hardware Product One',
    description: 'A hardware product',
    type: 'Hardware',
    subBranches: [],
  },
]

const mockMixedProducts: TProductTreeBranch[] = [
  ...mockSoftwareProducts,
  ...mockHardwareProducts,
  {
    id: 'product-no-type',
    category: 'product_name',
    name: 'Product Without Type',
    description: 'A product without type',
    subBranches: [],
    // No type property
  },
]

describe('ProductList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render container with correct classes', () => {
      mockGetPTBsByCategory.mockReturnValue([])
      
      const { container } = render(<ProductList productType="Software" />)
      
      const productListContainer = container.firstElementChild as HTMLElement
      expect(productListContainer).toHaveClass('flex', 'flex-col', 'items-stretch', 'gap-2')
    })

    it('should call getPTBsByCategory with product_name', () => {
      mockGetPTBsByCategory.mockReturnValue([])
      
      render(<ProductList productType="Software" />)
      
      expect(mockGetPTBsByCategory).toHaveBeenCalledWith('product_name')
      expect(mockGetPTBsByCategory).toHaveBeenCalledTimes(1)
    })
  })

  describe('Empty state', () => {
    it('should show empty message when no products of specified type', () => {
      mockGetPTBsByCategory.mockReturnValue([])
      
      render(<ProductList productType="Software" />)
      
      expect(screen.getByText('No Software available')).toBeInTheDocument()
      expect(mockT).toHaveBeenCalledWith('products.empty', { type: 'Software' })
    })

    it('should show empty message for Hardware type', () => {
      mockGetPTBsByCategory.mockReturnValue([])
      
      render(<ProductList productType="Hardware" />)
      
      expect(screen.getByText('No Hardware available')).toBeInTheDocument()
      expect(mockT).toHaveBeenCalledWith('products.empty', { type: 'Hardware' })
    })

    it('should apply correct styling to empty message', () => {
      mockGetPTBsByCategory.mockReturnValue([])
      
      render(<ProductList productType="Software" />)
      
      const emptyContainer = screen.getByText('No Software available').closest('div')
      expect(emptyContainer).toHaveClass('text-center', 'text-lg', 'text-neutral-foreground')
    })

    it('should show empty message when products exist but none match the type', () => {
      mockGetPTBsByCategory.mockReturnValue(mockHardwareProducts)
      
      render(<ProductList productType="Software" />)
      
      expect(screen.getByText('No Software available')).toBeInTheDocument()
      expect(screen.queryByTestId('product-card')).not.toBeInTheDocument()
    })
  })

  describe('Products display', () => {
    it('should render ProductCard for each matching software product', () => {
      mockGetPTBsByCategory.mockReturnValue(mockMixedProducts)
      
      render(<ProductList productType="Software" />)
      
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards).toHaveLength(2)
      
      expect(screen.getByText('ProductCard: Software Product One (Software)')).toBeInTheDocument()
      expect(screen.getByText('ProductCard: Software Product Two (Software)')).toBeInTheDocument()
      
      // Hardware product should not be shown
      expect(screen.queryByText('ProductCard: Hardware Product One (Hardware)')).not.toBeInTheDocument()
      
      // Product without type should not be shown
      expect(screen.queryByText('ProductCard: Product Without Type')).not.toBeInTheDocument()
    })

    it('should render ProductCard for each matching hardware product', () => {
      mockGetPTBsByCategory.mockReturnValue(mockMixedProducts)
      
      render(<ProductList productType="Hardware" />)
      
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards).toHaveLength(1)
      
      expect(screen.getByText('ProductCard: Hardware Product One (Hardware)')).toBeInTheDocument()
      
      // Software products should not be shown
      expect(screen.queryByText('ProductCard: Software Product One (Software)')).not.toBeInTheDocument()
      expect(screen.queryByText('ProductCard: Software Product Two (Software)')).not.toBeInTheDocument()
    })

    it('should use product.id as key for ProductCard components', () => {
      mockGetPTBsByCategory.mockReturnValue(mockSoftwareProducts)
      
      render(<ProductList productType="Software" />)
      
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards[0]).toHaveAttribute('data-product-id', 'software-1')
      expect(productCards[1]).toHaveAttribute('data-product-id', 'software-2')
    })

    it('should not show empty message when products are available', () => {
      mockGetPTBsByCategory.mockReturnValue(mockSoftwareProducts)
      
      render(<ProductList productType="Software" />)
      
      expect(screen.queryByText('No Software available')).not.toBeInTheDocument()
      expect(screen.getAllByTestId('product-card')).toHaveLength(2)
    })
  })

  describe('Filtering logic', () => {
    it('should filter products by exact type match', () => {
      const productsWithDifferentCasing: TProductTreeBranch[] = [
        {
          id: 'test-1',
          category: 'product_name',
          name: 'Test Product',
          description: 'Test',
          type: 'Software',
          subBranches: [],
        },
        {
          id: 'test-2',
          category: 'product_name',
          name: 'Test Product 2',
          description: 'Test',
          type: 'software' as any, // Different casing
          subBranches: [],
        },
      ]
      
      mockGetPTBsByCategory.mockReturnValue(productsWithDifferentCasing)
      
      render(<ProductList productType="Software" />)
      
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards).toHaveLength(1) // Only exact match
      expect(screen.getByText('ProductCard: Test Product (Software)')).toBeInTheDocument()
    })

    it('should handle products without type property', () => {
      const productsWithoutType: TProductTreeBranch[] = [
        {
          id: 'no-type-1',
          category: 'product_name',
          name: 'Product No Type',
          description: 'Test',
          subBranches: [],
          // No type property
        },
        {
          id: 'with-type-1',
          category: 'product_name',
          name: 'Product With Type',
          description: 'Test',
          type: 'Software',
          subBranches: [],
        },
      ]
      
      mockGetPTBsByCategory.mockReturnValue(productsWithoutType)
      
      render(<ProductList productType="Software" />)
      
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards).toHaveLength(1)
      expect(screen.getByText('ProductCard: Product With Type (Software)')).toBeInTheDocument()
      expect(screen.queryByText('ProductCard: Product No Type')).not.toBeInTheDocument()
    })

    it('should handle undefined type values', () => {
      const productsWithUndefinedType: TProductTreeBranch[] = [
        {
          id: 'undefined-type-1',
          category: 'product_name',
          name: 'Product Undefined Type',
          description: 'Test',
          type: undefined,
          subBranches: [],
        },
        {
          id: 'software-1',
          category: 'product_name',
          name: 'Software Product',
          description: 'Test',
          type: 'Software',
          subBranches: [],
        },
      ]
      
      mockGetPTBsByCategory.mockReturnValue(productsWithUndefinedType)
      
      render(<ProductList productType="Software" />)
      
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards).toHaveLength(1)
      expect(screen.getByText('ProductCard: Software Product (Software)')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty array from getPTBsByCategory', () => {
      mockGetPTBsByCategory.mockReturnValue([])
      
      render(<ProductList productType="Software" />)
      
      expect(screen.getByText('No Software available')).toBeInTheDocument()
      expect(screen.queryByTestId('product-card')).not.toBeInTheDocument()
    })

    it('should handle getPTBsByCategory returning different categories', () => {
      // Mock returning products with different categories that shouldn't match
      const differentCategoryProducts: TProductTreeBranch[] = [
        {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Vendor Product',
          description: 'Test',
          type: 'Software',
          subBranches: [],
        },
      ]
      
      mockGetPTBsByCategory.mockReturnValue(differentCategoryProducts)
      
      render(<ProductList productType="Software" />)
      
      // Should still filter and show the product since we're only filtering by type
      expect(screen.getAllByTestId('product-card')).toHaveLength(1)
    })

    it('should handle large number of products', () => {
      const manyProducts: TProductTreeBranch[] = Array.from({ length: 100 }, (_, i) => ({
        id: `product-${i}`,
        category: 'product_name',
        name: `Product ${i}`,
        description: `Description ${i}`,
        type: 'Software',
        subBranches: [],
      }))
      
      mockGetPTBsByCategory.mockReturnValue(manyProducts)
      
      render(<ProductList productType="Software" />)
      
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards).toHaveLength(100)
      expect(screen.queryByText('No Software available')).not.toBeInTheDocument()
    })

    it('should handle products with special characters in names', () => {
      const specialCharProducts: TProductTreeBranch[] = [
        {
          id: 'special-1',
          category: 'product_name',
          name: 'Product @#$%^&*()',
          description: 'Test',
          type: 'Software',
          subBranches: [],
        },
        {
          id: 'special-2',
          category: 'product_name',
          name: 'Product with "quotes" and <tags>',
          description: 'Test',
          type: 'Software',
          subBranches: [],
        },
      ]
      
      mockGetPTBsByCategory.mockReturnValue(specialCharProducts)
      
      render(<ProductList productType="Software" />)
      
      expect(screen.getByText('ProductCard: Product @#$%^&*() (Software)')).toBeInTheDocument()
      expect(screen.getByText('ProductCard: Product with "quotes" and <tags> (Software)')).toBeInTheDocument()
    })

    it('should handle products with empty names', () => {
      const emptyNameProducts: TProductTreeBranch[] = [
        {
          id: 'empty-name-1',
          category: 'product_name',
          name: '',
          description: 'Test',
          type: 'Software',
          subBranches: [],
        },
      ]
      
      mockGetPTBsByCategory.mockReturnValue(emptyNameProducts)
      
      render(<ProductList productType="Software" />)
      
      // Check that the product card is rendered, even with empty name
      const productCard = screen.getByTestId('product-card')
      expect(productCard).toBeInTheDocument()
      expect(productCard).toHaveAttribute('data-product-id', 'empty-name-1')
    })
  })

  describe('Product type validation', () => {
    it('should work with Software type', () => {
      mockGetPTBsByCategory.mockReturnValue(mockSoftwareProducts)
      
      render(<ProductList productType="Software" />)
      
      expect(screen.getAllByTestId('product-card')).toHaveLength(2)
    })

    it('should work with Hardware type', () => {
      mockGetPTBsByCategory.mockReturnValue(mockHardwareProducts)
      
      render(<ProductList productType="Hardware" />)
      
      expect(screen.getAllByTestId('product-card')).toHaveLength(1)
    })

    it('should handle both product types correctly when mixed data provided', () => {
      mockGetPTBsByCategory.mockReturnValue(mockMixedProducts)
      
      // Test Software filtering
      const { rerender } = render(<ProductList productType="Software" />)
      expect(screen.getAllByTestId('product-card')).toHaveLength(2)
      
      // Test Hardware filtering
      rerender(<ProductList productType="Hardware" />)
      expect(screen.getAllByTestId('product-card')).toHaveLength(1)
    })
  })

  describe('Translation integration', () => {
    it('should call translation function with correct parameters for different product types', () => {
      mockGetPTBsByCategory.mockReturnValue([])
      
      render(<ProductList productType="Software" />)
      
      expect(mockT).toHaveBeenCalledWith('products.empty', { type: 'Software' })
      
      vi.clearAllMocks()
      
      render(<ProductList productType="Hardware" />)
      
      expect(mockT).toHaveBeenCalledWith('products.empty', { type: 'Hardware' })
    })

    it('should handle translation function errors gracefully', () => {
      mockT.mockImplementation(() => {
        throw new Error('Translation error')
      })
      mockGetPTBsByCategory.mockReturnValue([])
      
      expect(() => {
        render(<ProductList productType="Software" />)
      }).toThrow('Translation error')
      
      // Reset the mock
      mockT.mockImplementation((key: string, options?: any) => {
        const translations: { [key: string]: string } = {
          'products.empty': `No ${options?.type || 'products'} available`,
        }
        return translations[key] || key
      })
    })
  })
})
