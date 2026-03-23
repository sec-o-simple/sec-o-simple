import { fireEvent, render, screen } from '@testing-library/react'
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
      isReadonly:
        !!branch.identificationHelper ||
        (branch.category === 'product_version' &&
          branch.productName !== undefined &&
          branch.productName !== 'Mock Full Product Name'),
      readonlyReason: branch.identificationHelper
        ? 'imported_with_identification_helper'
        : branch.category === 'product_version' &&
            branch.productName !== undefined &&
            branch.productName !== 'Mock Full Product Name'
          ? 'full_product_name_mismatch'
          : undefined,
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
  Button: ({ children, onPress, ...props }: any) => (
    <button {...props} onClick={onPress} data-testid="button">
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

  it('should show read-only reason when imported version has identification helper', () => {
    const versionPTB: TProductTreeBranch = {
      id: 'test-version-1',
      category: 'product_version',
      name: '1.0.0',
      description: '',
      subBranches: [],
      identificationHelper: {
        cpe: 'cpe:2.3:a:test:product:1.0.0:*:*:*:*:*:*:*',
      },
    }

    render(
      <PTBCreateEditForm
        ptb={versionPTB}
        category="product_version"
        onSave={vi.fn()}
      />,
    )

    expect(
      screen.getByText(
        'product_version.readonly_reason.imported_with_identification_helper',
      ),
    ).toBeInTheDocument()
  })

  it('should show read-only reason when full product name does not match', () => {
    const versionPTB: TProductTreeBranch = {
      id: 'test-version-2',
      category: 'product_version',
      name: '1.0.1',
      description: '',
      subBranches: [],
      productName: 'Stored Name That Does Not Match',
    }

    render(
      <PTBCreateEditForm
        ptb={versionPTB}
        category="product_version"
        onSave={vi.fn()}
      />,
    )

    expect(
      screen.getByText(
        'product_version.readonly_reason.full_product_name_mismatch',
      ),
    ).toBeInTheDocument()
  })

  it('should call onSave when save button is pressed', () => {
    const onSave = vi.fn()

    render(<PTBCreateEditForm category="product_name" onSave={onSave} />)

    const saveButton = screen.getByText('common.save')
    fireEvent.click(saveButton)

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '',
        description: '',
        type: 'Software',
        familyId: null,
      }),
    )
  })
})
