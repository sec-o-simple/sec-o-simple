import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Unmock the ProductManagement component to test the actual implementation
vi.unmock('../../../src/routes/products/ProductManagement')

import ProductManagement from '../../../src/routes/products/ProductManagement'

// Mock all the dependencies
vi.mock('@/components/WizardStep', () => ({
  default: ({
    children,
    progress,
    onBack,
    onContinue,
    noContentWrapper,
    ...props
  }: any) => (
    <div
      data-testid="wizard-step"
      data-progress={progress}
      data-on-back={onBack}
      data-on-continue={onContinue}
      data-no-content-wrapper={noContentWrapper}
      {...props}
    >
      {children}
    </div>
  ),
}))

vi.mock('../../../src/utils/useConfigStore', () => ({
  useConfigStore: vi.fn(),
}))

vi.mock('../../../src/utils/useDocumentType', () => ({
  default: vi.fn(),
}))

vi.mock('../../../src/utils/validation/usePageVisit', () => ({
  default: vi.fn(),
}))

vi.mock('@heroui/button', () => ({
  Button: ({ children, onPress, variant, color, ...props }: any) => (
    <button
      data-testid="import-button"
      data-variant={variant}
      data-color={color}
      onClick={onPress}
      {...props}
    >
      {children}
    </button>
  ),
}))

vi.mock('@heroui/tabs', () => ({
  Tabs: ({
    children,
    className,
    color,
    variant,
    selectedKey,
    onSelectionChange,
    ...props
  }: any) => (
    <div
      data-testid="tabs"
      data-class={className}
      data-color={color}
      data-variant={variant}
      data-selected-key={selectedKey}
      {...props}
    >
      <select
        data-testid="tab-selector"
        value={selectedKey}
        onChange={(e) => onSelectionChange?.(e.target.value)}
      >
        <option value="Vendors">Vendors</option>
        <option value="Software">Software</option>
        <option value="Hardware">Hardware</option>
      </select>
      {children}
    </div>
  ),
  Tab: ({ children, title, ...props }: any) => (
    <div data-testid={`tab-${title}`} data-title={title} {...props}>
      {children}
    </div>
  ),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'products.manage': 'Manage Products',
        'products.import.title': 'Import Products',
        'products.vendors': 'Vendors',
        'products.software': 'Software',
        'products.hardware': 'Hardware',
      }
      return translations[key] || key
    },
  }),
}))

vi.mock(
  '../../../src/routes/products/components/ProductDatabaseSelector',
  () => ({
    default: ({ isOpen, onClose, ...props }: any) => (
      <div
        data-testid="product-database-selector"
        data-is-open={isOpen}
        style={{ display: isOpen ? 'block' : 'none' }}
        {...props}
      >
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
        Product Database Selector Modal
      </div>
    ),
  }),
)

vi.mock('../../../src/routes/products/ProductList', () => ({
  default: ({ productType, ...props }: any) => (
    <div
      data-testid={`product-list-${productType?.toLowerCase()}`}
      data-product-type={productType}
      {...props}
    >
      Product List for {productType}
    </div>
  ),
}))

vi.mock('../../../src/routes/products/VendorList', () => ({
  default: ({ ...props }: any) => (
    <div data-testid="vendor-list" {...props}>
      Vendor List Component
    </div>
  ),
}))

// Import the mocked functions
import { useConfigStore } from '../../../src/utils/useConfigStore'
import useDocumentType from '../../../src/utils/useDocumentType'
import usePageVisit from '../../../src/utils/validation/usePageVisit'

const mockUseConfigStore = vi.mocked(useConfigStore)
const mockUseDocumentType = vi.mocked(useDocumentType)
const mockUsePageVisit = vi.mocked(usePageVisit)

describe('ProductManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUsePageVisit.mockReturnValue(false)
    mockUseDocumentType.mockReturnValue({
      type: 'HardwareSoftware',
      hasHardware: true,
      hasSoftware: true,
    })
    mockUseConfigStore.mockReturnValue({
      productDatabase: {
        enabled: false,
        url: '',
      },
    })
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<ProductManagement />)

      expect(screen.getByTestId('wizard-step')).toBeInTheDocument()
    })

    it('should render with correct WizardStep props', () => {
      render(<ProductManagement />)

      const wizardStep = screen.getByTestId('wizard-step')
      expect(wizardStep).toHaveAttribute('data-progress', '2.5')
      expect(wizardStep).toHaveAttribute('data-on-back', '/products/families')
      expect(wizardStep).toHaveAttribute('data-on-continue', '/vulnerabilities')
      expect(wizardStep).toHaveAttribute('data-no-content-wrapper', 'true')
    })

    it('should render main title', () => {
      render(<ProductManagement />)

      expect(screen.getByText('Manage Products')).toBeInTheDocument()
    })

    it('should render tabs with correct props', () => {
      render(<ProductManagement />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-class', 'w-full')
      expect(tabs).toHaveAttribute('data-color', 'primary')
      expect(tabs).toHaveAttribute('data-variant', 'light')
      expect(tabs).toHaveAttribute('data-selected-key', 'Vendors')
    })

    it('should call usePageVisit hook', () => {
      render(<ProductManagement />)

      expect(mockUsePageVisit).toHaveBeenCalledOnce()
    })
  })

  describe('Product Database Integration', () => {
    it('should not render ProductDatabaseSelector when productDb is disabled', () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: false,
          url: '',
        },
      })

      render(<ProductManagement />)

      expect(
        screen.queryByTestId('product-database-selector'),
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId('import-button')).not.toBeInTheDocument()
    })

    it('should not render ProductDatabaseSelector when productDb is enabled but no URL', () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: true,
          url: '',
        },
      })

      render(<ProductManagement />)

      expect(
        screen.queryByTestId('product-database-selector'),
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId('import-button')).not.toBeInTheDocument()
    })

    it('should not render ProductDatabaseSelector when URL exists but not enabled', () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: false,
          url: 'https://example.com',
        },
      })

      render(<ProductManagement />)

      expect(
        screen.queryByTestId('product-database-selector'),
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId('import-button')).not.toBeInTheDocument()
    })

    it('should render ProductDatabaseSelector when productDb is enabled and has URL', () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: true,
          url: 'https://example.com',
        },
      })

      render(<ProductManagement />)

      expect(
        screen.getByTestId('product-database-selector'),
      ).toBeInTheDocument()
      expect(screen.getByTestId('import-button')).toBeInTheDocument()
    })

    it('should render import button with correct props when productDb is enabled', () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: true,
          url: 'https://example.com',
        },
      })

      render(<ProductManagement />)

      const importButton = screen.getByTestId('import-button')
      expect(importButton).toHaveAttribute('data-variant', 'solid')
      expect(importButton).toHaveAttribute('data-color', 'primary')
      expect(importButton).toHaveTextContent('Import Products')
    })

    it('should open modal when import button is clicked', async () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: true,
          url: 'https://example.com',
        },
      })

      const user = userEvent.setup()
      render(<ProductManagement />)

      const importButton = screen.getByTestId('import-button')
      const modal = screen.getByTestId('product-database-selector')

      // Initially modal should be closed
      expect(modal).toHaveAttribute('data-is-open', 'false')

      // Click import button
      await user.click(importButton)

      // Modal should now be open
      expect(modal).toHaveAttribute('data-is-open', 'true')
    })

    it('should close modal when close button is clicked', async () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: true,
          url: 'https://example.com',
        },
      })

      const user = userEvent.setup()
      render(<ProductManagement />)

      // Open modal first
      const importButton = screen.getByTestId('import-button')
      await user.click(importButton)

      const modal = screen.getByTestId('product-database-selector')
      expect(modal).toHaveAttribute('data-is-open', 'true')

      // Close modal
      const closeButton = screen.getByTestId('close-modal')
      await user.click(closeButton)

      expect(modal).toHaveAttribute('data-is-open', 'false')
    })
  })

  describe('Tab Navigation', () => {
    it('should always render Vendors tab', () => {
      mockUseDocumentType.mockReturnValue({
        type: 'Software',
        hasHardware: false,
        hasSoftware: false,
      })

      render(<ProductManagement />)

      expect(screen.getByTestId('tab-Vendors')).toBeInTheDocument()
      expect(screen.getByTestId('vendor-list')).toBeInTheDocument()
    })

    it('should render Software tab when hasSoftware is true', () => {
      mockUseDocumentType.mockReturnValue({
        type: 'Software',
        hasHardware: false,
        hasSoftware: true,
      })

      render(<ProductManagement />)

      expect(screen.getByTestId('tab-Software')).toBeInTheDocument()
      expect(screen.getByTestId('product-list-software')).toBeInTheDocument()
      expect(screen.getByTestId('product-list-software')).toHaveAttribute(
        'data-product-type',
        'Software',
      )
    })

    it('should render Hardware tab when hasHardware is true', () => {
      mockUseDocumentType.mockReturnValue({
        type: 'HardwareSoftware',
        hasHardware: true,
        hasSoftware: false,
      })

      render(<ProductManagement />)

      expect(screen.getByTestId('tab-Hardware')).toBeInTheDocument()
      expect(screen.getByTestId('product-list-hardware')).toBeInTheDocument()
      expect(screen.getByTestId('product-list-hardware')).toHaveAttribute(
        'data-product-type',
        'Hardware',
      )
    })

    it('should not render Software tab when hasSoftware is false', () => {
      mockUseDocumentType.mockReturnValue({
        type: 'HardwareFirmware',
        hasHardware: true,
        hasSoftware: false,
      })

      render(<ProductManagement />)

      expect(screen.queryByTestId('tab-Software')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('product-list-software'),
      ).not.toBeInTheDocument()
    })

    it('should not render Hardware tab when hasHardware is false', () => {
      mockUseDocumentType.mockReturnValue({
        type: 'Software',
        hasHardware: false,
        hasSoftware: true,
      })

      render(<ProductManagement />)

      expect(screen.queryByTestId('tab-Hardware')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('product-list-hardware'),
      ).not.toBeInTheDocument()
    })

    it('should render all tabs when both hasHardware and hasSoftware are true', () => {
      mockUseDocumentType.mockReturnValue({
        type: 'HardwareSoftware',
        hasHardware: true,
        hasSoftware: true,
      })

      render(<ProductManagement />)

      expect(screen.getByTestId('tab-Vendors')).toBeInTheDocument()
      expect(screen.getByTestId('tab-Software')).toBeInTheDocument()
      expect(screen.getByTestId('tab-Hardware')).toBeInTheDocument()
      expect(screen.getByTestId('vendor-list')).toBeInTheDocument()
      expect(screen.getByTestId('product-list-software')).toBeInTheDocument()
      expect(screen.getByTestId('product-list-hardware')).toBeInTheDocument()
    })

    it('should handle tab selection change', async () => {
      mockUseDocumentType.mockReturnValue({
        type: 'HardwareSoftware',
        hasHardware: true,
        hasSoftware: true,
      })

      const user = userEvent.setup()
      render(<ProductManagement />)

      const tabSelector = screen.getByTestId('tab-selector')

      // Initially should be Vendors
      expect(tabSelector).toHaveValue('Vendors')

      // Change to Software
      await user.selectOptions(tabSelector, 'Software')
      expect(tabSelector).toHaveValue('Software')

      // Change to Hardware
      await user.selectOptions(tabSelector, 'Hardware')
      expect(tabSelector).toHaveValue('Hardware')
    })

    it('should default to Vendors tab', () => {
      render(<ProductManagement />)

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-selected-key', 'Vendors')
    })
  })

  describe('Hook Integration', () => {
    it('should call useConfigStore with correct selector', () => {
      render(<ProductManagement />)

      expect(mockUseConfigStore).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should call useDocumentType hook', () => {
      render(<ProductManagement />)

      expect(mockUseDocumentType).toHaveBeenCalledOnce()
    })

    it('should handle undefined config gracefully', () => {
      mockUseConfigStore.mockReturnValue(undefined)

      expect(() => {
        render(<ProductManagement />)
      }).not.toThrow()

      expect(screen.queryByTestId('import-button')).not.toBeInTheDocument()
    })

    it('should handle config without productDatabase', () => {
      mockUseConfigStore.mockReturnValue({})

      expect(() => {
        render(<ProductManagement />)
      }).not.toThrow()

      expect(screen.queryByTestId('import-button')).not.toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should initialize with correct default state', () => {
      render(<ProductManagement />)

      const modal = screen.queryByTestId('product-database-selector')
      if (modal) {
        expect(modal).toHaveAttribute('data-is-open', 'false')
      }

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-selected-key', 'Vendors')
    })

    it('should manage modal state correctly', async () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: true,
          url: 'https://example.com',
        },
      })

      const user = userEvent.setup()
      render(<ProductManagement />)

      const modal = screen.getByTestId('product-database-selector')
      const importButton = screen.getByTestId('import-button')
      const closeButton = screen.getByTestId('close-modal')

      // Initially closed
      expect(modal).toHaveAttribute('data-is-open', 'false')

      // Open modal
      await user.click(importButton)
      expect(modal).toHaveAttribute('data-is-open', 'true')

      // Close modal
      await user.click(closeButton)
      expect(modal).toHaveAttribute('data-is-open', 'false')

      // Open again
      await user.click(importButton)
      expect(modal).toHaveAttribute('data-is-open', 'true')
    })

    it('should manage tab selection state correctly', async () => {
      mockUseDocumentType.mockReturnValue({
        type: 'HardwareSoftware',
        hasHardware: true,
        hasSoftware: true,
      })

      const user = userEvent.setup()
      render(<ProductManagement />)

      const tabSelector = screen.getByTestId('tab-selector')
      const tabs = screen.getByTestId('tabs')

      // Initial state
      expect(tabs).toHaveAttribute('data-selected-key', 'Vendors')

      // Change tabs multiple times
      await user.selectOptions(tabSelector, 'Software')
      expect(tabs).toHaveAttribute('data-selected-key', 'Software')

      await user.selectOptions(tabSelector, 'Hardware')
      expect(tabs).toHaveAttribute('data-selected-key', 'Hardware')

      await user.selectOptions(tabSelector, 'Vendors')
      expect(tabs).toHaveAttribute('data-selected-key', 'Vendors')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing translations gracefully', () => {
      // This tests the fallback behavior in the translation mock
      render(<ProductManagement />)

      // Component should still render even if translations are missing
      expect(screen.getByTestId('wizard-step')).toBeInTheDocument()
    })

    it('should handle rapid tab switching', async () => {
      mockUseDocumentType.mockReturnValue({
        type: 'HardwareSoftware',
        hasHardware: true,
        hasSoftware: true,
      })

      const user = userEvent.setup()
      render(<ProductManagement />)

      const tabSelector = screen.getByTestId('tab-selector')

      // Rapidly switch tabs
      await user.selectOptions(tabSelector, 'Software')
      await user.selectOptions(tabSelector, 'Hardware')
      await user.selectOptions(tabSelector, 'Vendors')
      await user.selectOptions(tabSelector, 'Software')

      // Should handle all changes correctly
      expect(tabSelector).toHaveValue('Software')
    })

    it('should handle rapid modal open/close', async () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: true,
          url: 'https://example.com',
        },
      })

      const user = userEvent.setup()
      render(<ProductManagement />)

      const modal = screen.getByTestId('product-database-selector')
      const importButton = screen.getByTestId('import-button')
      const closeButton = screen.getByTestId('close-modal')

      // Rapidly open and close
      await user.click(importButton)
      await user.click(closeButton)
      await user.click(importButton)
      await user.click(closeButton)

      // Should end up closed
      expect(modal).toHaveAttribute('data-is-open', 'false')
    })
  })

  describe('Accessibility', () => {
    it('should have proper tab structure', () => {
      mockUseDocumentType.mockReturnValue({
        type: 'HardwareSoftware',
        hasHardware: true,
        hasSoftware: true,
      })

      render(<ProductManagement />)

      // Check that all tabs have proper titles
      expect(screen.getByTestId('tab-Vendors')).toHaveAttribute(
        'data-title',
        'Vendors',
      )
      expect(screen.getByTestId('tab-Software')).toHaveAttribute(
        'data-title',
        'Software',
      )
      expect(screen.getByTestId('tab-Hardware')).toHaveAttribute(
        'data-title',
        'Hardware',
      )
    })

    it('should have accessible button elements', () => {
      mockUseConfigStore.mockReturnValue({
        productDatabase: {
          enabled: true,
          url: 'https://example.com',
        },
      })

      render(<ProductManagement />)

      const importButton = screen.getByTestId('import-button')
      expect(importButton).toBeInTheDocument()
      expect(importButton.tagName).toBe('BUTTON')
    })
  })
})
