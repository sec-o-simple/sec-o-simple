import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Products from '../../../src/routes/vulnerabilities/Products'
import { TVulnerability, getDefaultVulnerability } from '../../../src/routes/vulnerabilities/types/tVulnerability'
import { TVulnerabilityProduct } from '../../../src/routes/vulnerabilities/types/tVulnerabilityProduct'

// Mock functions that will be reassigned in tests
let mockUseListState: any
let mockUseFieldValidation: any
let mockUseVulnerabilityProductGenerator: any

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock useListState hook
vi.mock('../../../src/utils/useListState', () => ({
  useListState: (...args: any[]) => mockUseListState(...args),
}))

// Mock useFieldValidation hook
vi.mock('../../../src/utils/validation/useFieldValidation', () => ({
  useFieldValidation: (...args: any[]) => mockUseFieldValidation(...args),
}))

// Mock useVulnerabilityProductGenerator hook
vi.mock('../../../src/routes/vulnerabilities/types/tVulnerabilityProduct', () => ({
  useVulnerabilityProductGenerator: () => ({
    generateVulnerabilityProduct: mockUseVulnerabilityProductGenerator,
  }),
  productStatus: [
    'first_affected',
    'known_affected',
    'known_not_affected',
    'last_affected',
    'first_fixed',
    'fixed',
    'recommended',
    'under_investigation',
  ],
}))

// Mock form components
vi.mock('../../../src/components/forms/AddItemButton', () => ({
  default: ({ onPress, className, ...props }: any) => (
    <button 
      data-testid="add-item-button"
      onClick={onPress}
      className={className}
      {...props}
    >
      Add Item
    </button>
  )
}))

vi.mock('../../../src/components/forms/VSplit', () => ({
  default: ({ children, className, ...props }: any) => (
    <div data-testid="vsplit-container" className={className} {...props}>
      {children}
    </div>
  )
}))

// Mock HeroUI Alert component
vi.mock('@heroui/react', () => ({
  Alert: ({ children, color, ...props }: any) => (
    <div data-testid="alert" data-color={color} {...props}>
      {children}
    </div>
  )
}))

// Mock VulnerabilityProduct component
vi.mock('../../../src/routes/vulnerabilities/components/VulnerabilityProduct', () => ({
  default: ({ vulnerabilityProduct, onChange, onDelete, ...props }: any) => (
    <div 
      data-testid="vulnerability-product"
      data-product-id={vulnerabilityProduct.id}
      {...props}
    >
      <span data-testid="product-id">{vulnerabilityProduct.id}</span>
      <span data-testid="product-status">{vulnerabilityProduct.status}</span>
      <button 
        data-testid="change-product-button"
        onClick={() => onChange?.({ ...vulnerabilityProduct, status: 'updated' })}
      >
        Change Product
      </button>
      <button 
        data-testid="delete-product-button"
        onClick={() => onDelete?.(vulnerabilityProduct)}
      >
        Delete Product
      </button>
    </div>
  )
}))

describe('Products', () => {
  const mockOnChange = vi.fn()
  const mockGenerateVulnerabilityProduct = vi.fn()
  
  const defaultVulnerability: TVulnerability = {
    ...getDefaultVulnerability(),
    products: [],
  }

  const mockProduct1: TVulnerabilityProduct = {
    id: 'product-1',
    productId: 'prod-1',
    status: 'known_affected',
  }

  const mockProduct2: TVulnerabilityProduct = {
    id: 'product-2',  
    productId: 'prod-2',
    status: 'fixed',
  }

  const defaultListState = {
    data: [],
    setData: vi.fn(),
    updateDataEntry: vi.fn(),
    removeDataEntry: vi.fn(),
  }

  const defaultValidation = {
    messages: [],
    hasErrors: false,
    hasWarnings: false,
    hasInfos: false,
    errorMessages: [],
    warningMessages: [],
    infoMessages: [],
    isTouched: false,
    markFieldAsTouched: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseListState = vi.fn(() => defaultListState)
    mockUseFieldValidation = vi.fn(() => defaultValidation)
    mockUseVulnerabilityProductGenerator = vi.fn(() => ({
      id: 'new-product-id',
      productId: '',
      status: '',
    }))
    
    mockGenerateVulnerabilityProduct.mockReturnValue({
      id: 'new-product-id',
      productId: '',
      status: '',
    })
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('vsplit-container')).toBeInTheDocument()
      expect(screen.getByTestId('add-item-button')).toBeInTheDocument()
    })

    it('should initialize with correct props', () => {
      const vulnerability: TVulnerability = {
        ...defaultVulnerability,
        products: [mockProduct1, mockProduct2],
      }

      render(
        <Products
          vulnerability={vulnerability}
          vulnerabilityIndex={5}
          onChange={mockOnChange}
        />
      )

      expect(mockUseListState).toHaveBeenCalledWith({
        initialData: vulnerability.products,
        generator: {
          id: 'new-product-id',
          productId: '',
          status: '',
        },
      })

      expect(mockUseFieldValidation).toHaveBeenCalledWith(
        '/vulnerabilities/5/product_status'
      )
    })

    it('should render existing vulnerability products', () => {
      const listStateWithData = {
        ...defaultListState,
        data: [mockProduct1, mockProduct2],
      }
      mockUseListState.mockReturnValue(listStateWithData)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const products = screen.getAllByTestId('vulnerability-product')
      expect(products).toHaveLength(2)
      
      expect(screen.getByText('product-1')).toBeInTheDocument()
      expect(screen.getByText('product-2')).toBeInTheDocument()
    })

    it('should render empty state when no products exist', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.queryByTestId('vulnerability-product')).not.toBeInTheDocument()
      expect(screen.getByTestId('add-item-button')).toBeInTheDocument()
    })
  })

  describe('Validation Error Display', () => {
    it('should not display alert when there are no validation errors', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
    })

    it('should display alert when validation has errors', () => {
      const validationWithErrors = {
        ...defaultValidation,
        hasErrors: true,
        errorMessages: [
          { path: '/vulnerabilities/0/products', message: 'At least one product is required' },
          { path: '/vulnerabilities/0/products/0', message: 'Product status is required' },
        ],
      }
      mockUseFieldValidation.mockReturnValue(validationWithErrors)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('data-color', 'danger')
      
      expect(screen.getByText('At least one product is required')).toBeInTheDocument()
      expect(screen.getByText('Product status is required')).toBeInTheDocument()
    })

    it('should render multiple error messages correctly', () => {
      const validationWithMultipleErrors = {
        ...defaultValidation,
        hasErrors: true,
        errorMessages: [
          { path: '/vulnerabilities/0/products/0/status', message: 'Status is required' },
          { path: '/vulnerabilities/0/products/1/productId', message: 'Product ID is required' },
          { path: '/vulnerabilities/0/products/2/status', message: 'Invalid status value' },
        ],
      }
      mockUseFieldValidation.mockReturnValue(validationWithMultipleErrors)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByText('Status is required')).toBeInTheDocument()
      expect(screen.getByText('Product ID is required')).toBeInTheDocument()
      expect(screen.getByText('Invalid status value')).toBeInTheDocument()
    })
  })

  describe('Product Management', () => {
    it('should handle product updates through onChange', () => {
      const updateDataEntry = vi.fn()
      const listStateWithData = {
        ...defaultListState,
        data: [mockProduct1],
        updateDataEntry,
      }
      mockUseListState.mockReturnValue(listStateWithData)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const changeButton = screen.getByTestId('change-product-button')
      fireEvent.click(changeButton)

      expect(updateDataEntry).toHaveBeenCalledWith({
        ...mockProduct1,
        status: 'updated',
      })
    })

    it('should handle product deletion through onDelete', () => {
      const removeDataEntry = vi.fn()
      const listStateWithData = {
        ...defaultListState,
        data: [mockProduct1],
        removeDataEntry,
      }
      mockUseListState.mockReturnValue(listStateWithData)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const deleteButton = screen.getByTestId('delete-product-button')
      fireEvent.click(deleteButton)

      expect(removeDataEntry).toHaveBeenCalledWith(mockProduct1)
    })

    it('should add new product when add button is clicked', async () => {
      const user = userEvent.setup()
      const setData = vi.fn()
      const listStateWithData = {
        ...defaultListState,
        data: [mockProduct1],
        setData,
      }
      mockUseListState.mockReturnValue(listStateWithData)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const addButton = screen.getByTestId('add-item-button')
      await user.click(addButton)

      expect(setData).toHaveBeenCalledWith(expect.any(Function))
      
      // Verify the function passed to setData works correctly
      const setDataCallback = setData.mock.calls[0][0]
      const newData = setDataCallback([mockProduct1])
      
      expect(newData).toEqual([
        mockProduct1,
        {
          id: 'new-product-id',
          productId: 'prod-1', // Should copy productId from last item
          status: '',
        },
      ])
    })

    it('should add new product with empty productId when no existing products', async () => {
      const user = userEvent.setup()
      const setData = vi.fn()
      const listStateEmpty = {
        ...defaultListState,
        data: [],
        setData,
      }
      mockUseListState.mockReturnValue(listStateEmpty)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const addButton = screen.getByTestId('add-item-button')
      await user.click(addButton)

      expect(setData).toHaveBeenCalledWith(expect.any(Function))
      
      // Verify the function passed to setData works correctly
      const setDataCallback = setData.mock.calls[0][0]
      const newData = setDataCallback([])
      
      expect(newData).toEqual([
        {
          id: 'new-product-id',
          productId: undefined, // Should be undefined when no existing products
          status: '',
        },
      ])
    })

    it('should copy productId from last product when adding new product', async () => {
      const user = userEvent.setup()
      const setData = vi.fn()
      const listStateWithMultipleProducts = {
        ...defaultListState,
        data: [mockProduct1, mockProduct2],
        setData,
      }
      mockUseListState.mockReturnValue(listStateWithMultipleProducts)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const addButton = screen.getByTestId('add-item-button')
      await user.click(addButton)

      const setDataCallback = setData.mock.calls[0][0]
      const newData = setDataCallback([mockProduct1, mockProduct2])
      
      expect(newData[2]).toEqual({
        id: 'new-product-id',
        productId: 'prod-2', // Should copy from mockProduct2 (last item)
        status: '',
      })
    })
  })

  describe('State Synchronization', () => {
    it('should call onChange when productsListState.data changes', () => {
      const listStateWithData = {
        ...defaultListState,
        data: [mockProduct1, mockProduct2],
      }
      mockUseListState.mockReturnValue(listStateWithData)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      // useEffect should have been triggered with the updated data
      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultVulnerability,
        products: [mockProduct1, mockProduct2],
      })
    })

    it('should update vulnerability with empty products array', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultVulnerability,
        products: [],
      })
    })

    it('should preserve other vulnerability properties when updating products', () => {
      const complexVulnerability: TVulnerability = {
        ...defaultVulnerability,
        id: 'vuln-123',
        title: 'Test Vulnerability',
        cve: 'CVE-2023-1234',
        products: [],
      }

      const listStateWithData = {
        ...defaultListState,
        data: [mockProduct1],
      }
      mockUseListState.mockReturnValue(listStateWithData)

      render(
        <Products
          vulnerability={complexVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(mockOnChange).toHaveBeenCalledWith({
        ...complexVulnerability,
        products: [mockProduct1],
      })
    })
  })

  describe('Hook Integration', () => {
    it('should call useVulnerabilityProductGenerator correctly', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(mockUseVulnerabilityProductGenerator).toHaveBeenCalled()
    })

    it('should use generated product in useListState', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const listStateCall = mockUseListState.mock.calls[0][0]
      expect(listStateCall.initialData).toBe(defaultVulnerability.products)
      expect(listStateCall.generator).toBeDefined()
      
      // The generator should be the product object itself (not a function)
      expect(listStateCall.generator).toEqual({
        id: 'new-product-id',
        productId: '',
        status: '',
      })
    })

    it('should pass correct vulnerability index to validation hook', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={42}
          onChange={mockOnChange}
        />
      )

      expect(mockUseFieldValidation).toHaveBeenCalledWith(
        '/vulnerabilities/42/product_status'
      )
    })
  })

  describe('Component Props and Styling', () => {
    it('should apply correct className to add button', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const addButton = screen.getByTestId('add-item-button')
      expect(addButton).toHaveClass('w-full')
    })

    it('should apply correct className to VSplit container', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const container = screen.getByTestId('vsplit-container')
      expect(container).toHaveClass('gap-2')
    })

    it('should pass correct props to VulnerabilityProduct components', () => {
      const listStateWithData = {
        ...defaultListState,
        data: [mockProduct1, mockProduct2],
        updateDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
      }
      mockUseListState.mockReturnValue(listStateWithData)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const products = screen.getAllByTestId('vulnerability-product')
      expect(products[0]).toHaveAttribute('data-product-id', 'product-1')
      expect(products[1]).toHaveAttribute('data-product-id', 'product-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined onChange by throwing error (expected behavior)', () => {
      // This test verifies that the component does throw when onChange is undefined
      // since onChange is a required prop and the useEffect will try to call it
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(
          <Products
            vulnerability={defaultVulnerability}
            vulnerabilityIndex={0}
            onChange={undefined as any}
          />
        )
      }).toThrow('onChange is not a function')
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle very large vulnerability index', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={999999}
          onChange={mockOnChange}
        />
      )

      expect(mockUseFieldValidation).toHaveBeenCalledWith(
        '/vulnerabilities/999999/product_status'
      )
    })

    it('should handle negative vulnerability index', () => {
      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={-1}
          onChange={mockOnChange}
        />
      )

      expect(mockUseFieldValidation).toHaveBeenCalledWith(
        '/vulnerabilities/-1/product_status'
      )
    })

    it('should handle malformed vulnerability object', () => {
      const malformedVulnerability = {
        ...defaultVulnerability,
        products: null as any,
      }

      expect(() => {
        render(
          <Products
            vulnerability={malformedVulnerability}
            vulnerabilityIndex={0}
            onChange={mockOnChange}
          />
        )
      }).not.toThrow()

      expect(mockUseListState).toHaveBeenCalledWith({
        initialData: null,
        generator: {
          id: 'new-product-id',
          productId: '',
          status: '',
        },
      })
    })
  })

  describe('Re-rendering and Performance', () => {
    it('should re-render when vulnerability changes', () => {
      const { rerender } = render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const updatedVulnerability = {
        ...defaultVulnerability,
        products: [mockProduct1],
      }

      rerender(
        <Products
          vulnerability={updatedVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(mockUseListState).toHaveBeenCalledTimes(2)
      expect(mockUseListState).toHaveBeenLastCalledWith({
        initialData: [mockProduct1],
        generator: {
          id: 'new-product-id',
          productId: '',
          status: '',
        },
      })
    })

    it('should re-render when vulnerabilityIndex changes', () => {
      const { rerender } = render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      rerender(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={1}
          onChange={mockOnChange}
        />
      )

      expect(mockUseFieldValidation).toHaveBeenCalledTimes(2)
      expect(mockUseFieldValidation).toHaveBeenLastCalledWith(
        '/vulnerabilities/1/product_status'
      )
    })

    it('should handle rapid state changes', async () => {
      const user = userEvent.setup()
      const setData = vi.fn()
      const listStateWithData = {
        ...defaultListState,
        data: [],
        setData,
      }
      mockUseListState.mockReturnValue(listStateWithData)

      render(
        <Products
          vulnerability={defaultVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const addButton = screen.getByTestId('add-item-button')
      
      // Simulate rapid clicks
      await user.click(addButton)
      await user.click(addButton)
      await user.click(addButton)

      expect(setData).toHaveBeenCalledTimes(3)
    })
  })
})
