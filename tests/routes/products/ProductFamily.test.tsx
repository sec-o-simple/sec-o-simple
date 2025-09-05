import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock all dependencies BEFORE importing the component
vi.mock('@/components/forms/AddItemButton', () => ({
  default: ({ label, onPress, ...props }: any) => (
    <button data-testid="add-item-button" onClick={onPress} {...props}>
      {label}
    </button>
  ),
}))

vi.mock('@/components/WizardStep', () => ({
  default: ({ children, title, subtitle }: any) => (
    <div data-testid="wizard-step" data-title={title} data-subtitle={subtitle}>
      {children}
    </div>
  ),
}))

vi.mock('@/utils/useDocumentStoreUpdater', () => ({
  default: vi.fn(),
}))

const mockListState = {
  data: [],
  setData: vi.fn(),
  addDataEntry: vi.fn(() => ({ id: 'new-id', name: '' })),
  updateDataEntry: vi.fn(),
  removeDataEntry: vi.fn(),
}

vi.mock('@/utils/useListState', () => ({
  useListState: vi.fn(() => mockListState),
}))

const mockFamilies = [
  { id: 'family1', name: 'Root Family', parent: null },
  { id: 'family2', name: 'Child Family', parent: null },
]

vi.mock('@/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: vi.fn(() => ({
    updateFamily: vi.fn(),
    deleteFamily: vi.fn(),
    families: mockFamilies,
    addProductFamily: vi.fn(),
  })),
}))

vi.mock('@/utils/validation/usePageVisit', () => ({
  default: vi.fn(),
}))

const mockDisclosure = {
  isOpen: false,
  onOpen: vi.fn(),
  onOpenChange: vi.fn(),
}

vi.mock('@heroui/modal', () => ({
  Modal: ({ children, isOpen }: any) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
  useDisclosure: vi.fn(() => mockDisclosure),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'nav.productManagement.productFamilies')
        return 'Product Families'
      if (key === 'nav.productManagement.productFamiliesSubtitle')
        return 'Manage product families'
      if (key === 'common.add') return `Add ${options?.label || 'Item'}`
      return key
    },
  }),
}))

vi.mock('../../../src/routes/products/components/InfoCard', () => ({
  default: ({ title, onEdit, onDelete }: any) => (
    <div data-testid="info-card">
      <span>{title}</span>
      <button data-testid="edit-button" onClick={onEdit}>
        Edit
      </button>
      <button data-testid="delete-button" onClick={onDelete}>
        Delete
      </button>
    </div>
  ),
}))

vi.mock('../../../src/routes/products/components/PFEditForm', () => ({
  PFCreateEditForm: ({ onSave }: any) => (
    <div data-testid="pf-form">
      <button
        data-testid="save-button"
        onClick={() => onSave({ id: '', name: 'Test' })}
      >
        Save
      </button>
    </div>
  ),
}))

// Import after mocks
import ProductFamily, {
  getFamilyChain,
  getFamilyChainString,
  ProductFamilyChains,
} from '../../../src/routes/products/ProductFamily'
import type { TProductFamily } from '../../../src/routes/products/types/tProductTreeBranch'

describe('ProductFamily Utility Functions', () => {
  describe('getFamilyChain', () => {
    it('should return single item array for root family', () => {
      const rootFamily: TProductFamily = {
        id: 'root',
        name: 'Root Family',
        parent: null,
      }

      const chain = getFamilyChain(rootFamily)
      expect(chain).toEqual([rootFamily])
      expect(chain).toHaveLength(1)
    })

    it('should return full chain for nested family', () => {
      const rootFamily: TProductFamily = {
        id: 'root',
        name: 'Root Family',
        parent: null,
      }

      const childFamily: TProductFamily = {
        id: 'child',
        name: 'Child Family',
        parent: rootFamily,
      }

      const chain = getFamilyChain(childFamily)
      expect(chain).toEqual([rootFamily, childFamily])
    })
  })

  describe('getFamilyChainString', () => {
    it('should return single name for root family', () => {
      const rootFamily: TProductFamily = {
        id: 'root',
        name: 'Root Family',
        parent: null,
      }

      const chainString = getFamilyChainString(rootFamily)
      expect(chainString).toBe('Root Family')
    })

    it('should join names with separator', () => {
      const rootFamily: TProductFamily = {
        id: 'root',
        name: 'Root Family',
        parent: null,
      }

      const childFamily: TProductFamily = {
        id: 'child',
        name: 'Child Family',
        parent: rootFamily,
      }

      const chainString = getFamilyChainString(childFamily)
      expect(chainString).toBe('Root Family / Child Family')
    })
  })
})

describe('ProductFamilyChains Component', () => {
  it('should render item name', () => {
    const item: TProductFamily = {
      id: 'test',
      name: 'Test Family',
      parent: null,
    }

    render(<ProductFamilyChains item={item} />)
    expect(screen.getByText('Test Family')).toBeInTheDocument()
  })

  it('should render parent chain', () => {
    const rootFamily: TProductFamily = {
      id: 'root',
      name: 'Root Family',
      parent: null,
    }

    const childFamily: TProductFamily = {
      id: 'child',
      name: 'Child Family',
      parent: rootFamily,
    }

    render(<ProductFamilyChains item={childFamily} />)

    expect(screen.getByText('Root Family /')).toBeInTheDocument()
    expect(screen.getByText('Child Family')).toBeInTheDocument()
  })
})

describe('ProductFamily Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDisclosure.isOpen = false
  })

  it('should render wizard step with correct title', () => {
    render(<ProductFamily />)

    const wizardStep = screen.getByTestId('wizard-step')
    expect(wizardStep).toHaveAttribute('data-title', 'Product Families')
    expect(wizardStep).toHaveAttribute(
      'data-subtitle',
      'Manage product families',
    )
  })

  it('should render family cards', () => {
    render(<ProductFamily />)

    const infoCards = screen.getAllByTestId('info-card')
    expect(infoCards).toHaveLength(2)
    expect(screen.getByText('Root Family')).toBeInTheDocument()
    expect(screen.getByText('Child Family')).toBeInTheDocument()
  })

  it('should handle edit button click', async () => {
    render(<ProductFamily />)

    const editButtons = screen.getAllByTestId('edit-button')
    const user = userEvent.setup()

    await user.click(editButtons[0])
    expect(mockDisclosure.onOpen).toHaveBeenCalled()
  })

  it('should handle delete button click', async () => {
    render(<ProductFamily />)

    const deleteButtons = screen.getAllByTestId('delete-button')
    const user = userEvent.setup()

    await user.click(deleteButtons[0])
    expect(mockListState.removeDataEntry).toHaveBeenCalled()
  })

  it('should handle add button click', async () => {
    render(<ProductFamily />)

    const addButton = screen.getByTestId('add-item-button')
    const user = userEvent.setup()

    await user.click(addButton)
    expect(mockDisclosure.onOpen).toHaveBeenCalled()
  })

  it('should render modal when open', () => {
    mockDisclosure.isOpen = true

    render(<ProductFamily />)
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('should handle form save', async () => {
    mockDisclosure.isOpen = true

    render(<ProductFamily />)

    const saveButton = screen.getByTestId('save-button')
    const user = userEvent.setup()

    await user.click(saveButton)
    expect(mockListState.addDataEntry).toHaveBeenCalled()
  })
})
