import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Remediations from '../../../src/routes/vulnerabilities/Remediations'
import { TVulnerability } from '../../../src/routes/vulnerabilities/types/tVulnerability'
import { TRemediation, TRemediationCategory } from '../../../src/routes/vulnerabilities/types/tRemediation'
import { TProductTreeBranch } from '../../../src/routes/products/types/tProductTreeBranch'
import { TVulnerabilityProduct } from '../../../src/routes/vulnerabilities/types/tVulnerabilityProduct'

// Mock all the dependencies
vi.mock('@/components/forms/ComponentList', () => ({
  default: ({ listState, title, itemLabel, content, startContent }: any) => (
    <div data-testid="component-list">
      <div data-testid="list-title">{title}</div>
      <div data-testid="item-label">{itemLabel}</div>
      {listState.data.map((item: any, index: number) => (
        <div key={item.id || index} data-testid={`list-item-${index}`}>
          {startContent && (
            <div data-testid={`start-content-${index}`}>
              {startContent({ item, index })}
            </div>
          )}
          <div data-testid={`content-${index}`}>
            {content(item, index)}
          </div>
        </div>
      ))}
    </div>
  )
}))

vi.mock('@/components/forms/DatePicker', () => ({
  default: ({ label, value, onChange, isDisabled, csafPath, isTouched }: any) => (
    <div data-testid="date-picker">
      <label>{label}</label>
      <input
        data-testid="date-input"
        data-csaf-path={csafPath}
        data-touched={isTouched}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={isDisabled}
      />
    </div>
  )
}))

vi.mock('@/components/forms/HSplit', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="hsplit" className={className}>{children}</div>
  )
}))

vi.mock('@/components/forms/Input', () => ({
  Input: ({ label, value, onValueChange, isDisabled, csafPath, isTouched, placeholder }: any) => (
    <div data-testid="input">
      <label>{label}</label>
      <input
        data-testid="text-input"
        data-csaf-path={csafPath}
        data-touched={isTouched}
        value={value || ''}
        onChange={(e) => onValueChange?.(e.target.value)}
        disabled={isDisabled}
        placeholder={placeholder}
      />
    </div>
  ),
  Textarea: ({ label, value, onValueChange, isDisabled, csafPath, isTouched, isRequired, placeholder }: any) => (
    <div data-testid="textarea">
      <label>{label}</label>
      <textarea
        data-testid="textarea-input"
        data-csaf-path={csafPath}
        data-touched={isTouched}
        data-required={isRequired}
        value={value || ''}
        onChange={(e) => onValueChange?.(e.target.value)}
        disabled={isDisabled}
        placeholder={placeholder}
      />
    </div>
  )
}))

vi.mock('@/components/forms/Select', () => ({
  default: ({ label, selectedKeys, onSelectionChange, isDisabled, csafPath, isTouched, placeholder, children }: any) => (
    <div data-testid="select">
      <label>{label}</label>
      <select
        data-testid="select-input"
        data-csaf-path={csafPath}
        data-touched={isTouched}
        value={selectedKeys?.[0] || ''}
        onChange={(e) => onSelectionChange?.({ anchorKey: e.target.value, has: () => true, [Symbol.iterator]: function* () { yield e.target.value } })}
        disabled={isDisabled}
        data-placeholder={placeholder}
      >
        <option value="">Select...</option>
        <option value="mitigation">Mitigation</option>
        <option value="no_fix_planned">No Fix Planned</option>
        <option value="none_available">None Available</option>
        <option value="vendor_fix">Vendor Fix</option>
        <option value="workaround">Workaround</option>
      </select>
    </div>
  )
}))

vi.mock('@/components/forms/VSplit', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="vsplit">{children}</div>
  )
}))

vi.mock('@/components/StatusIndicator', () => ({
  default: ({ hasErrors, hasVisited }: { hasErrors: boolean; hasVisited: boolean }) => (
    <div data-testid="status-indicator" data-has-errors={hasErrors} data-has-visited={hasVisited}>
      Status Indicator
    </div>
  )
}))

vi.mock('@/utils/template', () => ({
  checkReadOnly: vi.fn(() => false),
  getPlaceholder: vi.fn((obj, field) => `Placeholder for ${field}`)
}))

vi.mock('@/utils/useListState', () => ({
  useListState: vi.fn()
}))

vi.mock('@/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: vi.fn()
}))

vi.mock('@/utils/validation/useFieldValidation', () => ({
  useFieldValidation: vi.fn()
}))

vi.mock('@/utils/validation/useListValidation', () => ({
  useListValidation: vi.fn()
}))

vi.mock('@/utils/validation/usePrefixValidation', () => ({
  usePrefixValidation: vi.fn()
}))

vi.mock('@heroui/chip', () => ({
  Chip: ({ children, color, variant, radius, size }: any) => (
    <span data-testid="chip" data-color={color} data-variant={variant} data-radius={radius} data-size={size}>
      {children}
    </span>
  )
}))

vi.mock('@heroui/react', () => ({
  Alert: ({ children, color, className }: { children: React.ReactNode; color: string; className?: string }) => (
    <div data-testid="alert" data-color={color} className={className}>
      {children}
    </div>
  )
}))

vi.mock('@heroui/select', () => ({
  SelectItem: ({ children, ...props }: any) => (
    <option value={props.key} {...props}>{children}</option>
  )
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'vulnerabilities.remediation.title': 'Remediation',
        'vulnerabilities.remediation.category': 'Category',
        'vulnerabilities.remediation.date': 'Date',
        'vulnerabilities.remediation.details': 'Details',
        'vulnerabilities.remediation.url': 'URL',
        'vulnerabilities.remediation.categories.mitigation': 'Mitigation',
        'vulnerabilities.remediation.categories.no_fix_planned': 'No Fix Planned',
        'vulnerabilities.remediation.categories.none_available': 'None Available',
        'vulnerabilities.remediation.categories.vendor_fix': 'Vendor Fix',
        'vulnerabilities.remediation.categories.workaround': 'Workaround'
      }
      return translations[key] || key
    }
  })
}))

vi.mock('../../../src/routes/vulnerabilities/components/ProductsTagList', () => ({
  default: ({ selected, products, onChange, error, isRequired }: any) => (
    <div data-testid="products-tag-list" data-required={isRequired}>
      {error && <div data-testid="products-error">{error}</div>}
      <div data-testid="selected-products">{selected?.join(', ') || 'No products selected'}</div>
      <div data-testid="available-products">{products?.length || 0} products available</div>
      <button
        data-testid="change-products"
        onClick={() => onChange?.(['product1', 'product2'])}
      >
        Change Products
      </button>
    </div>
  )
}))

vi.mock('../../../src/routes/vulnerabilities/types/tRemediation', () => ({
  remediationCategories: ['mitigation', 'no_fix_planned', 'none_available', 'vendor_fix', 'workaround'],
  useRemediationGenerator: vi.fn()
}))

// Import mocked functions
import { useListState } from '../../../src/utils/useListState'
import { useProductTreeBranch } from '../../../src/utils/useProductTreeBranch'
import { useFieldValidation } from '../../../src/utils/validation/useFieldValidation'
import { useListValidation } from '../../../src/utils/validation/useListValidation'
import { usePrefixValidation } from '../../../src/utils/validation/usePrefixValidation'
import { useRemediationGenerator } from '../../../src/routes/vulnerabilities/types/tRemediation'

describe('Remediations', () => {
  const mockUseListState = vi.mocked(useListState)
  const mockUseListValidation = vi.mocked(useListValidation)
  const mockUseProductTreeBranch = vi.mocked(useProductTreeBranch)
  const mockUsePrefixValidation = vi.mocked(usePrefixValidation)
  const mockUseFieldValidation = vi.mocked(useFieldValidation)
  const mockUseRemediationGenerator = vi.mocked(useRemediationGenerator)

  const mockRemediation: TRemediation = {
    id: 'remediation-1',
    category: 'mitigation' as TRemediationCategory,
    details: 'Apply the latest security patch',
    date: '2023-12-01',
    url: 'https://example.com/patch',
    productIds: ['product1']
  }

  const mockVulnerability: TVulnerability = {
    id: 'vuln-1',
    title: 'Test Vulnerability',
    notes: [],
    products: [
      {
        id: 'prod-1',
        productId: 'product1',
        versions: ['product1'],
        status: 'known_affected'
      }
    ],
    remediations: [mockRemediation],
    scores: []
  }

  const mockPTBs: TProductTreeBranch[] = [
    {
      id: 'product1',
      category: 'product_name',
      name: 'Product 1',
      description: 'Product 1 description',
      subBranches: []
    },
    {
      id: 'product2',
      category: 'product_name',
      name: 'Product 2',
      description: 'Product 2 description',
      subBranches: []
    }
  ]

  const mockOnChange = vi.fn()
  const mockUpdateDataEntry = vi.fn()
  const mockSetData = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseListState.mockReturnValue({
      data: [mockRemediation],
      setData: mockSetData,
      updateDataEntry: mockUpdateDataEntry,
      addDataEntry: vi.fn(),
      removeDataEntry: vi.fn(),
      getId: vi.fn((entry) => entry.id)
    })

    mockUseListValidation.mockReturnValue({
      messages: [],
      hasErrors: false,
      hasWarnings: false,
      hasInfos: false,
      errorMessages: [],
      warningMessages: [],
      infoMessages: [],
      isTouched: false,
      markFieldAsTouched: vi.fn()
    })

    mockUseProductTreeBranch.mockReturnValue({
      rootBranch: mockPTBs,
      findProductTreeBranch: vi.fn(),
      findProductTreeBranchWithParents: vi.fn(),
      getFilteredPTBs: vi.fn(),
      getPTBsByCategory: vi.fn(),
      getSelectablePTBs: () => mockPTBs,
      getSelectableRefs: vi.fn(() => [
        {
          category: 'product_version',
          full_product_name: {
            name: 'Product 1',
            product_id: 'product1'
          }
        },
        {
          category: 'product_version',
          full_product_name: {
            name: 'Product 2',
            product_id: 'product2'
          }
        }
      ]),
      addPTB: vi.fn(),
      updatePTB: vi.fn(),
      deletePTB: vi.fn()
    })

    mockUsePrefixValidation.mockReturnValue({
      hasErrors: false
    })

    mockUseFieldValidation.mockReturnValue({
      messages: [],
      hasErrors: false,
      hasWarnings: false,
      hasInfos: false,
      errorMessages: [],
      warningMessages: [],
      infoMessages: [],
      isTouched: true,
      markFieldAsTouched: vi.fn()
    })

    mockUseRemediationGenerator.mockReturnValue({
      id: 'new-remediation',
      category: 'mitigation' as TRemediationCategory,
      productIds: []
    })
  })

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('component-list')).toBeInTheDocument()
    })

    it('renders remediation items', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('list-item-0')).toBeInTheDocument()
      expect(screen.getByTestId('start-content-0')).toBeInTheDocument()
      expect(screen.getByTestId('content-0')).toBeInTheDocument()
    })

    it('displays error alert when validation has errors', () => {
      const errorMessage = { path: '/vulnerabilities/0/remediations/0', message: 'Details are required' }
      mockUseListValidation.mockReturnValue({
        messages: [errorMessage],
        hasErrors: true,
        hasWarnings: false,
        hasInfos: false,
        errorMessages: [errorMessage],
        warningMessages: [],
        infoMessages: [],
        isTouched: true,
        markFieldAsTouched: vi.fn()
      })

      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('alert')).toBeInTheDocument()
      expect(screen.getByText('Details are required')).toBeInTheDocument()
    })

    it('does not display error alert when validation has no errors', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
    })
  })

  describe('RemediationStartContent', () => {
    it('renders status indicator and category chip', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('status-indicator')).toBeInTheDocument()
      expect(screen.getByTestId('chip')).toBeInTheDocument()
      // Use getAllByText to handle multiple elements with same text
      expect(screen.getAllByText('Mitigation')[0]).toBeInTheDocument()
    })

    it('shows error state in status indicator when validation has errors', () => {
      mockUsePrefixValidation.mockReturnValue({
        hasErrors: true
      })

      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('status-indicator')).toHaveAttribute('data-has-errors', 'true')
    })
  })

  describe('RemediationForm', () => {
    it('renders all form fields', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('select')).toBeInTheDocument()
      expect(screen.getByTestId('date-picker')).toBeInTheDocument()
      expect(screen.getByTestId('textarea')).toBeInTheDocument()
      expect(screen.getByTestId('input')).toBeInTheDocument()
      expect(screen.getByTestId('products-tag-list')).toBeInTheDocument()
    })

    it('displays correct field labels', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
      expect(screen.getByText('URL')).toBeInTheDocument()
    })

    it('shows current values in form fields', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('select-input')).toHaveValue('mitigation')
      expect(screen.getByTestId('date-input')).toHaveValue('2023-12-01')
      expect(screen.getByTestId('textarea-input')).toHaveValue('Apply the latest security patch')
      expect(screen.getByTestId('text-input')).toHaveValue('https://example.com/patch')
    })
  })

  describe('Form Interactions', () => {
    it('calls onChange when category is changed', async () => {
      const user = userEvent.setup()

      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const select = screen.getByTestId('select-input')
      await user.selectOptions(select, 'vendor_fix')

      expect(mockUpdateDataEntry).toHaveBeenCalled()
    })

    it('calls onChange when date is changed', async () => {
      const user = userEvent.setup()

      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const dateInput = screen.getByTestId('date-input')
      await user.clear(dateInput)
      await user.type(dateInput, '2024-01-01')

      expect(mockUpdateDataEntry).toHaveBeenCalled()
    })

    it('calls onChange when details are changed', async () => {
      const user = userEvent.setup()

      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const textarea = screen.getByTestId('textarea-input')
      await user.clear(textarea)
      await user.type(textarea, 'New details')

      expect(mockUpdateDataEntry).toHaveBeenCalled()
    })

    it('calls onChange when URL is changed', async () => {
      const user = userEvent.setup()

      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const urlInput = screen.getByTestId('text-input')
      await user.clear(urlInput)
      await user.type(urlInput, 'https://newurl.com')

      expect(mockUpdateDataEntry).toHaveBeenCalled()
    })

    it('calls onChange when products are changed', async () => {
      const user = userEvent.setup()

      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      const changeProductsButton = screen.getByTestId('change-products')
      await user.click(changeProductsButton)

      expect(mockUpdateDataEntry).toHaveBeenCalled()
    })
  })

  describe('Data Flow', () => {
    it('calls onChange with updated vulnerability when remediations change', () => {
      const newRemediations = [...mockVulnerability.remediations, { ...mockRemediation, id: 'remediation-2' }]
      mockUseListState.mockReturnValue({
        data: newRemediations,
        setData: mockSetData,
        updateDataEntry: mockUpdateDataEntry,
        addDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
        getId: vi.fn((entry) => entry.id)
      })

      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      // The useEffect should trigger onChange with updated remediations
      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockVulnerability,
        remediations: newRemediations
      })
    })

    it('initializes list state with vulnerability remediations', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(mockUseListState).toHaveBeenCalledWith({
        initialData: mockVulnerability.remediations,
        generator: expect.any(Object)
      })
    })

    it('filters products based on known affected products', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      // Should only show products that are in known_affected status
      expect(screen.getByTestId('available-products')).toHaveTextContent('1 products available')
    })
  })

  describe('Validation', () => {
    it('shows validation errors for product IDs', () => {
      mockUseFieldValidation.mockReturnValue({
        messages: [{ path: '/productIds', message: 'At least one product is required' }],
        hasErrors: true,
        hasWarnings: false,
        hasInfos: false,
        errorMessages: [{ path: '/productIds', message: 'At least one product is required' }],
        warningMessages: [],
        infoMessages: [],
        isTouched: true,
        markFieldAsTouched: vi.fn()
      })

      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('products-error')).toHaveTextContent('At least one product is required')
    })

    it('does not show validation errors when field is valid', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.queryByTestId('products-error')).not.toBeInTheDocument()
    })
  })

  describe('Props and Configuration', () => {
    it('passes isTouched prop to form components', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
          isTouched={true}
        />
      )

      expect(screen.getByTestId('select-input')).toHaveAttribute('data-touched', 'true')
      expect(screen.getByTestId('date-input')).toHaveAttribute('data-touched', 'true')
      expect(screen.getByTestId('textarea-input')).toHaveAttribute('data-touched', 'true')
      expect(screen.getByTestId('text-input')).toHaveAttribute('data-touched', 'true')
    })

    it('sets correct CSAF paths for validation', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={2}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('select-input')).toHaveAttribute('data-csaf-path', '/vulnerabilities/2/remediations/0/category')
      expect(screen.getByTestId('date-input')).toHaveAttribute('data-csaf-path', '/vulnerabilities/2/remediations/0/date')
      expect(screen.getByTestId('textarea-input')).toHaveAttribute('data-csaf-path', '/vulnerabilities/2/remediations/0/details')
      expect(screen.getByTestId('text-input')).toHaveAttribute('data-csaf-path', '/vulnerabilities/2/remediations/0/url')
    })

    it('marks required fields correctly', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('textarea-input')).toHaveAttribute('data-required', 'true')
      expect(screen.getByTestId('products-tag-list')).toHaveAttribute('data-required', 'true')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty remediations array', () => {
      const emptyVulnerability = { ...mockVulnerability, remediations: [] }
      mockUseListState.mockReturnValue({
        data: [],
        setData: mockSetData,
        updateDataEntry: mockUpdateDataEntry,
        addDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
        getId: vi.fn((entry) => entry.id)
      })

      render(
        <Remediations
          vulnerability={emptyVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('component-list')).toBeInTheDocument()
      expect(screen.queryByTestId('list-item-0')).not.toBeInTheDocument()
    })

    it('handles vulnerability with no known affected products', () => {
      const vulnWithoutAffectedProducts = {
        ...mockVulnerability,
        products: [
          {
            id: 'prod-1',
            productId: 'product1',
            versions: ['product1'],
            status: 'known_not_affected' as const
          }
        ] as TVulnerabilityProduct[]
      }

      render(
        <Remediations
          vulnerability={vulnWithoutAffectedProducts}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('available-products')).toHaveTextContent('0 products available')
    })

    it('handles missing optional fields in remediation', () => {
      const remediationWithoutOptionalFields: TRemediation = {
        id: 'remediation-2',
        category: 'workaround',
        productIds: []
      }

      mockUseListState.mockReturnValue({
        data: [remediationWithoutOptionalFields],
        setData: mockSetData,
        updateDataEntry: mockUpdateDataEntry,
        addDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
        getId: vi.fn((entry) => entry.id)
      })

      render(
        <Remediations
          vulnerability={{ ...mockVulnerability, remediations: [remediationWithoutOptionalFields] }}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('select-input')).toHaveValue('workaround')
      expect(screen.getByTestId('date-input')).toHaveValue('')
      expect(screen.getByTestId('textarea-input')).toHaveValue('')
      expect(screen.getByTestId('text-input')).toHaveValue('')
    })
  })

  describe('Multiple Error Messages', () => {
    it('displays multiple validation error messages', () => {
      mockUseListValidation.mockReturnValue({
        messages: [
          { path: '/vulnerabilities/0/remediations/0/details', message: 'Details are required' },
          { path: '/vulnerabilities/0/remediations/0/productIds', message: 'At least one product is required' }
        ],
        hasErrors: true,
        hasWarnings: false,
        hasInfos: false,
        errorMessages: [
          { path: '/vulnerabilities/0/remediations/0/details', message: 'Details are required' },
          { path: '/vulnerabilities/0/remediations/0/productIds', message: 'At least one product is required' }
        ],
        warningMessages: [],
        infoMessages: [],
        isTouched: true,
        markFieldAsTouched: vi.fn()
      })

      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByText('Details are required')).toBeInTheDocument()
      expect(screen.getByText('At least one product is required')).toBeInTheDocument()
    })
  })

  describe('Accessibility and Placeholders', () => {
    it('displays placeholders for form fields', () => {
      render(
        <Remediations
          vulnerability={mockVulnerability}
          vulnerabilityIndex={0}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('select-input')).toHaveAttribute('data-placeholder', 'Placeholder for category')
      expect(screen.getByTestId('textarea-input')).toHaveAttribute('placeholder', 'Placeholder for details')
      expect(screen.getByTestId('text-input')).toHaveAttribute('placeholder', 'Placeholder for url')
    })
  })
})
