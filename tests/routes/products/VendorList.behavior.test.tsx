import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TProductTreeBranch } from '../../../src/routes/products/types/tProductTreeBranch'
import VendorList from '../../../src/routes/products/VendorList'

const mockUpdatePTB = vi.fn()
const mockAddPTB = vi.fn()
const mockDeletePTB = vi.fn()
const mockGetPTBsByCategory = vi.fn()
const mockAddOrUpdateRelationship = vi.fn()
const mockSetData = vi.fn()
const mockAddDataEntry = vi.fn()
const mockUpdateDataEntry = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { label?: string }) => {
      if (key === 'common.add') return `Add ${options?.label}`
      return key
    },
  }),
}))

vi.mock('../../../src/utils/useDocumentStore', () => ({
  default: () => 'CSAF',
}))

vi.mock('../../../src/utils/useRelationships', () => ({
  useRelationships: () => ({
    addOrUpdateRelationship: mockAddOrUpdateRelationship,
  }),
}))

vi.mock('../../../src/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: () => ({
    rootBranch: [{ id: 'vendor-1' }],
    updatePTB: mockUpdatePTB,
    addPTB: mockAddPTB,
    deletePTB: mockDeletePTB,
    getPTBsByCategory: mockGetPTBsByCategory,
  }),
}))

vi.mock('../../../src/utils/useListState', () => ({
  useListState: () => ({
    data: mockGetPTBsByCategory('vendor'),
    setData: mockSetData,
    addDataEntry: mockAddDataEntry,
    updateDataEntry: mockUpdateDataEntry,
  }),
}))

vi.mock('../../../src/utils/useDocumentStoreUpdater', () => ({
  default: ({ init }: any) => init?.({}),
}))

vi.mock('uid', () => ({
  uid: () => 'relationship-id',
}))

vi.mock('../../../src/routes/products/types/tRelationship', async () => {
  const actual = await vi.importActual(
    '../../../src/routes/products/types/tRelationship',
  )

  return {
    ...(actual as object),
    getDefaultRelationship: () => ({
      category: 'default_component_of',
      relationships: [],
    }),
  }
})

vi.mock('../../../src/routes/products/types/tProductTreeBranch', async () => {
  const actual = await vi.importActual(
    '../../../src/routes/products/types/tProductTreeBranch',
  )

  return {
    ...(actual as object),
    getDefaultProductTreeBranch: (category: string) => ({
      id: `new-${category}-id`,
      category,
      name: '',
      description: '',
      subBranches: [],
      type: category === 'product_name' ? 'Software' : undefined,
    }),
  }
})

vi.mock('../../../src/components/forms/VSplit', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('../../../src/components/forms/AddItemButton', () => ({
  default: ({ onPress }: any) => (
    <button data-testid="add-product" onClick={onPress}>
      add product
    </button>
  ),
}))

vi.mock('../../../src/routes/products/components/ProductFamilyChip', () => ({
  ProductFamilyChip: () => <div />,
}))

vi.mock('../../../src/routes/products/components/ProductCard', () => ({
  default: ({ product, onEdit, onEditVersion, onAddVersion, onDeleteVersion }: any) => (
    <div data-testid={`product-${product.id}`}>
      <button data-testid={`edit-product-${product.id}`} onClick={onEdit}>
        edit product
      </button>
      <button
        data-testid={`edit-version-${product.id}`}
        onClick={() =>
          onEditVersion?.({
            id: `${product.id}-version-1`,
            category: 'product_version',
            name: 'v1',
            description: '',
            subBranches: [],
          })
        }
      >
        edit version
      </button>
      <button data-testid={`add-version-${product.id}`} onClick={() => onAddVersion?.()}>
        add version
      </button>
      <button
        data-testid={`delete-version-${product.id}`}
        onClick={() => onDeleteVersion?.({ id: `${product.id}-version-1` })}
      >
        delete version
      </button>
    </div>
  ),
}))

vi.mock('../../../src/components/forms/ComponentList', () => ({
  default: ({ listState, addEntry, customActions, content }: any) => (
    <div>
      <button data-testid="add-vendor" onClick={addEntry}>
        add vendor
      </button>
      <button
        data-testid="edit-vendor"
        onClick={() => customActions[0].onClick(listState.data[0])}
      >
        edit vendor
      </button>
      {listState.data.map((vendor: TProductTreeBranch) => (
        <div key={vendor.id}>{content(vendor)}</div>
      ))}
    </div>
  ),
}))

vi.mock('@heroui/modal', async () => {
  const React = await vi.importActual<typeof import('react')>('react')

  return {
    Modal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
      isOpen ? <div data-testid="modal">{children}</div> : null,
    useDisclosure: () => {
      const [isOpen, setIsOpen] = React.useState(false)
      return {
        isOpen,
        onOpen: () => setIsOpen(true),
        onOpenChange: () => setIsOpen((v) => !v),
      }
    },
  }
})

vi.mock('../../../src/routes/products/components/PTBEditForm', () => ({
  PTBCreateEditForm: ({ ptb, category, onSave }: any) => (
    <button
      data-testid={`save-${category}`}
      onClick={() =>
        onSave?.({
          id: ptb?.id,
          name: ptb?.name ?? `saved-${category}`,
          category,
        })
      }
    >
      save
    </button>
  ),
}))

const softwareProduct: TProductTreeBranch = {
  id: 'software-product',
  category: 'product_name',
  name: 'Software Product',
  description: '',
  type: 'Software',
  subBranches: [
    {
      id: 'software-product-v1',
      category: 'product_version',
      name: '1.0',
      description: '',
      subBranches: [],
    },
  ],
}

const hardwareProduct: TProductTreeBranch = {
  id: 'hardware-product',
  category: 'product_name',
  name: 'Hardware Product',
  description: '',
  type: 'Hardware',
  subBranches: [
    {
      id: 'hardware-product-v1',
      category: 'product_version',
      name: '1.0',
      description: '',
      subBranches: [],
    },
  ],
}

const vendor: TProductTreeBranch = {
  id: 'vendor-1',
  category: 'vendor',
  name: 'Vendor',
  description: '',
  subBranches: [softwareProduct, hardwareProduct],
}

describe('VendorList behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPTBsByCategory.mockReturnValue([vendor])
    mockAddDataEntry.mockReturnValue({
      id: 'new-vendor-entry',
      category: 'vendor',
      name: '',
      description: '',
      subBranches: [],
    })
    mockUpdatePTB.mockImplementation(() => [
      {
        ...vendor,
        subBranches: [softwareProduct, hardwareProduct],
      },
    ])
  })

  it('creates a vendor through vendor modal save', () => {
    render(<VendorList />)

    fireEvent.click(screen.getByTestId('add-vendor'))
    fireEvent.click(screen.getByTestId('save-vendor'))

    expect(mockAddPTB).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'vendor',
        name: 'saved-vendor',
      }),
    )
    expect(mockUpdateDataEntry).toHaveBeenCalled()
  })

  it('updates vendor when editing existing vendor', () => {
    render(<VendorList />)

    fireEvent.click(screen.getByTestId('edit-vendor'))
    fireEvent.click(screen.getByTestId('save-vendor'))

    expect(mockUpdatePTB).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'vendor-1' }),
    )
  })

  it('creates a product under vendor from product modal', () => {
    render(<VendorList />)

    fireEvent.click(screen.getByTestId('add-product'))
    fireEvent.click(screen.getByTestId('save-product_name'))

    expect(mockUpdateDataEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'vendor-1',
        subBranches: expect.arrayContaining([
          expect.objectContaining({
            category: 'product_name',
            name: 'saved-product_name',
          }),
        ]),
      }),
    )
  })

  it('deletes a version from product card action', () => {
    render(<VendorList />)

    fireEvent.click(screen.getByTestId('delete-version-software-product'))

    expect(mockDeletePTB).toHaveBeenCalledWith('software-product-version-1')
  })

  it('adds a new version and creates installed_on relationships', () => {
    render(<VendorList />)

    fireEvent.click(screen.getByTestId('add-version-software-product'))
    fireEvent.click(screen.getByTestId('save-product_version'))

    expect(mockUpdatePTB).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'software-product',
        subBranches: expect.arrayContaining([
          expect.objectContaining({
            category: 'product_version',
            name: 'saved-product_version',
          }),
        ]),
      }),
    )

    expect(mockAddOrUpdateRelationship).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'installed_on',
        productId1: 'software-product',
        productId2: 'hardware-product',
      }),
    )
  })
})
