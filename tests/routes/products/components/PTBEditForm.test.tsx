import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock @heroui/react to include Autocomplete
vi.mock('@heroui/react', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    Autocomplete: ({ children, ...props }: any) => (
      <div data-testid="autocomplete" {...props}>
        {children}
      </div>
    ),
    AutocompleteItem: ({ children, ...props }: any) => (
      <div data-testid="autocomplete-item" {...props}>
        {children}
      </div>
    ),
  }
})

import { PTBCreateEditForm } from '../../../../src/routes/products/components/PTBEditForm'
import type { TProductTreeBranch } from '../../../../src/routes/products/types/tProductTreeBranch'

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options?.label) return `${key} ${options.label}`
      return key
    },
  }),
}))

vi.mock('../../../../src/utils/useDocumentType', () => ({
  default: () => ({
    hasHardware: true,
    hasSoftware: true,
  }),
}))

vi.mock('../../../../src/utils/template', () => ({
  checkReadOnly: vi.fn(() => false),
  getPlaceholder: vi.fn(() => 'Placeholder text'),
}))

// Mock useProductTreeBranch hook - override global mock
vi.unmock('../../../../src/utils/useProductTreeBranch')
vi.mock('../../../../src/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: vi.fn(() => ({
    getPTBName: vi.fn((branch) => ({
      name: branch.name,
      isReadonly: false,
    })),
    families: [
      { id: 'family1', name: 'Test Family 1' },
      { id: 'family2', name: 'Test Family 2' },
    ],
    getRelationshipFullProductName: vi.fn(() => 'Mock Product Name'),
    getFullProductName: vi.fn(() => 'Mock Full Product Name'),
  })),
}))

// Mock HeroUI components
vi.mock('@heroui/modal', () => ({
  ModalContent: ({ children }: { children: any }) => (
    <div data-testid="modal-content">
      {typeof children === 'function' ? children(() => {}) : children}
    </div>
  ),
  ModalHeader: ({ children }: { children: any }) => (
    <div data-testid="modal-header">{children}</div>
  ),
  ModalBody: ({ children }: { children: any }) => (
    <div data-testid="modal-body">{children}</div>
  ),
  ModalFooter: ({ children }: { children: any }) => (
    <div data-testid="modal-footer">{children}</div>
  ),
}))

vi.mock('@heroui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props} data-testid="button">
      {children}
    </button>
  ),
}))

vi.mock('@heroui/select', () => ({
  SelectItem: ({ children, ...props }: any) => (
    <option {...props} data-testid="select-item">
      {children}
    </option>
  ),
}))

// Mock custom form components
vi.mock('../../../../src/components/forms/Input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
  Textarea: (props: any) => <textarea data-testid="textarea" {...props} />,
}))

vi.mock('../../../../src/components/forms/Select', () => ({
  default: ({ children, ...props }: any) => (
    <select data-testid="select" {...props}>
      {children}
    </select>
  ),
}))

describe('PTBCreateEditForm', () => {
  const mockPTB: TProductTreeBranch = {
    id: 'test-ptb-1',
    category: 'product_name',
    name: 'Test Product',
    description: 'Test product description',
    type: 'Software',
    subBranches: [],
  }

  it('should render create form and match snapshot', () => {
    const { container } = render(
      <PTBCreateEditForm category="product_name" onSave={vi.fn()} />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render edit form with existing PTB and match snapshot', () => {
    const { container } = render(
      <PTBCreateEditForm
        ptb={mockPTB}
        category="product_name"
        onSave={vi.fn()}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render vendor form (without description and type fields) and match snapshot', () => {
    const vendorPTB: TProductTreeBranch = {
      id: 'test-vendor-1',
      category: 'vendor',
      name: 'Test Vendor',
      description: 'Test vendor description',
      subBranches: [],
    }

    const { container } = render(
      <PTBCreateEditForm ptb={vendorPTB} category="vendor" onSave={vi.fn()} />,
    )

    expect(container).toMatchSnapshot()
  })
})
