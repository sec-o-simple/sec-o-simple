import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProductCard from '../../../../src/routes/products/components/ProductCard'
import { TProductTreeBranch } from '../../../../src/routes/products/types/tProductTreeBranch'

// Mock all external dependencies
vi.mock('../../../../src/components/forms/IconButton', () => ({
  default: ({ icon, tooltip, onPress, ...props }: any) => (
    <button 
      data-testid="icon-button" 
      onClick={onPress}
      title={tooltip}
      {...props}
    >
      IconButton
    </button>
  )
}))

// Create mock functions for useProductTreeBranch
const mockDeletePTB = vi.fn()
const mockFindProductTreeBranch = vi.fn((id: string) => ({
  id,
  name: `Found Product ${id}`,
  category: 'product_version' as const,
  description: 'Found description',
  subBranches: [],
}))

vi.mock('../../../../src/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: () => ({
    deletePTB: mockDeletePTB,
    findProductTreeBranch: mockFindProductTreeBranch
  })
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faCodeFork: 'faCodeFork'
}))

vi.mock('@heroui/chip', () => ({
  Chip: ({ children, color, variant, radius, size, ...props }: any) => (
    <div 
      data-testid="chip" 
      data-color={color}
      data-variant={variant}
      data-radius={radius}
      data-size={size}
      {...props}
    >
      {children}
    </div>
  )
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'untitled.vendor': 'Untitled Vendor',
        'untitled.product_name': 'Untitled Product',
        'untitled.product_version': 'Untitled Version',
        'products.unknownType': 'Unknown Type',
        'products.product.version.edit': options?.count === 2 ? 'Edit Versions' : 'Edit Version'
      }
      return translations[key] || key
    }
  })
}))

// Create mock navigate function
const mockNavigate = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../../../../src/routes/products/components/InfoCard', () => ({
  default: ({ 
    variant, 
    title, 
    description, 
    linkTo, 
    startContent, 
    endContent, 
    onEdit, 
    onDelete,
    children,
    ...props 
  }: any) => (
    <div 
      data-testid="info-card"
      data-variant={variant}
      data-title={title}
      data-description={description === undefined ? undefined : description}
      data-link-to={linkTo}
      {...props}
    >
      <div data-testid="start-content">{startContent}</div>
      <div data-testid="title">{title}</div>
      <div data-testid="description">{description}</div>
      <div data-testid="end-content">{endContent}</div>
      {onEdit && (
        <button data-testid="edit-button" onClick={onEdit}>
          Edit
        </button>
      )}
      {onDelete && (
        <button data-testid="delete-button" onClick={onDelete}>
          Delete
        </button>
      )}
      <div data-testid="children">{children}</div>
    </div>
  )
}))

vi.mock('../../../../src/routes/products/components/TagList', () => ({
  default: ({ items, linkGenerator, labelGenerator }: any) => (
    <div data-testid="tag-list">
      {items.map((item: any, index: number) => (
        <div key={index} data-testid={`tag-item-${index}`}>
          {labelGenerator ? labelGenerator(item) : item.name || 'Tag'}
          {linkGenerator && (
            <span data-testid={`tag-link-${index}`}>
              {linkGenerator(item)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}))

// Helper function to render component with router context
function renderWithRouter(component: React.ReactElement) {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

describe('ProductCard', () => {
  const mockProduct: TProductTreeBranch = {
    id: 'test-product-123',
    category: 'product_name',
    name: 'Test Product',
    description: 'Test product description',
    subBranches: [],
    type: 'Software'
  }

  const mockProductWithSubBranches: TProductTreeBranch = {
    id: 'test-product-456',
    category: 'vendor',
    name: 'Test Vendor',
    description: 'Test vendor description',
    subBranches: [
      {
        id: 'sub-1',
        category: 'product_version',
        name: 'Version 1.0',
        description: 'Version description',
        subBranches: []
      },
      {
        id: 'sub-2',
        category: 'product_version',
        name: 'Version 2.0',
        description: 'Version description',
        subBranches: []
      }
    ],
    type: 'Hardware'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDeletePTB.mockClear()
    mockFindProductTreeBranch.mockClear()
    mockNavigate.mockClear()
  })

  describe('Basic Functionality', () => {
    it('should render with minimal props', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      expect(screen.getByTestId('info-card')).toBeInTheDocument()
      expect(screen.getByTestId('title')).toHaveTextContent('Test Product')
      expect(screen.getByTestId('description')).toHaveTextContent('Test product description')
    })

    it('should render product with all properties', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      const infoCard = screen.getByTestId('info-card')
      expect(infoCard).toHaveAttribute('data-variant', 'boxed')
      expect(infoCard).toHaveAttribute('data-title', 'Test Product')
      expect(infoCard).toHaveAttribute('data-description', 'Test product description')
      expect(infoCard).toHaveAttribute('data-link-to', 'product/test-product-123')
    })

    it('should pass through additional props to InfoCard', () => {
      renderWithRouter(<ProductCard product={mockProduct} className="custom-class" />)
      
      const infoCard = screen.getByTestId('info-card')
      expect(infoCard).toHaveClass('custom-class')
    })
  })

  describe('Product Name Handling', () => {
    it('should display product name when available', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      expect(screen.getByTestId('title')).toHaveTextContent('Test Product')
    })

    it('should display fallback title when product name is empty', () => {
      const productWithoutName = { ...mockProduct, name: '' }
      renderWithRouter(<ProductCard product={productWithoutName} />)
      
      expect(screen.getByTestId('title')).toHaveTextContent('Untitled Product')
    })

    it('should display fallback title when product name is null', () => {
      const productWithoutName = { ...mockProduct, name: null as any }
      renderWithRouter(<ProductCard product={productWithoutName} />)
      
      expect(screen.getByTestId('title')).toHaveTextContent('Untitled Product')
    })

    it('should handle different product categories for fallback titles', () => {
      const vendorProduct = { ...mockProduct, name: '', category: 'vendor' as const }
      renderWithRouter(<ProductCard product={vendorProduct} />)
      
      expect(screen.getByTestId('title')).toHaveTextContent('Untitled Vendor')
    })

    it('should handle product_version category for fallback titles', () => {
      const versionProduct = { ...mockProduct, name: '', category: 'product_version' as const }
      renderWithRouter(<ProductCard product={versionProduct} />)
      
      expect(screen.getByTestId('title')).toHaveTextContent('Untitled Version')
    })
  })

  describe('Product Type Display', () => {
    it('should display product type in chip when available', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      const chip = screen.getByTestId('chip')
      expect(chip).toHaveTextContent('Software')
      expect(chip).toHaveAttribute('data-color', 'primary')
      expect(chip).toHaveAttribute('data-variant', 'flat')
      expect(chip).toHaveAttribute('data-radius', 'md')
      expect(chip).toHaveAttribute('data-size', 'lg')
    })

    it('should display fallback type when product type is not available', () => {
      const productWithoutType = { ...mockProduct, type: undefined }
      renderWithRouter(<ProductCard product={productWithoutType} />)
      
      const chip = screen.getByTestId('chip')
      expect(chip).toHaveTextContent('Unknown Type')
    })

    it('should display hardware type correctly', () => {
      const hardwareProduct = { ...mockProduct, type: 'Hardware' as const }
      renderWithRouter(<ProductCard product={hardwareProduct} />)
      
      const chip = screen.getByTestId('chip')
      expect(chip).toHaveTextContent('Hardware')
    })
  })

  describe('Action Buttons', () => {
    it('should render fork icon button with correct tooltip', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      const iconButton = screen.getByTestId('icon-button')
      expect(iconButton).toBeInTheDocument()
      expect(iconButton).toHaveAttribute('title', 'Edit Versions')
    })

    it('should call navigate when fork button is clicked', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      const iconButton = screen.getByTestId('icon-button')
      fireEvent.click(iconButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('product/test-product-123')
    })

    it('should render edit button when onEdit prop is provided', () => {
      const mockOnEdit = vi.fn()
      renderWithRouter(<ProductCard product={mockProduct} onEdit={mockOnEdit} />)
      
      expect(screen.getByTestId('edit-button')).toBeInTheDocument()
    })

    it('should call onEdit when edit button is clicked', () => {
      const mockOnEdit = vi.fn()
      renderWithRouter(<ProductCard product={mockProduct} onEdit={mockOnEdit} />)
      
      const editButton = screen.getByTestId('edit-button')
      fireEvent.click(editButton)
      
      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    it('should call deletePTB when clicked', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      const deleteButton = screen.getByTestId('delete-button')
      expect(deleteButton).toBeInTheDocument()
      
      fireEvent.click(deleteButton)
      expect(mockDeletePTB).toHaveBeenCalledWith('test-product-123')
    })
  })

  describe('SubBranches Handling', () => {
    it('should not render TagList when product has no subBranches', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      expect(screen.queryByTestId('tag-list')).not.toBeInTheDocument()
    })

    it('should render TagList when product has subBranches', () => {
      renderWithRouter(<ProductCard product={mockProductWithSubBranches} />)
      
      expect(screen.getByTestId('tag-list')).toBeInTheDocument()
    })

    it('should render correct number of tag items for subBranches', () => {
      renderWithRouter(<ProductCard product={mockProductWithSubBranches} />)
      
      expect(screen.getByTestId('tag-item-0')).toBeInTheDocument()
      expect(screen.getByTestId('tag-item-1')).toBeInTheDocument()
    })

    it('should generate correct links for subBranches', () => {
      renderWithRouter(<ProductCard product={mockProductWithSubBranches} />)
      
      const link0 = screen.getByTestId('tag-link-0')
      const link1 = screen.getByTestId('tag-link-1')
      
      expect(link0).toHaveTextContent('/product-management/version/sub-1')
      expect(link1).toHaveTextContent('/product-management/version/sub-2')
    })

    it('should generate correct labels for subBranches using findProductTreeBranch', () => {
      renderWithRouter(<ProductCard product={mockProductWithSubBranches} />)
      
      expect(screen.getByTestId('tag-item-0')).toHaveTextContent('Found Product sub-1')
      expect(screen.getByTestId('tag-item-1')).toHaveTextContent('Found Product sub-2')
    })

    it('should handle empty subBranches array', () => {
      const productWithEmptySubBranches = { ...mockProduct, subBranches: [] }
      renderWithRouter(<ProductCard product={productWithEmptySubBranches} />)
      
      expect(screen.queryByTestId('tag-list')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle product with undefined description', () => {
      const productWithoutDescription = { ...mockProduct, description: undefined as any }
      renderWithRouter(<ProductCard product={productWithoutDescription} />)
      
      const infoCard = screen.getByTestId('info-card')
      expect(infoCard).not.toHaveAttribute('data-description')
    })

    it('should handle product with undefined category', () => {
      const productWithoutCategory = { ...mockProduct, category: undefined as any }
      renderWithRouter(<ProductCard product={productWithoutCategory} />)
      
      // Should still render without errors
      expect(screen.getByTestId('info-card')).toBeInTheDocument()
    })

    it('should handle product with very long name', () => {
      const longName = 'A'.repeat(200)
      const productWithLongName = { ...mockProduct, name: longName }
      renderWithRouter(<ProductCard product={productWithLongName} />)
      
      expect(screen.getByTestId('title')).toHaveTextContent(longName)
    })

    it('should handle product with special characters in name', () => {
      const specialName = 'Test & <Product> "Name" \'With\' Special @#$% Characters'
      const productWithSpecialName = { ...mockProduct, name: specialName }
      renderWithRouter(<ProductCard product={productWithSpecialName} />)
      
      expect(screen.getByTestId('title')).toHaveTextContent(specialName)
    })
  })

  describe('Integration with Dependencies', () => {
    it('should use translation function for unknown type', () => {
      const productWithoutType = { ...mockProduct, type: undefined }
      renderWithRouter(<ProductCard product={productWithoutType} />)
      
      expect(screen.getByTestId('chip')).toHaveTextContent('Unknown Type')
    })

    it('should use translation function for tooltip text', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      const iconButton = screen.getByTestId('icon-button')
      expect(iconButton).toHaveAttribute('title', 'Edit Versions')
    })

    it('should call findProductTreeBranch for each subBranch', () => {
      renderWithRouter(<ProductCard product={mockProductWithSubBranches} />)
      
      expect(mockFindProductTreeBranch).toHaveBeenCalledWith('sub-1')
      expect(mockFindProductTreeBranch).toHaveBeenCalledWith('sub-2')
    })

    it('should handle fallback when findProductTreeBranch returns product without name', () => {
      // Mock findProductTreeBranch to return a product without name for one call
      mockFindProductTreeBranch.mockImplementation((id: string) => {
        if (id === 'sub-1') {
          return {
            id,
            name: '', // Empty name should trigger fallback
            category: 'product_version' as const,
            description: 'Found description',
            subBranches: [],
          }
        }
        return {
          id,
          name: `Found Product ${id}`,
          category: 'product_version' as const,
          description: 'Found description',
          subBranches: [],
        }
      })
      
      renderWithRouter(<ProductCard product={mockProductWithSubBranches} />)
      
      // First tag should show fallback text
      expect(screen.getByTestId('tag-item-0')).toHaveTextContent('Untitled Version')
      // Second tag should show normal name
      expect(screen.getByTestId('tag-item-1')).toHaveTextContent('Found Product sub-2')
    })
  })

  describe('Component Composition', () => {
    it('should render InfoCard with correct variant', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      const infoCard = screen.getByTestId('info-card')
      expect(infoCard).toHaveAttribute('data-variant', 'boxed')
    })

    it('should pass correct linkTo prop to InfoCard', () => {
      renderWithRouter(<ProductCard product={mockProduct} />)
      
      const infoCard = screen.getByTestId('info-card')
      expect(infoCard).toHaveAttribute('data-link-to', 'product/test-product-123')
    })

    it('should render with different product ID', () => {
      const differentProduct = { ...mockProduct, id: 'different-id' }
      renderWithRouter(<ProductCard product={differentProduct} />)
      
      const infoCard = screen.getByTestId('info-card')
      expect(infoCard).toHaveAttribute('data-link-to', 'product/different-id')
    })
  })
})
