import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Unmock the Product component to test the actual implementation
vi.unmock('../../../src/routes/products/Product')

import Product from '../../../src/routes/products/Product'
import type {
  TProductTreeBranch,
  TProductTreeBranchWithParents,
} from '../../../src/routes/products/types/tProductTreeBranch'

// Mock all the dependencies
const mockUseParams = vi.fn()
const mockUseNavigate = vi.fn()

vi.mock('react-router', () => ({
  useParams: () => mockUseParams(),
  useNavigate: () => mockUseNavigate(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key: string, options?: any) => {
      const translations: Record<string, string> = {
        'untitled.vendor': 'Untitled Vendor',
        'untitled.product_name': 'Untitled Product',
        'untitled.product_version': 'Untitled Version',
        'products.product.label': 'Product',
        'common.add': `Add ${options?.label || 'Item'}`,
        'products.product.version.label': 'Version',
        'products.relationship.version': `${options?.count} version${options?.count !== 1 ? 's' : ''}`,
        'products.product.version.empty': 'No versions available',
        'products.relationship.edit': `Edit ${options?.count} relationship${options?.count !== 1 ? 's' : ''}`,
      }
      return translations[key] || key
    }),
  }),
}))

// Mock custom hooks
const mockFindProductTreeBranchWithParents = vi.fn()
const mockUpdatePTB = vi.fn()
const mockDeletePTB = vi.fn()
const mockAddOrUpdateRelationship = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../../src/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: () => ({
    findProductTreeBranchWithParents: mockFindProductTreeBranchWithParents,
    updatePTB: mockUpdatePTB,
    deletePTB: mockDeletePTB,
    getPTBName: mockGetPTBName,
    getSelectableRefs: vi.fn(() => [
      {
        id: 'version-1',
        fullProductName: 'Test Vendor / Test Product / Version 1.0',
      },
      {
        id: 'version-2',
        fullProductName: 'Another Vendor / Related Product / Version 2.0',
      },
    ]),
  }),
}))

vi.mock('../../../src/utils/useRelationships', () => ({
  useRelationships: () => ({
    addOrUpdateRelationship: mockAddOrUpdateRelationship,
  }),
}))

const mockUseDocumentStore = vi.fn()

vi.mock('../../../src/utils/useDocumentStore', () => ({
  default: (selector: any) => mockUseDocumentStore(selector),
}))

// Mock HeroUI components
const mockOnOpen = vi.fn()
const mockOnOpenChange = vi.fn()
const mockUseDisclosure = vi.fn()

vi.mock('@heroui/modal', () => ({
  Modal: ({ children, isOpen, onOpenChange }: any) =>
    isOpen ? (
      <div data-testid="modal" onClick={onOpenChange}>
        {children}
      </div>
    ) : null,
  useDisclosure: () => mockUseDisclosure(),
}))

vi.mock('@heroui/react', () => ({
  BreadcrumbItem: ({ children, href }: any) => (
    <div data-testid="breadcrumb-item" data-href={href}>
      {children}
    </div>
  ),
}))

// Mock component dependencies
vi.mock('../../../src/components/forms/Breadcrumbs', () => ({
  default: ({ children }: any) => (
    <div data-testid="breadcrumbs">{children}</div>
  ),
}))

vi.mock('../../../src/components/forms/IconButton', () => ({
  default: ({ icon, tooltip, onPress }: any) => (
    <button data-testid="icon-button" data-tooltip={tooltip} onClick={onPress}>
      Icon Button
    </button>
  ),
}))

vi.mock('../../../src/components/WizardStep', () => ({
  default: ({ children, progress, noContentWrapper }: any) => (
    <div
      data-testid="wizard-step"
      data-progress={progress}
      data-no-content-wrapper={noContentWrapper}
    >
      {children}
    </div>
  ),
}))

vi.mock('../../../src/routes/products/components/InfoCard', () => ({
  default: ({ title, variant, onEdit, onDelete, linkTo, endContent }: any) => (
    <div
      data-testid="info-card"
      data-variant={variant}
      {...(linkTo !== undefined && { 'data-link-to': linkTo })}
    >
      <div data-testid="info-card-title">{title}</div>
      <button data-testid="edit-button" onClick={onEdit}>
        Edit
      </button>
      <button data-testid="delete-button" onClick={onDelete}>
        Delete
      </button>
      {endContent && <div data-testid="end-content">{endContent}</div>}
    </div>
  ),
}))

vi.mock('../../../src/routes/products/components/SubMenuHeader', () => ({
  default: ({ title, backLink, actionTitle, onAction }: any) => (
    <div data-testid="sub-menu-header">
      <div data-testid="title">{title}</div>
      <div data-testid="back-link" data-href={backLink}>
        Back
      </div>
      <button data-testid="action-button" onClick={onAction}>
        {actionTitle}
      </button>
    </div>
  ),
}))

vi.mock('../../../src/routes/products/components/PTBEditForm', () => ({
  PTBCreateEditForm: ({ ptb, category, onSave }: any) => (
    <div data-testid="ptb-create-edit-form" data-category={category}>
      <div data-testid="ptb-data">{JSON.stringify(ptb)}</div>
      <button
        data-testid="save-button"
        onClick={() =>
          onSave({
            id: ptb?.id || 'new-id',
            name: 'Test Version',
            category: 'product_version',
            description: '',
            subBranches: [],
          })
        }
      >
        Save
      </button>
      <button
        data-testid="save-new-button"
        onClick={() =>
          onSave({
            name: 'New Version',
            category: 'product_version',
            description: '',
            subBranches: [],
          })
        }
      >
        Save New
      </button>
    </div>
  ),
}))

// Mock utility functions
const mockGetDefaultProductTreeBranch = vi.fn()
const mockGetPTBName = vi.fn()

vi.mock('../../../src/routes/products/types/tProductTreeBranch', () => ({
  getDefaultProductTreeBranch: (category: any) =>
    mockGetDefaultProductTreeBranch(category),
  getPTBName: (product: any) => mockGetPTBName(product),
}))

const mockGetDefaultRelationship = vi.fn()

vi.mock('../../../src/routes/products/types/tRelationship', () => ({
  getDefaultRelationship: () => mockGetDefaultRelationship(),
}))

// Test data helpers
const createMockProduct = (
  overrides?: Partial<TProductTreeBranchWithParents>,
): TProductTreeBranchWithParents => ({
  id: 'product-1',
  category: 'product_name' as const,
  name: 'Test Product',
  description: 'Test Description',
  type: 'Software' as const,
  subBranches: [],
  parent: {
    id: 'vendor-1',
    category: 'vendor' as const,
    name: 'Test Vendor',
    description: 'Test Vendor Description',
    subBranches: [],
    parent: null,
  },
  ...overrides,
})

const createMockVersion = (id: string, name: string): TProductTreeBranch => ({
  id,
  category: 'product_version',
  name,
  description: 'Version description',
  subBranches: [],
})

describe('Product', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    mockUseParams.mockReturnValue({ productId: 'product-1' })
    mockUseNavigate.mockReturnValue(mockNavigate)
    mockUseDocumentStore.mockImplementation((selector) => {
      const mockStore = { sosDocumentType: 'Software' }
      return selector(mockStore)
    })
    mockUseDisclosure.mockReturnValue({
      isOpen: false,
      onOpen: mockOnOpen,
      onOpenChange: mockOnOpenChange,
    })

    // Setup utility function mocks
    mockGetDefaultProductTreeBranch.mockImplementation((category) => ({
      id: 'default-id',
      category,
      name: '',
      description: '',
      subBranches: [],
      type: category === 'product_name' ? 'Software' : undefined,
    }))
    mockGetPTBName.mockImplementation((product) => {
      if (!product) return { name: 'Default Name' }

      // For product versions, use untitled.product_version when name is empty
      if (product.category === 'product_version') {
        return {
          name: product.name || 'Untitled Version',
          isReadonly: false,
        }
      }

      // For other categories (like product_name), just return the name as-is
      // The component will handle the untitled logic
      return {
        name: product.name,
        isReadonly: false,
      }
    })
    mockGetDefaultRelationship.mockReturnValue({
      id: 'default-relationship-id',
      category: 'installed_on',
      productId1: '',
      productId2: '',
      relationships: [],
      name: '',
    })

    mockFindProductTreeBranchWithParents.mockReturnValue(createMockProduct())
    mockUpdatePTB.mockReturnValue([])
  })

  describe('Component Rendering', () => {
    it('should render product with basic information', () => {
      const product = createMockProduct()
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      expect(screen.getByTestId('wizard-step')).toBeInTheDocument()
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
      expect(screen.getByTestId('sub-menu-header')).toBeInTheDocument()
      expect(screen.getByText('Test Vendor')).toBeInTheDocument()
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })

    it('should render 404 when product not found', () => {
      mockFindProductTreeBranchWithParents.mockReturnValue(null)

      render(<Product />)

      expect(screen.getByText('404 not found')).toBeInTheDocument()
    })

    it('should show untitled vendor when parent name is empty', () => {
      const product = createMockProduct({
        parent: {
          id: 'vendor-1',
          category: 'vendor' as const,
          name: '',
          description: '',
          subBranches: [],
          parent: null,
        },
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      expect(screen.getByText('Untitled Vendor')).toBeInTheDocument()
    })

    it('should show untitled product when product name is empty', () => {
      const product = createMockProduct({ name: '' })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      expect(screen.getAllByText('Untitled Product')).toHaveLength(2) // breadcrumb + title
    })
  })

  describe('WizardStep Integration', () => {
    it('should render WizardStep with correct props', () => {
      render(<Product />)

      const wizardStep = screen.getByTestId('wizard-step')
      expect(wizardStep).toHaveAttribute('data-progress', '2')
      expect(wizardStep).toHaveAttribute('data-no-content-wrapper', 'true')
    })
  })

  describe('SubMenuHeader Integration', () => {
    it('should render SubMenuHeader with product title', () => {
      const product = createMockProduct({ name: 'Test Product' })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      expect(screen.getByTestId('title')).toHaveTextContent(
        'Product Test Product',
      )
      expect(screen.getByTestId('back-link')).toHaveAttribute(
        'data-href',
        '/products/management',
      )
      expect(screen.getByTestId('action-button')).toHaveTextContent(
        'Add Version',
      )
    })

    it('should show untitled product name when product has no name', () => {
      const product = createMockProduct({ name: '' })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      expect(screen.getByTestId('title')).toHaveTextContent('Untitled Product')
    })

    it('should handle add version action', async () => {
      render(<Product />)

      const actionButton = screen.getByTestId('action-button')
      fireEvent.click(actionButton)

      expect(mockOnOpen).toHaveBeenCalled()
    })
  })

  describe('Modal and PTBCreateEditForm', () => {
    it('should render modal when isOpen is true', () => {
      mockUseDisclosure.mockReturnValue({
        isOpen: true,
        onOpen: mockOnOpen,
        onOpenChange: mockOnOpenChange,
      })

      render(<Product />)

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByTestId('ptb-create-edit-form')).toBeInTheDocument()
    })

    it('should pass correct props to PTBCreateEditForm', () => {
      mockUseDisclosure.mockReturnValue({
        isOpen: true,
        onOpen: mockOnOpen,
        onOpenChange: mockOnOpenChange,
      })

      render(<Product />)

      const form = screen.getByTestId('ptb-create-edit-form')
      expect(form).toHaveAttribute('data-category', 'product_version')
    })

    it('should handle modal close and reset editing PTB', () => {
      mockUseDisclosure.mockReturnValue({
        isOpen: true,
        onOpen: mockOnOpen,
        onOpenChange: mockOnOpenChange,
      })

      render(<Product />)

      const modal = screen.getByTestId('modal')
      fireEvent.click(modal)

      expect(mockOnOpenChange).toHaveBeenCalled()
    })
  })

  describe('Version Management', () => {
    it('should display version count', () => {
      const product = createMockProduct({
        subBranches: [
          createMockVersion('v1', 'Version 1'),
          createMockVersion('v2', 'Version 2'),
        ],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      expect(screen.getByText('2 versions (2)')).toBeInTheDocument()
    })

    it('should show empty state when no versions exist', () => {
      const product = createMockProduct({ subBranches: [] })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      expect(screen.getByText('No versions available')).toBeInTheDocument()
    })

    it('should render InfoCard for each version', () => {
      const product = createMockProduct({
        subBranches: [
          createMockVersion('v1', 'Version 1'),
          createMockVersion('v2', 'Version 2'),
        ],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      const infoCards = screen.getAllByTestId('info-card')
      expect(infoCards).toHaveLength(2)
      expect(screen.getByText('Version 1')).toBeInTheDocument()
      expect(screen.getByText('Version 2')).toBeInTheDocument()
    })
  })

  describe('InfoCard Interactions', () => {
    beforeEach(() => {
      const product = createMockProduct({
        subBranches: [createMockVersion('v1', 'Version 1')],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)
    })

    it('should handle edit version', async () => {
      mockUseDisclosure.mockReturnValue({
        isOpen: false,
        onOpen: mockOnOpen,
        onOpenChange: mockOnOpenChange,
      })

      render(<Product />)

      const editButton = screen.getByTestId('edit-button')
      fireEvent.click(editButton)

      expect(mockOnOpen).toHaveBeenCalled()
    })

    it('should handle delete version', () => {
      render(<Product />)

      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)

      expect(mockDeletePTB).toHaveBeenCalledWith('v1')
    })
  })

  describe('Document Type Dependent Rendering', () => {
    it('should show link and icon button for non-Software document types', () => {
      mockUseDocumentStore.mockImplementation((selector) => {
        const mockStore = { sosDocumentType: 'Hardware' }
        return selector(mockStore)
      })

      const product = createMockProduct({
        subBranches: [createMockVersion('v1', 'Version 1')],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      const infoCard = screen.getByTestId('info-card')
      expect(infoCard).toHaveAttribute(
        'data-link-to',
        '/products/management/version/v1',
      )
      expect(screen.getByTestId('end-content')).toBeInTheDocument()
      expect(screen.getByTestId('icon-button')).toBeInTheDocument()
    })

    it('should not show link and icon button for Software document type', () => {
      mockUseDocumentStore.mockImplementation((selector) => {
        const mockStore = { sosDocumentType: 'Software' }
        return selector(mockStore)
      })

      const product = createMockProduct({
        subBranches: [createMockVersion('v1', 'Version 1')],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      const infoCard = screen.getByTestId('info-card')
      expect(infoCard).not.toHaveAttribute('data-link-to')
      expect(screen.queryByTestId('end-content')).not.toBeInTheDocument()
    })

    it('should handle icon button navigation', () => {
      mockUseDocumentStore.mockImplementation((selector) => {
        const mockStore = { sosDocumentType: 'Hardware' }
        return selector(mockStore)
      })

      const product = createMockProduct({
        subBranches: [createMockVersion('v1', 'Version 1')],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      const iconButton = screen.getByTestId('icon-button')
      fireEvent.click(iconButton)

      expect(mockNavigate).toHaveBeenCalledWith(
        '/products/management/version/v1',
      )
    })
  })

  describe('PTB Save Operations', () => {
    beforeEach(() => {
      mockUseDisclosure.mockReturnValue({
        isOpen: true,
        onOpen: mockOnOpen,
        onOpenChange: mockOnOpenChange,
      })
    })

    it('should handle updating existing PTB', () => {
      render(<Product />)

      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)

      expect(mockUpdatePTB).toHaveBeenCalledWith({
        id: 'new-id',
        name: 'Test Version',
        category: 'product_version',
        description: '',
        subBranches: [],
      })
    })

    it('should handle creating new version with Software product type', () => {
      const product = createMockProduct({
        type: 'Software',
        subBranches: [],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)
      mockUpdatePTB.mockReturnValue([
        {
          id: 'vendor-1',
          subBranches: [
            {
              id: 'other-product',
              subBranches: [{ id: 'other-version-1' }],
            },
          ],
        },
      ])

      render(<Product />)

      const saveNewButton = screen.getByTestId('save-new-button')
      fireEvent.click(saveNewButton)

      expect(mockUpdatePTB).toHaveBeenCalled()
      expect(mockOnOpen).toHaveBeenCalled()
    })

    it('should handle creating new version with Hardware product type', () => {
      const product = createMockProduct({
        type: 'Hardware',
        subBranches: [],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)
      mockUpdatePTB.mockReturnValue([
        {
          id: 'vendor-1',
          subBranches: [
            {
              id: 'other-product',
              subBranches: [{ id: 'other-version-1' }],
            },
          ],
        },
      ])

      render(<Product />)

      const saveNewButton = screen.getByTestId('save-new-button')
      fireEvent.click(saveNewButton)

      expect(mockUpdatePTB).toHaveBeenCalled()
      expect(mockAddOrUpdateRelationship).toHaveBeenCalled()
    })

    it('should not create relationships for unsupported product types', () => {
      const product = createMockProduct({
        type: undefined,
        subBranches: [],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      const saveNewButton = screen.getByTestId('save-new-button')
      fireEvent.click(saveNewButton)

      expect(mockAddOrUpdateRelationship).not.toHaveBeenCalled()
    })

    it('should skip relationship creation when source and target are the same', () => {
      const product = createMockProduct({
        id: 'product-1',
        type: 'Software',
        subBranches: [],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)
      mockUpdatePTB.mockReturnValue([
        {
          id: 'vendor-1',
          subBranches: [
            {
              id: 'product-1', // Same as current product
              subBranches: [{ id: 'version-1' }],
            },
          ],
        },
      ])

      render(<Product />)

      const saveNewButton = screen.getByTestId('save-new-button')
      fireEvent.click(saveNewButton)

      expect(mockAddOrUpdateRelationship).not.toHaveBeenCalled()
    })

    it('should not create relationships when versions are empty', () => {
      const product = createMockProduct({
        type: 'Software',
        subBranches: [],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)
      mockUpdatePTB.mockReturnValue([
        {
          id: 'vendor-1',
          subBranches: [
            {
              id: 'other-product',
              subBranches: [], // No versions
            },
          ],
        },
      ])

      render(<Product />)

      const saveNewButton = screen.getByTestId('save-new-button')
      fireEvent.click(saveNewButton)

      expect(mockAddOrUpdateRelationship).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing productId parameter', () => {
      mockUseParams.mockReturnValue({})
      mockFindProductTreeBranchWithParents.mockReturnValue(createMockProduct())

      render(<Product />)

      expect(mockFindProductTreeBranchWithParents).toHaveBeenCalledWith('')
    })

    it('should handle product with no parent', () => {
      const product = createMockProduct({ parent: null })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      expect(screen.getByTestId('wizard-step')).toBeInTheDocument()
    })

    it('should handle empty version name fallback', () => {
      mockGetPTBName.mockReturnValue({ name: null })

      const product = createMockProduct({
        subBranches: [createMockVersion('v1', '')],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)

      render(<Product />)

      expect(screen.getByText('Untitled Version')).toBeInTheDocument()
    })
  })

  describe('Complex Relationship Logic', () => {
    beforeEach(() => {
      mockUseDisclosure.mockReturnValue({
        isOpen: true,
        onOpen: mockOnOpen,
        onOpenChange: mockOnOpenChange,
      })
    })

    it('should create correct relationships for Software products', () => {
      const product = createMockProduct({
        id: 'software-product',
        type: 'Software',
        subBranches: [],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)
      mockUpdatePTB.mockReturnValue([
        {
          id: 'vendor-1',
          subBranches: [
            {
              id: 'hardware-product',
              type: 'Hardware',
              subBranches: [{ id: 'hw-version-1' }, { id: 'hw-version-2' }],
            },
          ],
        },
      ])

      render(<Product />)

      const saveNewButton = screen.getByTestId('save-new-button')
      fireEvent.click(saveNewButton)

      expect(mockAddOrUpdateRelationship).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'installed_on',
          productId1: 'software-product', // Software is source
          productId2: 'hardware-product', // Hardware is target
          relationships: [
            expect.objectContaining({
              product1VersionId: 'default-id', // New version ID
              product2VersionId: 'hw-version-1',
            }),
            expect.objectContaining({
              product1VersionId: 'default-id', // New version ID
              product2VersionId: 'hw-version-2',
            }),
          ],
        }),
      )
    })

    it('should create correct relationships for Hardware products', () => {
      const product = createMockProduct({
        id: 'hardware-product',
        type: 'Hardware',
        subBranches: [],
      })
      mockFindProductTreeBranchWithParents.mockReturnValue(product)
      mockUpdatePTB.mockReturnValue([
        {
          id: 'vendor-1',
          subBranches: [
            {
              id: 'software-product',
              type: 'Software',
              subBranches: [{ id: 'sw-version-1' }, { id: 'sw-version-2' }],
            },
          ],
        },
      ])

      render(<Product />)

      const saveNewButton = screen.getByTestId('save-new-button')
      fireEvent.click(saveNewButton)

      expect(mockAddOrUpdateRelationship).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'installed_on',
          productId1: 'software-product', // Software is still source
          productId2: 'hardware-product', // Hardware is still target
          relationships: [
            expect.objectContaining({
              product1VersionId: 'sw-version-1',
              product2VersionId: 'default-id', // New version ID
            }),
            expect.objectContaining({
              product1VersionId: 'sw-version-2',
              product2VersionId: 'default-id', // New version ID
            }),
          ],
        }),
      )
    })
  })
})
