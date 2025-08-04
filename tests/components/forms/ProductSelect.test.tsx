import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import ProductSelect from '../../../src/components/forms/ProductSelect'
import type { TSelectableFullProductName } from '../../../src/utils/useProductTreeBranch'

// Mock react-i18next
const mockT = vi.fn((key: string, options?: any) => {
  const translations: { [key: string]: string } = {
    'common.add': `Add ${options?.label || 'item'}`,
    'products.product.label': 'product'
  }
  return translations[key] || key
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}))

// Mock Autocomplete component
let mockOnSelectionChangeHandler: ((selected: string) => void) | null = null

vi.mock('../../../src/components/forms/Autocomplete', () => ({
  Autocomplete: ({ children, description, placeholder, onSelectionChange, isRequired, ...props }: any) => {
    mockOnSelectionChangeHandler = onSelectionChange
    return (
      <div 
        data-testid="autocomplete"
        data-description={description}
        data-placeholder={placeholder}
        data-is-required={isRequired?.toString() || 'false'}
        {...props}
      >
        {children}
        <button 
          data-testid="trigger-selection"
          onClick={() => mockOnSelectionChangeHandler?.('test-product-id')}
        >
          Trigger Selection
        </button>
      </div>
    )
  },
}))

// Mock AutocompleteItem component
vi.mock('@heroui/react', () => ({
  AutocompleteItem: ({ children, ...props }: any) => (
    <div 
      data-testid="autocomplete-item"
      {...props}
    >
      {children}
    </div>
  ),
}))

// Test data
const mockProducts: TSelectableFullProductName[] = [
  {
    category: 'product',
    full_product_name: {
      name: 'Product One',
      product_id: 'product-1'
    }
  },
  {
    category: 'product_version',
    full_product_name: {
      name: 'Product Two',
      product_id: 'product-2'
    }
  },
  {
    category: 'product',
    full_product_name: {
      name: 'Product Three',
      product_id: 'product-3'
    }
  }
]

describe('ProductSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render with default props', () => {
      render(<ProductSelect />)
      
      const autocomplete = screen.getByTestId('autocomplete')
      expect(autocomplete).toBeInTheDocument()
      expect(autocomplete).toHaveAttribute('data-description', '')
      expect(autocomplete).toHaveAttribute('data-is-required', 'false')
    })

    it('should render with all props provided', () => {
      const onAdd = vi.fn()
      
      render(
        <ProductSelect
          products={mockProducts}
          onAdd={onAdd}
          isRequired={true}
          selected={['product-1']}
          description="Select a product"
        />
      )
      
      const autocomplete = screen.getByTestId('autocomplete')
      expect(autocomplete).toBeInTheDocument()
      expect(autocomplete).toHaveAttribute('data-description', 'Select a product')
      expect(autocomplete).toHaveAttribute('data-is-required', 'true')
    })

    it('should render AutocompleteItems for all unselected products', () => {
      render(
        <ProductSelect
          products={mockProducts}
          selected={['product-1']}
        />
      )
      
      const items = screen.getAllByTestId('autocomplete-item')
      expect(items).toHaveLength(2) // 3 products - 1 selected = 2 items
      
      expect(screen.getByText('Product Two')).toBeInTheDocument()
      expect(screen.getByText('Product Three')).toBeInTheDocument()
      expect(screen.queryByText('Product One')).not.toBeInTheDocument()
    })

    it('should render all products when no products are selected', () => {
      render(
        <ProductSelect
          products={mockProducts}
          selected={[]}
        />
      )
      
      const items = screen.getAllByTestId('autocomplete-item')
      expect(items).toHaveLength(3)
      
      expect(screen.getByText('Product One')).toBeInTheDocument()
      expect(screen.getByText('Product Two')).toBeInTheDocument()
      expect(screen.getByText('Product Three')).toBeInTheDocument()
    })

    it('should render no items when all products are selected', () => {
      render(
        <ProductSelect
          products={mockProducts}
          selected={['product-1', 'product-2', 'product-3']}
        />
      )
      
      expect(screen.queryByTestId('autocomplete-item')).not.toBeInTheDocument()
    })

    it('should render no items when products array is empty', () => {
      render(<ProductSelect products={[]} />)
      
      expect(screen.queryByTestId('autocomplete-item')).not.toBeInTheDocument()
    })
  })

  describe('Translation and placeholder', () => {
    it('should call translation function with correct parameters', () => {
      render(<ProductSelect />)
      
      expect(mockT).toHaveBeenCalledWith('products.product.label')
      expect(mockT).toHaveBeenCalledWith('common.add', {
        label: 'product'
      })
    })

    it('should set correct placeholder text', () => {
      render(<ProductSelect />)
      
      const autocomplete = screen.getByTestId('autocomplete')
      expect(autocomplete).toHaveAttribute('data-placeholder', 'Add product')
    })
  })

  describe('Selection handling', () => {
    it('should call onAdd with correct product when selection changes', () => {
      const onAdd = vi.fn()
      
      render(
        <ProductSelect
          products={mockProducts}
          onAdd={onAdd}
        />
      )
      
      // Simulate selection change with product-2
      if (mockOnSelectionChangeHandler) {
        mockOnSelectionChangeHandler('product-2')
      }
      
      expect(onAdd).toHaveBeenCalledWith(mockProducts[1]) // product-2
      expect(onAdd).toHaveBeenCalledTimes(1)
    })

    it('should not call onAdd when onAdd is not provided', () => {
      render(
        <ProductSelect
          products={mockProducts}
        />
      )
      
      // This test ensures no error is thrown when onAdd is undefined
      expect(() => {
        if (mockOnSelectionChangeHandler) {
          mockOnSelectionChangeHandler('product-1')
        }
      }).not.toThrow()
    })

    it('should not call onAdd when selected product is not found', () => {
      const onAdd = vi.fn()
      
      render(
        <ProductSelect
          products={mockProducts}
          onAdd={onAdd}
        />
      )
      
      // Simulate selection with non-existent product
      if (mockOnSelectionChangeHandler) {
        mockOnSelectionChangeHandler('non-existent-product')
      }
      
      expect(onAdd).not.toHaveBeenCalled()
    })

    it('should handle null/undefined selection gracefully', () => {
      const onAdd = vi.fn()
      
      render(
        <ProductSelect
          products={mockProducts}
          onAdd={onAdd}
        />
      )
      
      expect(() => {
        if (mockOnSelectionChangeHandler) {
          mockOnSelectionChangeHandler(null as any)
        }
      }).not.toThrow()
      expect(onAdd).not.toHaveBeenCalled()
    })
  })

  describe('Filtering logic', () => {
    it('should filter out selected products correctly', () => {
      render(
        <ProductSelect
          products={mockProducts}
          selected={['product-1', 'product-3']}
        />
      )
      
      const items = screen.getAllByTestId('autocomplete-item')
      expect(items).toHaveLength(1)
      expect(screen.getByText('Product Two')).toBeInTheDocument()
      expect(screen.queryByText('Product One')).not.toBeInTheDocument()
      expect(screen.queryByText('Product Three')).not.toBeInTheDocument()
    })

    it('should handle partial matches in selected array', () => {
      render(
        <ProductSelect
          products={mockProducts}
          selected={['product-1', 'non-existent-id']}
        />
      )
      
      const items = screen.getAllByTestId('autocomplete-item')
      expect(items).toHaveLength(2) // Only product-1 should be filtered out
      expect(screen.getByText('Product Two')).toBeInTheDocument()
      expect(screen.getByText('Product Three')).toBeInTheDocument()
      expect(screen.queryByText('Product One')).not.toBeInTheDocument()
    })

    it('should handle empty selected array', () => {
      render(
        <ProductSelect
          products={mockProducts}
          selected={[]}
        />
      )
      
      const items = screen.getAllByTestId('autocomplete-item')
      expect(items).toHaveLength(3)
    })
  })

  describe('AutocompleteItem properties', () => {
    it('should render correct number of AutocompleteItems with correct product names', () => {
      render(
        <ProductSelect
          products={mockProducts}
        />
      )
      
      const items = screen.getAllByTestId('autocomplete-item')
      expect(items).toHaveLength(3)
      
      // Check that each product name is rendered
      expect(screen.getByText('Product One')).toBeInTheDocument()
      expect(screen.getByText('Product Two')).toBeInTheDocument()
      expect(screen.getByText('Product Three')).toBeInTheDocument()
    })

    it('should display correct product names in AutocompleteItems', () => {
      render(
        <ProductSelect
          products={mockProducts}
        />
      )
      
      expect(screen.getByText('Product One')).toBeInTheDocument()
      expect(screen.getByText('Product Two')).toBeInTheDocument()
      expect(screen.getByText('Product Three')).toBeInTheDocument()
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle products with empty names', () => {
      const productsWithEmptyName: TSelectableFullProductName[] = [
        {
          category: 'product',
          full_product_name: {
            name: '',
            product_id: 'empty-name-product'
          }
        }
      ]
      
      render(<ProductSelect products={productsWithEmptyName} />)
      
      const items = screen.getAllByTestId('autocomplete-item')
      expect(items).toHaveLength(1)
      expect(items[0]).toHaveTextContent('')
    })

    it('should handle products with special characters in names', () => {
      const productsWithSpecialChars: TSelectableFullProductName[] = [
        {
          category: 'product',
          full_product_name: {
            name: 'Product @#$%^&*()',
            product_id: 'special-chars-product'
          }
        }
      ]
      
      render(<ProductSelect products={productsWithSpecialChars} />)
      
      expect(screen.getByText('Product @#$%^&*()')).toBeInTheDocument()
    })

    it('should handle products with duplicate product_ids', () => {
      const productsWithDuplicateIds: TSelectableFullProductName[] = [
        {
          category: 'product',
          full_product_name: {
            name: 'Product One',
            product_id: 'duplicate-id'
          }
        },
        {
          category: 'product',
          full_product_name: {
            name: 'Product Two',
            product_id: 'duplicate-id'
          }
        }
      ]
      
      render(
        <ProductSelect 
          products={productsWithDuplicateIds}
          selected={['duplicate-id']}
        />
      )
      
      // Both items with the same ID should be filtered out
      expect(screen.queryByTestId('autocomplete-item')).not.toBeInTheDocument()
    })

    it('should handle different category types', () => {
      const productsWithDifferentCategories: TSelectableFullProductName[] = [
        {
          category: 'product',
          full_product_name: {
            name: 'Regular Product',
            product_id: 'regular-product'
          }
        },
        {
          category: 'product_version',
          full_product_name: {
            name: 'Product Version',
            product_id: 'product-version'
          }
        },
        {
          category: 'product_family',
          full_product_name: {
            name: 'Product Family',
            product_id: 'product-family'
          }
        }
      ]
      
      render(<ProductSelect products={productsWithDifferentCategories} />)
      
      const items = screen.getAllByTestId('autocomplete-item')
      expect(items).toHaveLength(3)
      expect(screen.getByText('Regular Product')).toBeInTheDocument()
      expect(screen.getByText('Product Version')).toBeInTheDocument()
      expect(screen.getByText('Product Family')).toBeInTheDocument()
    })

    it('should handle undefined products prop gracefully', () => {
      render(<ProductSelect products={undefined} />)
      
      expect(screen.queryByTestId('autocomplete-item')).not.toBeInTheDocument()
      expect(screen.getByTestId('autocomplete')).toBeInTheDocument()
    })

    it('should handle undefined selected prop gracefully', () => {
      render(
        <ProductSelect 
          products={mockProducts}
          selected={undefined}
        />
      )
      
      const items = screen.getAllByTestId('autocomplete-item')
      expect(items).toHaveLength(3) // All products should be shown
    })
  })

  describe('Props passing', () => {
    it('should pass isRequired prop to Autocomplete', () => {
      render(<ProductSelect isRequired={true} />)
      
      const autocomplete = screen.getByTestId('autocomplete')
      expect(autocomplete).toHaveAttribute('data-is-required', 'true')
    })

    it('should pass description prop to Autocomplete', () => {
      const description = 'This is a test description'
      render(<ProductSelect description={description} />)
      
      const autocomplete = screen.getByTestId('autocomplete')
      expect(autocomplete).toHaveAttribute('data-description', description)
    })

    it('should handle undefined description prop', () => {
      render(<ProductSelect description={undefined} />)
      
      const autocomplete = screen.getByTestId('autocomplete')
      expect(autocomplete).toHaveAttribute('data-description', '')
    })
  })
})
