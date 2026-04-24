import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductList from '../../../src/routes/products/ProductList'
import type { TProductTreeBranch } from '../../../src/routes/products/types/tProductTreeBranch'

const mockUpdatePTB = vi.fn()
const mockDeletePTB = vi.fn()
const mockGetPTBsByCategory = vi.fn()
const mockAddOrUpdateRelationship = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
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
    getPTBsByCategory: mockGetPTBsByCategory,
    updatePTB: mockUpdatePTB,
    deletePTB: mockDeletePTB,
  }),
}))

vi.mock('uid', () => ({
  uid: () => 'relationship-id',
}))

vi.mock('../../../src/routes/products/types/tProductTreeBranch', async () => {
  const actual = await vi.importActual(
    '../../../src/routes/products/types/tProductTreeBranch',
  )

  return {
    ...(actual as object),
    getDefaultProductTreeBranch: (category: string) => ({
      id: 'new-version-id',
      category,
      name: '',
      description: '',
      subBranches: [],
    }),
  }
})

vi.mock('../../../src/routes/products/components/ProductFamilyChip', () => ({
  ProductFamilyChip: () => <div data-testid="family-chip" />,
}))

vi.mock('../../../src/routes/products/components/ProductCard', () => ({
  default: ({ product, onEditVersion, onDeleteVersion, onAddVersion }: any) => (
    <div data-testid={`product-card-${product.id}`}>
      <button
        data-testid={`edit-version-${product.id}`}
        onClick={() =>
          onEditVersion?.({
            id: `${product.id}-version-1`,
            category: 'product_version',
            name: 'Existing Version',
            description: '',
            subBranches: [],
          })
        }
      >
        edit version
      </button>
      <button
        data-testid={`delete-version-${product.id}`}
        onClick={() => onDeleteVersion?.({ id: `${product.id}-version-1` })}
      >
        delete version
      </button>
      <button data-testid={`add-version-${product.id}`} onClick={() => onAddVersion?.()}>
        add version
      </button>
    </div>
  ),
}))

vi.mock('@heroui/modal', async () => {
  const React = await vi.importActual<typeof import('react')>('react')

  return {
    Modal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
      isOpen ? <div data-testid="version-modal">{children}</div> : null,
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
  PTBCreateEditForm: ({ ptb, onSave }: any) => (
    <div>
      <button data-testid="save-version" onClick={() => onSave({ ...ptb, name: ptb?.name ?? 'New Version' })}>
        save
      </button>
    </div>
  ),
}))

const softwareA: TProductTreeBranch = {
  id: 'software-a',
  category: 'product_name',
  name: 'Software A',
  description: '',
  type: 'Software',
  subBranches: [
    {
      id: 'software-a-v1',
      category: 'product_version',
      name: '1.0',
      description: '',
      subBranches: [],
    },
  ],
}

const softwareB: TProductTreeBranch = {
  id: 'software-b',
  category: 'product_name',
  name: 'Software B',
  description: '',
  type: 'Software',
  subBranches: [
    {
      id: 'software-b-v1',
      category: 'product_version',
      name: '1.0',
      description: '',
      subBranches: [],
    },
  ],
}

describe('ProductList behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPTBsByCategory.mockReturnValue([softwareA, softwareB])
    mockUpdatePTB.mockImplementation(() => [
      {
        id: 'vendor-1',
        category: 'vendor',
        name: 'Vendor',
        description: '',
        subBranches: [softwareA, softwareB],
      },
    ])
  })

  it('deletes a selected version', () => {
    render(<ProductList productType="Software" />)

    fireEvent.click(screen.getByTestId('delete-version-software-a'))

    expect(mockDeletePTB).toHaveBeenCalledWith('software-a-version-1')
  })

  it('saves an existing version through edit flow', () => {
    render(<ProductList productType="Software" />)

    fireEvent.click(screen.getByTestId('edit-version-software-a'))
    fireEvent.click(screen.getByTestId('save-version'))

    expect(mockUpdatePTB).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'software-a-version-1' }),
    )
  })

  it('adds a new version and creates installed_on relationships', () => {
    render(<ProductList productType="Software" />)

    fireEvent.click(screen.getByTestId('add-version-software-a'))
    fireEvent.click(screen.getByTestId('save-version'))

    expect(mockUpdatePTB).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'software-a',
        subBranches: expect.arrayContaining([
          expect.objectContaining({ id: 'new-version-id' }),
        ]),
      }),
    )

    expect(mockAddOrUpdateRelationship).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'installed_on',
        productId1: 'software-a',
        productId2: 'software-b',
      }),
    )
  })

  it('does not add version relationships for non Software/Hardware products', () => {
    mockGetPTBsByCategory.mockReturnValue([
      {
        ...softwareA,
        type: 'Service' as any,
      },
      softwareB,
    ])

    render(<ProductList productType={'Service' as any} />)

    fireEvent.click(screen.getByTestId('add-version-software-a'))
    fireEvent.click(screen.getByTestId('save-version'))

    expect(mockAddOrUpdateRelationship).not.toHaveBeenCalled()
  })
})
