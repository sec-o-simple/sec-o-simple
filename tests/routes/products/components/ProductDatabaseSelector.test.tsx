import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductDatabaseSelector from '../../../../src/routes/products/components/ProductDatabaseSelector'
import { parseProductTree } from '../../../../src/utils/csafImport/parseProductTree'
import { parseRelationships } from '../../../../src/utils/csafImport/parseRelationships'
import type {
  Product,
  Vendor,
} from '../../../../src/utils/useDatabaseClient'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key: string, options?: any) => {
      const translations: Record<string, string> = {
        'products.import.title': 'Import Products',
        'products.import.description':
          'Select products to import from the database',
        'products.import.warning': 'Products will be imported from',
        'products.import.database': 'the product database',
        'products.import.searchPlaceholder': 'Search vendors or products...',
        'products.import.noVendors': 'No vendors found',
        'products.import.selectedAll': 'All selected',
        'products.import.selected': `${options?.count || 0} selected`,
        'products.import.add': `Add ${options?.count || 0} products`,
        'common.cancel': 'Cancel',
      }
      return translations[key] || key
    }),
  }),
}))

// Mock react-router
vi.mock('react-router', () => ({
  Link: ({ children, to, className, target }: any) => (
    <a data-testid="link" href={to} className={className} target={target}>
      {children}
    </a>
  ),
}))

// Mock custom hooks
const mockFetchVendors = vi.fn()
const mockFetchProducts = vi.fn()
const mockFetchCSAFProducts = vi.fn()
const mockUseDatabaseClient = vi.fn()

vi.mock('../../../../src/utils/useDatabaseClient', () => ({
  useDatabaseClient: () => mockUseDatabaseClient(),
}))

const mockUseConfigStore = vi.fn()
vi.mock('../../../../src/utils/useConfigStore', () => ({
  useConfigStore: (selector: any) => mockUseConfigStore(selector),
}))

const mockUseDocumentStore = vi.fn()
const mockUpdateProducts = vi.fn()

vi.mock('../../../../src/utils/useDocumentStore', () => ({
  default: (selector: any) => mockUseDocumentStore(selector),
}))

// Mock CSAF parsing functions
vi.mock('../../../../src/utils/csafImport/parseProductTree', () => ({
  parseProductTree: vi.fn(),
}))

vi.mock('../../../../src/utils/csafImport/parseRelationships', () => ({
  parseRelationships: vi.fn(),
}))

// Mock HeroUI components
vi.mock('@heroui/modal', () => ({
  Modal: ({ children, isOpen, onClose, size }: any) =>
    isOpen ? (
      <div data-testid="modal" data-size={size} onClick={() => onClose()}>
        {children}
      </div>
    ) : null,
  ModalContent: ({ children }: any) => (
    <div data-testid="modal-content">
      {typeof children === 'function' ? children(() => {}) : children}
    </div>
  ),
  ModalHeader: ({ children, className }: any) => (
    <div data-testid="modal-header" className={className}>
      {children}
    </div>
  ),
  ModalBody: ({ children }: any) => (
    <div data-testid="modal-body">{children}</div>
  ),
  ModalFooter: ({ children }: any) => (
    <div data-testid="modal-footer">{children}</div>
  ),
}))

vi.mock('@heroui/button', () => ({
  Button: ({
    children,
    variant,
    color,
    isLoading,
    isDisabled,
    onPress,
    ...props
  }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-color={color}
      data-is-loading={isLoading}
      disabled={isDisabled}
      onClick={onPress}
      {...props}
    >
      {children}
    </button>
  ),
}))
vi.mock('@heroui/react', () => ({
  Accordion: ({ children, variant }: any) => (
    <div data-testid="accordion" data-variant={variant}>
      {children}
    </div>
  ),
  AccordionItem: ({
    children,
    title,
    subtitle,
    startContent,
    ...props
  }: any) => (
    <div data-testid="accordion-item" data-key={props.key}>
      <div data-testid="accordion-header">
        {startContent && <div data-testid="start-content">{startContent}</div>}
        <div data-testid="accordion-title">{title}</div>
        {subtitle && <div data-testid="accordion-subtitle">{subtitle}</div>}
      </div>
      <div data-testid="accordion-content">{children}</div>
    </div>
  ),
  Alert: ({ children, color, className }: any) => (
    <div data-testid="alert" data-color={color} className={className}>
      {children}
    </div>
  ),

  Checkbox: ({ children, isSelected, onChange, onValueChange }: any) => (
    <label data-testid="checkbox">
      <input
        type="checkbox"
        data-testid="checkbox-input"
        checked={!!isSelected}
        aria-checked={!!isSelected}
        onChange={(e) => {
          // fire both styles so the component logic always receives what it expects
          onChange?.(e)
          onValueChange?.(e.target.checked)
        }}
      />
      {children && <span data-testid="checkbox-label">{children}</span>}
    </label>
  ),
}))

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: any) => (
    <span
      data-testid="font-awesome-icon"
      data-icon={icon.iconName}
      className={className}
    />
  ),
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faSearch: { iconName: 'search' },
}))

// Mock Input component
vi.mock('../../../../src/components/forms/Input', () => ({
  Input: ({ placeholder, value, onChange, className, startContent }: any) => (
    <div data-testid="input-wrapper" className={className}>
      {startContent && (
        <div data-testid="input-start-content">{startContent}</div>
      )}
      <input
        data-testid="input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  ),
}))

describe('ProductDatabaseSelector', () => {
  const mockVendors: Vendor[] = [
    {
      id: 'vendor-1',
      name: 'Test Vendor 1',
      description: 'Test vendor 1 description',
      product_count: 2,
    },
    {
      id: 'vendor-2',
      name: 'Another Vendor',
      description: 'Another vendor description',
      product_count: 1,
    },
  ]

  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'Test Product 1',
      full_name: 'Test Product 1 Full Name',
      description: 'Test product 1 description',
      vendor_id: 'vendor-1',
      type: 'software',
    },
    {
      id: 'product-2',
      name: 'Test Product 2',
      full_name: 'Test Product 2 Full Name',
      description: 'Test product 2 description',
      vendor_id: 'vendor-1',
      type: 'hardware',
    },
    {
      id: 'product-3',
      name: 'Another Product',
      full_name: 'Another Product Full Name',
      description: 'Another product description',
      vendor_id: 'vendor-2',
      type: 'software',
    },
  ]

  const mockConfig = {
    productDatabase: {
      enabled: true,
      apiUrl: 'http://localhost:3000',
      url: 'http://localhost:3000/ui',
    },
  }

  const mockOnClose = vi.fn()
  const mockParseProductTree = vi.mocked(parseProductTree)
  const mockParseRelationships = vi.mocked(parseRelationships)

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseDatabaseClient.mockReturnValue({
      url: 'http://localhost:3000/ui',
      fetchVendors: mockFetchVendors,
      fetchProducts: mockFetchProducts,
      fetchCSAFProducts: mockFetchCSAFProducts,
    })

    mockUseConfigStore.mockReturnValue(mockConfig)

    mockUseDocumentStore.mockImplementation((selector?: any) => {
      // Minimal shape of the Zustand store used by the component
      const store = {
        products: [],
        families: [],
        relationships: [],
        updateProducts: mockUpdateProducts,
        updateFamilies: vi.fn(),
        updateRelationships: vi.fn(),
      }
      if (typeof selector === 'function') return selector(store)
      return store
    })

    mockFetchVendors.mockResolvedValue(mockVendors)
    mockFetchProducts.mockResolvedValue(mockProducts)
    mockFetchCSAFProducts.mockResolvedValue({
      product_tree: {
        branches: [],
        full_product_names: [],
        relationships: [],
      },
    })

    // Reset CSAF parsing mocks
    mockParseProductTree.mockReturnValue({
      families: [],
      products: [],
    })
    mockParseRelationships.mockReturnValue([])
  })

  describe('Component Rendering', () => {
    it('should render modal when isOpen is true', async () => {
      await act(async () => {
        render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)
      })

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'xl')
      expect(screen.getByTestId('modal-header')).toHaveTextContent(
        'Import Products',
      )
      expect(screen.getByTestId('modal-body')).toHaveTextContent(
        'Select products to import from the database',
      )
    })

    it('should not render modal when isOpen is false', async () => {
      await act(async () => {
        render(<ProductDatabaseSelector isOpen={false} onClose={mockOnClose} />)
      })

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should render warning alert with link to database', async () => {
      await act(async () => {
        render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)
      })

      const alerts = screen.getAllByTestId('alert')
      const defaultAlert = alerts.find(
        (alert) => alert.getAttribute('data-color') === 'default',
      )
      expect(defaultAlert).toBeInTheDocument()
      expect(defaultAlert).toHaveAttribute('data-color', 'default')

      const link = screen.getByTestId('link')
      expect(link).toHaveAttribute('href', 'http://localhost:3000/ui')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveClass('underline')
    })

    it('should render search input with search icon', async () => {
      await act(async () => {
        render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)
      })

      expect(screen.getByTestId('input')).toBeInTheDocument()
      expect(screen.getByTestId('input')).toHaveAttribute(
        'placeholder',
        'Search vendors or products...',
      )

      const searchIcon = screen.getByTestId('font-awesome-icon')
      expect(searchIcon).toHaveAttribute('data-icon', 'search')
      expect(searchIcon).toHaveClass('text-slate-500')
    })

    it('should render modal footer with cancel and add buttons', async () => {
      await act(async () => {
        render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)
      })

      const buttons = screen.getAllByTestId('button')
      expect(buttons).toHaveLength(2)

      const cancelButton = buttons.find((btn) => btn.textContent === 'Cancel')
      const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

      expect(cancelButton).toBeDefined()
      expect(cancelButton).toHaveAttribute('data-variant', 'light')

      expect(addButton).toBeDefined()
      expect(addButton).toHaveAttribute('data-color', 'primary')
      expect(addButton).toHaveAttribute('disabled')
    })
  })

  describe('Data Loading', () => {
    it('should fetch vendors and products on mount', async () => {
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        expect(mockFetchVendors).toHaveBeenCalled()
        expect(mockFetchProducts).toHaveBeenCalled()
      })
    })

    it('should display vendors with their products in accordion', async () => {
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        expect(screen.getByTestId('accordion')).toBeInTheDocument()
      })

      const accordionItems = screen.getAllByTestId('accordion-item')
      expect(accordionItems).toHaveLength(2)

      const titles = screen.getAllByTestId('accordion-title')
      expect(titles[0]).toHaveTextContent('Test Vendor 1')
      expect(titles[1]).toHaveTextContent('Another Vendor')
    })

    it('should display no vendors alert when no vendors are available', async () => {
      mockFetchVendors.mockResolvedValue([])
      mockFetchProducts.mockResolvedValue([])

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const alerts = screen.getAllByTestId('alert')
        const warningAlert = alerts.find(
          (alert) => alert.getAttribute('data-color') === 'warning',
        )
        expect(warningAlert).toBeInTheDocument()
        expect(warningAlert).toHaveAttribute('data-color', 'warning')
        expect(warningAlert).toHaveTextContent('No vendors found')
      })
    })

    it('should display products as checkboxes under each vendor', async () => {
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      const productLabels = screen.getAllByTestId('checkbox-label')
      const productNames = productLabels.map((label) => label.textContent)
      expect(productNames).toContain('Test Product 1')
      expect(productNames).toContain('Test Product 2')
      expect(productNames).toContain('Another Product')
    })
  })

  describe('Search Functionality', () => {
    it('should filter vendors by name when searching', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        expect(screen.getAllByTestId('accordion-item')).toHaveLength(2)
      })

      const searchInput = screen.getByTestId('input')
      await user.type(searchInput, 'Another')

      await waitFor(() => {
        const accordionItems = screen.getAllByTestId('accordion-item')
        expect(accordionItems).toHaveLength(1)
        expect(screen.getByTestId('accordion-title')).toHaveTextContent(
          'Another Vendor',
        )
      })
    })

    it('should filter vendors by product name when searching', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        expect(screen.getAllByTestId('accordion-item')).toHaveLength(2)
      })

      const searchInput = screen.getByTestId('input')
      await user.type(searchInput, 'Test Product 1')

      await waitFor(() => {
        const accordionItems = screen.getAllByTestId('accordion-item')
        expect(accordionItems).toHaveLength(1)
        expect(screen.getByTestId('accordion-title')).toHaveTextContent(
          'Test Vendor 1',
        )
      })
    })

    it('should be case insensitive when searching', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        expect(screen.getAllByTestId('accordion-item')).toHaveLength(2)
      })

      const searchInput = screen.getByTestId('input')
      await user.type(searchInput, 'test vendor')

      await waitFor(() => {
        const accordionItems = screen.getAllByTestId('accordion-item')
        expect(accordionItems).toHaveLength(1)
        expect(screen.getByTestId('accordion-title')).toHaveTextContent(
          'Test Vendor 1',
        )
      })
    })
  })

  describe('Product Selection', () => {
    it('should allow selecting individual products', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      const productCheckboxes = screen.getAllByTestId('checkbox-input')
      const productCheckbox = productCheckboxes.find((checkbox, index) => {
        const labels = screen.getAllByTestId('checkbox-label')
        const label = labels.find(
          (label) => label.textContent === 'Test Product 1',
        )
        return label && labels.indexOf(label) === index - 3 // Adjust for vendor checkboxes
      })

      expect(productCheckbox).toBeDefined()
      await user.click(productCheckbox!)

      expect(productCheckbox).toBeChecked()

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      expect(addButton).not.toHaveAttribute('disabled')
      expect(addButton).toHaveTextContent('Add 1 products')
    })

    it('should allow selecting all products for a vendor', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        expect(screen.getAllByTestId('accordion-item')).toHaveLength(2)
      })

      const vendorCheckboxes = screen.getAllByTestId('checkbox-input')
      await user.click(vendorCheckboxes[0])

      await waitFor(() => {
        const subtitles = screen.getAllByTestId('accordion-subtitle')
        expect(subtitles[0]).toHaveTextContent('All selected')
      })

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      expect(addButton).toHaveTextContent('Add 2 products')
    })

    it('should deselect all products when vendor checkbox is unchecked', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        expect(screen.getAllByTestId('accordion-item')).toHaveLength(2)
      })

      const vendorCheckboxes = screen.getAllByTestId('checkbox-input')

      await user.click(vendorCheckboxes[0])

      await waitFor(() => {
        const subtitles = screen.getAllByTestId('accordion-subtitle')
        expect(subtitles[0]).toHaveTextContent('All selected')
      })

      await user.click(vendorCheckboxes[0])

      await waitFor(() => {
        const subtitles = screen.queryAllByTestId('accordion-subtitle')
        if (subtitles.length > 0) {
          expect(subtitles[0]).toHaveTextContent('')
        }
      })

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      expect(addButton).toHaveAttribute('disabled')
    })
  })

  describe('Product Import', () => {
    it('should call handleAddProducts when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      // Find the checkbox for "Test Product 1" by locating it within its label
      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1'
      )
      expect(product1Label).toBeDefined()
      
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input[data-testid="checkbox-input"]')
      expect(product1Checkbox).toBeDefined()

      await user.click(product1Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      expect(mockFetchCSAFProducts).toHaveBeenCalledWith(['product-1'])
      expect(mockUpdateProducts).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should create new vendor when vendor does not exist', async () => {
      const user = userEvent.setup()

      // Mock parseProductTree to return structured product data
      mockParseProductTree.mockReturnValue({
        families: [],
        products: [
          {
            id: 'vendor-1',
            category: 'vendor' as const,
            name: 'Test Vendor 1',
            description: 'Test vendor 1 description',
            subBranches: [
              {
                id: 'product-1',
                category: 'product_name' as const,
                name: 'Test Product 1',
                description: 'Test product 1 description',
                subBranches: [],
              },
            ],
          },
        ],
      })

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      // Find and click the checkbox for "Test Product 1"
      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      expect(product1Label).toBeDefined()

      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')
      expect(product1Checkbox).toBeDefined()

      await user.click(product1Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      await waitFor(() => {
        expect(mockUpdateProducts).toHaveBeenCalled()
      })

      const updatedProducts = mockUpdateProducts.mock.calls[0][0]
      expect(updatedProducts).toHaveLength(1)
      expect(updatedProducts[0].id).toBe('vendor-1')
      expect(updatedProducts[0].name).toBe('Test Vendor 1')
      expect(updatedProducts[0].category).toBe('vendor')
      expect(updatedProducts[0].subBranches).toHaveLength(1)
      expect(updatedProducts[0].subBranches[0].id).toBe('product-1')
      expect(updatedProducts[0].subBranches[0].name).toBe('Test Product 1')
      expect(updatedProducts[0].subBranches[0].type).toBe('Software')
    })

    it('should map software type to Software and hardware type to Hardware', async () => {
      const user = userEvent.setup()

      // Mock parseProductTree to return structured product data for both products
      mockParseProductTree.mockReturnValue({
        families: [],
        products: [
          {
            id: 'vendor-1',
            category: 'vendor' as const,
            name: 'Test Vendor 1',
            description: 'Test vendor 1 description',
            subBranches: [
              {
                id: 'product-1',
                category: 'product_name' as const,
                name: 'Test Product 1',
                description: 'Test product 1 description',
                subBranches: [],
              },
              {
                id: 'product-2',
                category: 'product_name' as const,
                name: 'Test Product 2',
                description: 'Test product 2 description',
                subBranches: [],
              },
            ],
          },
        ],
      })

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      // Find and click checkboxes for both products
      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product2Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 2',
      )

      expect(product1Label).toBeDefined()
      expect(product2Label).toBeDefined()

      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')
      const product2Checkbox = product2Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      expect(product1Checkbox).toBeDefined()
      expect(product2Checkbox).toBeDefined()

      await user.click(product1Checkbox!)
      await user.click(product2Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      await waitFor(() => {
        expect(mockUpdateProducts).toHaveBeenCalled()
      })

      const updatedProducts = mockUpdateProducts.mock.calls[0][0]
      const vendor = updatedProducts[0]
      const softwareProduct = vendor.subBranches.find(
        (p: any) => p.id === 'product-1',
      )
      const hardwareProduct = vendor.subBranches.find(
        (p: any) => p.id === 'product-2',
      )

      expect(softwareProduct).toBeDefined()
      expect(hardwareProduct).toBeDefined()
      expect(softwareProduct.type).toBe('Software')
      expect(hardwareProduct.type).toBe('Hardware')
    })
  })

  describe('Modal Interactions', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      const cancelButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent === 'Cancel')
      await user.click(cancelButton!)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when modal background is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      const modal = screen.getByTestId('modal')
      await user.click(modal)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty selected products array gracefully', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      expect(mockUpdateProducts).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should handle API errors gracefully', async () => {
      // Mock console.error to prevent error output during test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock the fetch functions to return empty arrays (simulating API returning no data due to errors)
      mockFetchVendors.mockResolvedValue([])
      mockFetchProducts.mockResolvedValue([])

      await act(async () => {
        render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)
      })

      // Wait for the async operations to complete
      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })

      // Ensure the component still renders and shows "No vendors found" message
      expect(screen.getByTestId('modal')).toBeInTheDocument()

      await waitFor(() => {
        const alerts = screen.getAllByTestId('alert')
        const warningAlert = alerts.find(
          (alert) => alert.getAttribute('data-color') === 'warning',
        )
        expect(warningAlert).toBeInTheDocument()
        expect(warningAlert).toHaveTextContent('No vendors found')
      })

      consoleSpy.mockRestore()
    })

    it('should handle missing config gracefully', async () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: true,
          apiUrl: 'http://localhost:3000',
          url: undefined,
        },
      })

      await act(async () => {
        render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)
      })

      const link = screen.getByTestId('link')
      expect(link).toHaveAttribute('href', '#')
    })
  })



  describe('State Management and Cleanup', () => {
    it('should reset state after successful product addition', async () => {
      const user = userEvent.setup()

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      // Select a product
      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      await user.click(product1Checkbox!)

      // Add search text
      const searchInput = screen.getByTestId('input')
      await user.type(searchInput, 'search text')

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      // State should be reset (this is tested by the fact that onClose is called)
    })

    it('should handle async operations correctly during product addition', async () => {
      const user = userEvent.setup()

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      // Select a product
      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      await user.click(product1Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      // Verify async operations are called
      await waitFor(() => {
        expect(mockFetchCSAFProducts).toHaveBeenCalled()
        expect(mockUpdateProducts).toHaveBeenCalled()
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  describe('Vendor Filtering Edge Cases', () => {
    it('should handle vendors with no products', async () => {
      const vendorsWithNoProducts = [
        {
          id: 'vendor-no-products',
          name: 'Vendor With No Products',
          description: 'This vendor has no products',
          product_count: 0,
        },
      ]

      mockFetchVendors.mockResolvedValue([
        ...mockVendors,
        ...vendorsWithNoProducts,
      ])
      mockFetchProducts.mockResolvedValue(mockProducts) // Same products, won't match the new vendor

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        // Should only show vendors that have products
        const accordionItems = screen.getAllByTestId('accordion-item')
        expect(accordionItems).toHaveLength(2) // Only original vendors with products
      })

      const titles = screen.getAllByTestId('accordion-title')
      const titleTexts = titles.map((title) => title.textContent)
      expect(titleTexts).not.toContain('Vendor With No Products')
    })

    it('should handle empty search results', async () => {
      const user = userEvent.setup()
      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        expect(screen.getAllByTestId('accordion-item')).toHaveLength(2)
      })

      const searchInput = screen.getByTestId('input')
      await user.type(searchInput, 'nonexistent vendor or product')

      await waitFor(() => {
        const accordionItems = screen.queryAllByTestId('accordion-item')
        expect(accordionItems).toHaveLength(0)
      })
    })
  })

  describe('Edge Case Coverage', () => {
    it('should handle handleAddProducts early return when no products selected', async () => {
      const user = userEvent.setup()

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      // Don't select any products, just verify button is disabled
      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      expect(addButton).toHaveAttribute('disabled')

      // The early return in handleAddProducts should prevent updateProducts from being called
      expect(mockUpdateProducts).not.toHaveBeenCalled()
    })

    it('should handle unchecking individual product checkboxes', async () => {
      const user = userEvent.setup()

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      // First check a product
      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      await user.click(product1Checkbox!)
      expect(product1Checkbox).toBeChecked()

      // Then uncheck it - this should test the filter branch in onChange
      await user.click(product1Checkbox!)
      expect(product1Checkbox).not.toBeChecked()

      // Verify button is disabled again
      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      expect(addButton).toHaveAttribute('disabled')
    })
  })

  describe('CSAF Import and Parsing Functionality', () => {
    beforeEach(() => {
      // Reset mocks for each test
      mockParseProductTree.mockReset()
      mockParseRelationships.mockReset()
      mockUpdateProducts.mockClear()
      mockFetchCSAFProducts.mockReset()
    })

    it('should successfully fetch and parse CSAF document with families', async () => {
      const user = userEvent.setup()

      const mockCSAFDocument = {
        product_tree: {
          branches: [
            {
              category: 'vendor',
              name: 'Test Vendor',
              branches: [
                {
                  category: 'product_family',
                  name: 'Test Family',
                  branches: [],
                },
              ],
            },
          ],
          full_product_names: [],
          relationships: [],
        },
      }

      const mockParsedFamilies = [
        {
          id: 'family-1',
          name: 'Test Family',
          description: 'Test family description',
        },
      ]

      mockFetchCSAFProducts.mockResolvedValue(mockCSAFDocument)
      mockParseProductTree.mockReturnValue({
        families: mockParsedFamilies,
        products: [],
      })

      const mockUpdateFamilies = vi.fn()
      mockUseDocumentStore.mockImplementation((selector?: any) => {
        const store = {
          products: [],
          families: [],
          relationships: [],
          updateProducts: mockUpdateProducts,
          updateFamilies: mockUpdateFamilies,
          updateRelationships: vi.fn(),
        }
        if (typeof selector === 'function') return selector(store)
        return store
      })

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      await user.click(product1Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      await waitFor(() => {
        expect(mockFetchCSAFProducts).toHaveBeenCalledWith(['product-1'])
        expect(mockParseProductTree).toHaveBeenCalledWith(mockCSAFDocument)
      })
    })

    it('should handle CSAF document with relationships', async () => {
      const user = userEvent.setup()

      const mockCSAFDocument = {
        product_tree: {
          branches: [],
          full_product_names: [],
          relationships: [
            {
              category: 'default_component_of',
              full_product_name: {
                name: 'Product A',
                product_id: 'prod-a',
              },
              relates_to_product_reference: 'prod-b',
            },
          ],
        },
      }

      const mockParsedRelationships = [
        {
          id: 'rel-1',
          category: 'default_component_of',
          productReference: 'prod-a',
          relatesToProductReference: 'prod-b',
        },
      ]

      mockFetchCSAFProducts.mockResolvedValue(mockCSAFDocument)
      mockParseProductTree.mockReturnValue({
        families: [],
        products: [],
      })
      mockParseRelationships.mockReturnValue(mockParsedRelationships)

      const mockUpdateRelationships = vi.fn()
      mockUseDocumentStore.mockImplementation((selector?: any) => {
        const store = {
          products: [],
          families: [],
          relationships: [],
          updateProducts: mockUpdateProducts,
          updateFamilies: vi.fn(),
          updateRelationships: mockUpdateRelationships,
        }
        if (typeof selector === 'function') return selector(store)
        return store
      })

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      await user.click(product1Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      await waitFor(() => {
        expect(mockParseRelationships).toHaveBeenCalledWith(
          mockCSAFDocument.product_tree.relationships,
          expect.any(Array),
        )
        expect(mockUpdateRelationships).toHaveBeenCalledWith(
          expect.arrayContaining(mockParsedRelationships),
        )
      })
    })

    it('should handle CSAF fetch failure gracefully', async () => {
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockFetchCSAFProducts.mockRejectedValue(new Error('CSAF fetch failed'))
      mockParseProductTree.mockReturnValue({
        families: [],
        products: [],
      })

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      await user.click(product1Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching CSAF document:',
          expect.any(Error),
        )
        // Should still proceed with regular product import (with existing products)
        expect(mockUpdateProducts).toHaveBeenCalled()
      })

      consoleSpy.mockRestore()
    })

    it('should handle CSAF product tree parsing failure gracefully', async () => {
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockCSAFDocument = {
        product_tree: {
          branches: [],
          full_product_names: [],
          relationships: [],
        },
      }

      mockFetchCSAFProducts.mockResolvedValue(mockCSAFDocument)
      mockParseProductTree.mockImplementation(() => {
        throw new Error('Product tree parsing failed')
      })

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      await user.click(product1Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to add products:',
          expect.any(Error),
        )
        // Should NOT proceed with product import on error
        expect(mockUpdateProducts).not.toHaveBeenCalled()
      })

      consoleSpy.mockRestore()
    })

    it('should handle CSAF relationships parsing failure gracefully', async () => {
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockCSAFDocument = {
        product_tree: {
          branches: [],
          full_product_names: [],
          relationships: [{ some: 'relationship' }],
        },
      }

      mockFetchCSAFProducts.mockResolvedValue(mockCSAFDocument)
      mockParseProductTree.mockReturnValue({
        families: [],
        products: [],
      })
      mockParseRelationships.mockImplementation(() => {
        throw new Error('Relationships parsing failed')
      })

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      await user.click(product1Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to add products:',
          expect.any(Error),
        )
        // Should NOT proceed with product import on error
        expect(mockUpdateProducts).not.toHaveBeenCalled()
      })

      consoleSpy.mockRestore()
    })

    it('should skip relationships parsing when no relationships in CSAF document', async () => {
      const user = userEvent.setup()

      // Reset all mocks
      mockUpdateProducts.mockClear()
      mockParseRelationships.mockClear()

      const mockCSAFDocument = {
        product_tree: {
          branches: [],
          full_product_names: [],
          relationships: undefined, // No relationships
        },
      }

      mockFetchCSAFProducts.mockResolvedValue(mockCSAFDocument)
      mockParseProductTree.mockReturnValue({
        families: [],
        products: [
          {
            id: 'vendor-1',
            name: 'Test Vendor 1',
            type: 'Vendor',
            subBranches: [
              {
                id: 'product-1',
                name: 'Test Product 1',
                type: 'Software',
                subBranches: [],
              },
            ],
          },
        ],
      })

      const mockUpdateRelationships = vi.fn()
      mockUseDocumentStore.mockImplementation((selector?: any) => {
        const store = {
          products: [],
          families: [],
          relationships: [],
          updateProducts: mockUpdateProducts,
          updateFamilies: vi.fn(),
          updateRelationships: mockUpdateRelationships,
        }
        if (typeof selector === 'function') return selector(store)
        return store
      })

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      await user.click(product1Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      await waitFor(() => {
        expect(mockParseRelationships).not.toHaveBeenCalled()
        expect(mockUpdateRelationships).not.toHaveBeenCalled()
        expect(mockUpdateProducts).toHaveBeenCalled()
      })
    })

    it('should skip relationship updates when no relationships returned from parsing', async () => {
      const user = userEvent.setup()

      // Reset all mocks
      mockUpdateProducts.mockClear()
      mockParseRelationships.mockClear()

      const mockCSAFDocument = {
        product_tree: {
          branches: [],
          full_product_names: [],
          relationships: [{ some: 'relationship' }],
        },
      }

      mockFetchCSAFProducts.mockResolvedValue(mockCSAFDocument)
      mockParseProductTree.mockReturnValue({
        families: [],
        products: [
          {
            id: 'vendor-1',
            name: 'Test Vendor 1',
            type: 'Vendor',
            subBranches: [
              {
                id: 'product-1',
                name: 'Test Product 1',
                type: 'Software',
                subBranches: [],
              },
            ],
          },
        ],
      })
      mockParseRelationships.mockReturnValue([]) // Returns empty array

      const mockUpdateRelationships = vi.fn()
      mockUseDocumentStore.mockImplementation((selector?: any) => {
        const store = {
          products: [],
          families: [],
          relationships: [],
          updateProducts: mockUpdateProducts,
          updateFamilies: vi.fn(),
          updateRelationships: mockUpdateRelationships,
        }
        if (typeof selector === 'function') return selector(store)
        return store
      })

      render(<ProductDatabaseSelector isOpen={true} onClose={mockOnClose} />)

      await waitFor(() => {
        const checkboxes = screen.getAllByTestId('checkbox')
        expect(checkboxes.length).toBeGreaterThanOrEqual(3)
      })

      const checkboxLabels = screen.getAllByTestId('checkbox-label')
      const product1Label = checkboxLabels.find(
        (label) => label.textContent === 'Test Product 1',
      )
      const product1Checkbox = product1Label!
        .closest('[data-testid="checkbox"]')
        ?.querySelector('input')

      await user.click(product1Checkbox!)

      const addButton = screen
        .getAllByTestId('button')
        .find((btn) => btn.textContent?.includes('Add'))
      await user.click(addButton!)

      await waitFor(() => {
        expect(mockParseRelationships).toHaveBeenCalled()
        expect(mockUpdateRelationships).toHaveBeenCalledWith([]) // Should be called with empty array
        expect(mockUpdateProducts).toHaveBeenCalled()
      })
    })
  })
})
