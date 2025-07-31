import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Version from '../../../src/routes/products/Version'
import type { TProductTreeBranchWithParents } from '../../../src/routes/products/types/tProductTreeBranch'
import type { TRelationship } from '../../../src/routes/products/types/tRelationship'

// Mock react-router
const mockUseParams = vi.fn()

vi.mock('react-router', () => ({
  useParams: () => mockUseParams(),
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key: string, options?: any) => {
      const translations: Record<string, string> = {
        'untitled.vendor': 'Untitled Vendor',
        'untitled.product_name': 'Untitled Product',
        'untitled.product_version': 'Untitled Version',
        'products.product.version.label': 'Version',
        'common.add': `Add ${options?.label || 'Item'}`,
        'products.relationship.label': 'Relationship',
        'products.relationship.empty': 'No relationships found',
        'products.relationship.categories.installed_on': 'Installed On',
        'products.relationship.categories.default_component_of': 'Default Component Of',
        'products.relationship.categories.external_component_of': 'External Component Of',
        'products.relationship.categories.installed_with': 'Installed With',
        'products.relationship.categories.optional_component_of': 'Optional Component Of',
      }
      return translations[key] || key
    }),
  }),
}))

// Mock custom hooks
const mockFindProductTreeBranch = vi.fn()
const mockFindProductTreeBranchWithParents = vi.fn()
const mockGetRelationshipsBySourceVersion = vi.fn()
const mockSortRelationshipsByCategory = vi.fn()
const mockAddOrUpdateRelationship = vi.fn()
const mockDeleteRelationship = vi.fn()
const mockUseDocumentStore = vi.fn()

vi.mock('../../../src/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: () => ({
    findProductTreeBranch: mockFindProductTreeBranch,
    findProductTreeBranchWithParents: mockFindProductTreeBranchWithParents,
  }),
}))

vi.mock('../../../src/utils/useRelationships', () => ({
  useRelationships: () => ({
    getRelationshipsBySourceVersion: mockGetRelationshipsBySourceVersion,
    sortRelationshipsByCategory: mockSortRelationshipsByCategory,
    addOrUpdateRelationship: mockAddOrUpdateRelationship,
    deleteRelationship: mockDeleteRelationship,
  }),
}))

vi.mock('../../../src/utils/useDocumentStore', () => ({
  default: (selector: any) => mockUseDocumentStore(selector),
}))

// Mock HeroUI components
const mockOnOpen = vi.fn()
const mockOnOpenChange = vi.fn()
const mockUseDisclosure = vi.fn()

vi.mock('@heroui/modal', () => ({
  Modal: ({ children, isOpen, onOpenChange, size, isDismissable }: any) => 
    isOpen ? (
      <div 
        data-testid="modal" 
        data-size={size}
        data-is-dismissable={isDismissable}
        onClick={() => onOpenChange(false)}
      >
        {children}
      </div>
    ) : null,
  useDisclosure: () => mockUseDisclosure(),
}))

vi.mock('@heroui/accordion', () => ({
  Accordion: ({ children, variant, selectionMode, defaultSelectedKeys, className, itemClasses }: any) => (
    <div 
      data-testid="accordion"
      data-variant={variant}
      data-selection-mode={selectionMode}
      data-default-selected-keys={defaultSelectedKeys}
      className={className}
      data-item-classes={JSON.stringify(itemClasses)}
    >
      {children}
    </div>
  ),
  AccordionItem: ({ children, title, className, key, ...props }: any) => (
    <div 
      data-testid="accordion-item"
      data-key={key}
      className={className}
      {...props}
    >
      <div data-testid="accordion-title">{title}</div>
      <div data-testid="accordion-content">{children}</div>
    </div>
  ),
}))

vi.mock('@heroui/chip', () => ({
  Chip: ({ children, color, variant, radius, size }: any) => (
    <div 
      data-testid="chip"
      data-color={color}
      data-variant={variant}
      data-radius={radius}
      data-size={size}
    >
      {children}
    </div>
  ),
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

vi.mock('../../../src/components/forms/VSplit', () => ({
  default: ({ children }: any) => (
    <div data-testid="vsplit">{children}</div>
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
  default: ({ title, variant, onEdit, onDelete, startContent, children }: any) => (
    <div 
      data-testid="info-card" 
      data-variant={variant}
    >
      <div data-testid="info-card-title">{title}</div>
      {startContent && <div data-testid="start-content">{startContent}</div>}
      <button data-testid="edit-button" onClick={onEdit}>Edit</button>
      <button data-testid="delete-button" onClick={onDelete}>Delete</button>
      <div data-testid="info-card-content">{children}</div>
    </div>
  ),
}))

vi.mock('../../../src/routes/products/components/RelationshipEditForm', () => ({
  default: ({ relationship, onSave }: any) => (
    <div data-testid="relationship-edit-form">
      <div data-testid="relationship-data">{JSON.stringify(relationship)}</div>
      <button 
        data-testid="save-relationship-button" 
        onClick={() => onSave(relationship)}
      >
        Save Relationship
      </button>
    </div>
  ),
}))

vi.mock('../../../src/routes/products/components/SubMenuHeader', () => ({
  default: ({ title, backLink, actionTitle, onAction }: any) => (
    <div data-testid="sub-menu-header">
      <div data-testid="title">{title}</div>
      <div data-testid="back-link" data-href={backLink}>Back</div>
      {actionTitle && (
        <button data-testid="action-button" onClick={onAction}>
          {actionTitle}
        </button>
      )}
    </div>
  ),
}))

vi.mock('../../../src/routes/products/components/TagList', () => ({
  default: ({ items, linkGenerator, labelGenerator }: any) => (
    <div data-testid="tag-list">
      {items.map((item: string, index: number) => (
        <div 
          key={index}
          data-testid="tag-item"
          data-link={linkGenerator ? linkGenerator(item) : ''}
          data-label={labelGenerator ? labelGenerator(item) : item}
        >
          {labelGenerator ? labelGenerator(item) : item}
        </div>
      ))}
    </div>
  ),
}))

// Mock utility functions
vi.mock('../../../src/routes/products/types/tProductTreeBranch', () => ({
  getPTBName: vi.fn((ptb: any) => ptb?.name || 'Test Name'),
}))

vi.mock('../../../src/routes/products/types/tRelationship', () => ({
  getDefaultRelationship: vi.fn(() => ({
    id: 'new-relationship-id',
    category: 'installed_on',
    productId1: '',
    productId2: '',
    product1VersionIds: [],
    product2VersionIds: [],
    name: '',
  })),
}))

describe('Version', () => {
  const mockProductVersion: TProductTreeBranchWithParents = {
    id: 'version-1',
    category: 'product_version',
    name: 'Version 1.0',
    description: 'Test version',
    subBranches: [],
    type: 'Software',
    parent: {
      id: 'product-1',
      category: 'product_name',
      name: 'Test Product',
      description: 'Test product description',
      subBranches: [],
      parent: {
        id: 'vendor-1',
        category: 'vendor',
        name: 'Test Vendor',
        description: 'Test vendor description',
        subBranches: [],
        parent: null,
      }
    }
  }

  const mockRelationship: TRelationship = {
    id: 'rel-1',
    category: 'installed_on',
    productId1: 'product-1',
    productId2: 'product-2',
    product1VersionIds: ['version-1'],
    product2VersionIds: ['version-2'],
    name: 'Test Relationship',
  }

  const mockRelatedProduct = {
    id: 'product-2',
    category: 'product_name',
    name: 'Related Product',
    description: 'Related product description',
    subBranches: [],
    type: 'Hardware',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock returns
    mockUseParams.mockReturnValue({ productVersionId: 'version-1' })
    mockFindProductTreeBranchWithParents.mockReturnValue(mockProductVersion)
    mockGetRelationshipsBySourceVersion.mockReturnValue([mockRelationship])
    mockSortRelationshipsByCategory.mockReturnValue({
      installed_on: [mockRelationship]
    })
    mockFindProductTreeBranch.mockReturnValue(mockRelatedProduct)
    mockUseDocumentStore.mockReturnValue('CSAF')
    mockUseDisclosure.mockReturnValue({
      isOpen: false,
      onOpen: mockOnOpen,
      onOpenChange: mockOnOpenChange,
    })
  })

  describe('Component Rendering', () => {
    it('should render the wizard step with correct props', () => {
      render(<Version />)

      expect(screen.getByTestId('wizard-step')).toBeInTheDocument()
      expect(screen.getByTestId('wizard-step')).toHaveAttribute('data-progress', '2')
      expect(screen.getByTestId('wizard-step')).toHaveAttribute('data-no-content-wrapper', 'true')
    })

    it('should render breadcrumbs with correct hierarchy', () => {
      render(<Version />)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
      
      const breadcrumbItems = screen.getAllByTestId('breadcrumb-item')
      expect(breadcrumbItems).toHaveLength(3)
      
      // Vendor breadcrumb
      expect(breadcrumbItems[0]).toHaveAttribute('data-href', '/#/product-management')
      expect(breadcrumbItems[0]).toHaveTextContent('Test Vendor')
      
      // Product breadcrumb
      expect(breadcrumbItems[1]).toHaveAttribute('data-href', '/#/product-management/product/product-1')
      expect(breadcrumbItems[1]).toHaveTextContent('Test Product')
      
      // Version breadcrumb
      expect(breadcrumbItems[2]).toHaveTextContent('Version 1.0')
    })

    it('should render untitled labels when names are empty', () => {
      const emptyNamesProduct = {
        ...mockProductVersion,
        name: '',
        parent: {
          ...mockProductVersion.parent!,
          name: '',
          parent: {
            ...mockProductVersion.parent!.parent!,
            name: '',
            parent: null,
          }
        }
      }
      mockFindProductTreeBranchWithParents.mockReturnValue(emptyNamesProduct)

      render(<Version />)

      const breadcrumbItems = screen.getAllByTestId('breadcrumb-item')
      expect(breadcrumbItems[0]).toHaveTextContent('Untitled Vendor')
      expect(breadcrumbItems[1]).toHaveTextContent('Untitled Product')
      expect(breadcrumbItems[2]).toHaveTextContent('Untitled Version')
    })

    it('should render SubMenuHeader with correct props', () => {
      render(<Version />)

      const subMenuHeader = screen.getByTestId('sub-menu-header')
      expect(subMenuHeader).toBeInTheDocument()
      
      const title = screen.getByTestId('title')
      expect(title).toHaveTextContent('Version Version 1.0')
      
      const backLink = screen.getByTestId('back-link')
      expect(backLink).toHaveAttribute('data-href', '/product-management/product/product-1')
    })

    it('should render action button for non-Software document types', () => {
      render(<Version />)

      expect(screen.getByTestId('action-button')).toBeInTheDocument()
      expect(screen.getByTestId('action-button')).toHaveTextContent('Add Relationship')
    })

    it('should not render action button for Software document type', () => {
      mockUseDocumentStore.mockReturnValue('Software')

      render(<Version />)

      expect(screen.queryByTestId('action-button')).not.toBeInTheDocument()
    })

    it('should render modal when isOpen is true', () => {
      mockUseDisclosure.mockReturnValue({
        isOpen: true,
        onOpen: mockOnOpen,
        onOpenChange: mockOnOpenChange,
      })

      render(<Version />)

      const modal = screen.getByTestId('modal')
      expect(modal).toBeInTheDocument()
      expect(modal).toHaveAttribute('data-size', '3xl')
      expect(modal).toHaveAttribute('data-is-dismissable', 'false')
      expect(screen.getByTestId('relationship-edit-form')).toBeInTheDocument()
    })
  })

  describe('Product Not Found', () => {
    it('should render 404 when product version is not found', () => {
      mockFindProductTreeBranchWithParents.mockReturnValue(null)

      render(<Version />)

      expect(screen.getByText('404 not found')).toBeInTheDocument()
      expect(screen.queryByTestId('wizard-step')).not.toBeInTheDocument()
    })
  })

  describe('Relationships Display', () => {
    it('should display relationships accordion when relationships exist', () => {
      render(<Version />)

      expect(screen.getByTestId('accordion')).toBeInTheDocument()
      expect(screen.getByTestId('accordion')).toHaveAttribute('data-variant', 'splitted')
      expect(screen.getByTestId('accordion')).toHaveAttribute('data-selection-mode', 'multiple')
      expect(screen.getByTestId('accordion')).toHaveAttribute('data-default-selected-keys', 'all')

      const accordionItem = screen.getByTestId('accordion-item')
      expect(accordionItem).toBeInTheDocument()
      expect(screen.getByTestId('accordion-title')).toHaveTextContent('Installed On')
    })

    it('should display empty message when no relationships exist', () => {
      mockGetRelationshipsBySourceVersion.mockReturnValue([])
      mockSortRelationshipsByCategory.mockReturnValue({})

      render(<Version />)

      expect(screen.getByText('No relationships found')).toBeInTheDocument()
      expect(screen.queryByTestId('accordion-item')).not.toBeInTheDocument()
    })

    it('should render InfoCard for each relationship with correct props', () => {
      render(<Version />)

      const infoCard = screen.getByTestId('info-card')
      expect(infoCard).toBeInTheDocument()
      expect(infoCard).toHaveAttribute('data-variant', 'boxed')
      
      expect(screen.getByTestId('info-card-title')).toHaveTextContent('Related Product')
      expect(screen.getByTestId('edit-button')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button')).toBeInTheDocument()
      
      // Check chip in start content
      const chip = screen.getByTestId('chip')
      expect(chip).toBeInTheDocument()
      expect(chip).toHaveAttribute('data-color', 'primary')
      expect(chip).toHaveAttribute('data-variant', 'flat')
      expect(chip).toHaveTextContent('Hardware')
    })

    it('should render TagList when product2VersionIds exist', () => {
      render(<Version />)

      expect(screen.getByTestId('tag-list')).toBeInTheDocument()
      const tagItems = screen.getAllByTestId('tag-item')
      expect(tagItems).toHaveLength(1)
      expect(tagItems[0]).toHaveAttribute('data-link', '/product-management/version/version-2')
    })

    it('should not render InfoCard when related product is not found', () => {
      mockFindProductTreeBranch.mockReturnValue(null)

      render(<Version />)

      expect(screen.queryByTestId('info-card')).not.toBeInTheDocument()
    })

    it('should display untitled product name when related product name is empty', () => {
      mockFindProductTreeBranch.mockReturnValue({
        ...mockRelatedProduct,
        name: '',
      })

      render(<Version />)

      expect(screen.getByTestId('info-card-title')).toHaveTextContent('Untitled Product')
    })
  })

  describe('Modal Interactions', () => {
    it('should open modal when action button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<Version />)

      const actionButton = screen.getByTestId('action-button')
      await user.click(actionButton)

      expect(mockOnOpen).toHaveBeenCalled()
    })

    it('should set editing relationship when action button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<Version />)

      const actionButton = screen.getByTestId('action-button')
      await user.click(actionButton)

      // Check that getDefaultRelationship was called
      const { getDefaultRelationship } = await import('../../../src/routes/products/types/tRelationship')
      expect(vi.mocked(getDefaultRelationship)).toHaveBeenCalled()
    })

    it('should open modal when edit button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<Version />)

      const editButton = screen.getByTestId('edit-button')
      await user.click(editButton)

      expect(mockOnOpen).toHaveBeenCalled()
    })

    it('should call deleteRelationship when delete button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<Version />)

      const deleteButton = screen.getByTestId('delete-button')
      await user.click(deleteButton)

      expect(mockDeleteRelationship).toHaveBeenCalledWith(mockRelationship)
    })

    it('should call addOrUpdateRelationship when relationship form is saved', async () => {
      const user = userEvent.setup()
      mockUseDisclosure.mockReturnValue({
        isOpen: true,
        onOpen: mockOnOpen,
        onOpenChange: mockOnOpenChange,
      })

      render(<Version />)

      const saveButton = screen.getByTestId('save-relationship-button')
      await user.click(saveButton)

      expect(mockAddOrUpdateRelationship).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing parent product gracefully', () => {
      const versionWithoutParent = {
        ...mockProductVersion,
        parent: undefined,
      }
      mockFindProductTreeBranchWithParents.mockReturnValue(versionWithoutParent)

      render(<Version />)

      const backLink = screen.getByTestId('back-link')
      expect(backLink).toHaveAttribute('data-href', '/product-management')
    })

    it('should handle version without name in title', () => {
      const versionWithoutName = {
        ...mockProductVersion,
        name: '',
      }
      mockFindProductTreeBranchWithParents.mockReturnValue(versionWithoutName)

      render(<Version />)

      const title = screen.getByTestId('title')
      expect(title).toHaveTextContent('Untitled Version')
    })

    it('should handle multiple relationship categories', () => {
      const multipleRelationships = [
        mockRelationship,
        {
          ...mockRelationship,
          id: 'rel-2',
          category: 'default_component_of' as const,
        }
      ]
      
      mockGetRelationshipsBySourceVersion.mockReturnValue(multipleRelationships)
      mockSortRelationshipsByCategory.mockReturnValue({
        installed_on: [mockRelationship],
        default_component_of: [multipleRelationships[1]]
      })

      render(<Version />)

      const accordionItems = screen.getAllByTestId('accordion-item')
      expect(accordionItems).toHaveLength(2)
      
      const titles = screen.getAllByTestId('accordion-title')
      expect(titles[0]).toHaveTextContent('Installed On')
      expect(titles[1]).toHaveTextContent('Default Component Of')
    })

    it('should handle relationships without product2VersionIds', () => {
      const relationshipWithoutVersions = {
        ...mockRelationship,
        product2VersionIds: [],
      }
      
      mockGetRelationshipsBySourceVersion.mockReturnValue([relationshipWithoutVersions])
      mockSortRelationshipsByCategory.mockReturnValue({
        installed_on: [relationshipWithoutVersions]
      })

      render(<Version />)

      expect(screen.queryByTestId('tag-list')).not.toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should pass correct props to all child components', () => {
      render(<Version />)

      // Check WizardStep props
      const wizardStep = screen.getByTestId('wizard-step')
      expect(wizardStep).toHaveAttribute('data-progress', '2')
      expect(wizardStep).toHaveAttribute('data-no-content-wrapper', 'true')

      // Check Accordion props
      const accordion = screen.getByTestId('accordion')
      expect(accordion).toHaveClass('px-0')

      // Check VSplit is rendered
      expect(screen.getByTestId('vsplit')).toBeInTheDocument()
    })

    it('should render relationship label heading', () => {
      render(<Version />)

      const heading = screen.getByText('Relationship')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('font-bold')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label on accordion items', () => {
      render(<Version />)

      const accordionItem = screen.getByTestId('accordion-item')
      expect(accordionItem).toHaveAttribute('aria-label', 'installed_on')
    })

    it('should have proper styling classes', () => {
      // Setup empty relationships scenario for this test
      mockGetRelationshipsBySourceVersion.mockReturnValue([])
      mockSortRelationshipsByCategory.mockReturnValue({})

      render(<Version />)

      const emptyMessage = screen.getByText('No relationships found')
      expect(emptyMessage).toHaveClass('text-center text-neutral-foreground')
    })
  })
})
