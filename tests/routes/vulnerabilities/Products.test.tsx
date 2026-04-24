import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Products from '../../../src/routes/vulnerabilities/Products'
import { TVulnerability } from '../../../src/routes/vulnerabilities/types/tVulnerability'
import { getMatrixCellStatus } from '../../../src/routes/vulnerabilities/utils/productMatrix'

type StoreState = {
  vulnerabilities: TVulnerability[]
}

let mockStore: StoreState
const onChangeMock = vi.fn()
let mockValidation = {
  hasErrors: false,
  errorMessages: [] as { path: string; message: string }[],
}
let mockProductVersions = [
  {
    id: 'version-1',
    category: 'product_version',
    name: '1.0',
    description: '',
    subBranches: [],
  },
  {
    id: 'version-2',
    category: 'product_version',
    name: '2.0',
    description: '',
    subBranches: [],
  },
]

vi.mock('react-router', () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string
    children: ReactNode
    [key: string]: unknown
  }) => (
    <a href={to} {...(props as Record<string, unknown>)}>
      {children}
    </a>
  ),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { index?: number }) => {
      const map: Record<string, string> = {
        'vulnerabilities.products.matrixHint':
          'Tip: edit product selection across all vulnerabilities in one overview via',
        'vulnerabilities.products.openMatrix': 'Product Matrix',
        'vulnerabilities.products.copySectionTitle':
          'Copy from another vulnerability',
        'vulnerabilities.products.copyFromLabel': 'Copy selection from',
        'vulnerabilities.products.copyFromPlaceholder': 'Select vulnerability',
        'vulnerabilities.products.copyButton': 'Copy Product Selection',
        'vulnerabilities.products.noProductVersions':
          'No product versions available yet.',
        'vulnerabilities.products.noProductVersionsLinkPrefix':
          'Please add them in',
        'products.manage': 'Product Management',
        'vulnerabilities.matrix.productVersion': 'Product Version',
        'vulnerabilities.products.status.known_affected': 'Known Affected',
        'vulnerabilities.products.status.known_not_affected':
          'Known Not Affected',
        'vulnerabilities.products.status.fixed': 'Fixed',
        'vulnerabilities.products.status.under_investigation':
          'Under Investigation',
      }

      if (key === 'vulnerabilities.matrix.vulnerabilityFallback') {
        return `Vulnerability ${options?.index}`
      }

      return map[key] || key
    },
  }),
}))

vi.mock('@/utils/useDocumentStore', () => ({
  default: (selector: (state: StoreState) => unknown) => selector(mockStore),
}))

vi.mock('@/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: () => ({
    getSelectableRefs: () =>
      mockProductVersions.map((version) => ({
        category: version.category,
        full_product_name: {
          product_id: version.id,
          name:
            version.id === 'version-1'
              ? 'Vendor Product 1.0'
              : 'Vendor Product 2.0',
        },
      })),
  }),
}))

vi.mock('@/utils/validation/useFieldValidation', () => ({
  useFieldValidation: () => mockValidation,
}))

vi.mock('@heroui/react', () => ({
  Button: ({
    children,
    onPress,
    isDisabled,
    ...props
  }: {
    children: ReactNode
    onPress?: () => void
    isDisabled?: boolean
    [key: string]: unknown
  }) => (
    <button
      onClick={onPress}
      disabled={isDisabled}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </button>
  ),
}))

function createVulnerability(
  id: string,
  title: string,
  products: TVulnerability['products'] = [],
): TVulnerability {
  return {
    id,
    title,
    notes: [],
    references: [],
    products,
    flags: [],
    remediations: [],
    scores: [],
  }
}

describe('Products', () => {
  let currentVulnerability: TVulnerability

  beforeEach(() => {
    vi.clearAllMocks()
    mockProductVersions = [
      {
        id: 'version-1',
        category: 'product_version',
        name: '1.0',
        description: '',
        subBranches: [],
      },
      {
        id: 'version-2',
        category: 'product_version',
        name: '2.0',
        description: '',
        subBranches: [],
      },
    ]

    mockValidation = {
      hasErrors: false,
      errorMessages: [],
    }

    currentVulnerability = createVulnerability('v-1', 'Current', [
      { id: 'p-1', productId: 'version-2', status: 'fixed' },
    ])

    mockStore = {
      vulnerabilities: [
        currentVulnerability,
        createVulnerability('v-2', 'Source', [
          { id: 'p-2', productId: 'version-1', status: 'known_affected' },
        ]),
      ],
    }
  })

  it('renders matrix hint and open matrix action', () => {
    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    expect(
      screen.getByText((_, element) =>
        element?.tagName === 'P' &&
        (element.textContent || '').includes(
          'Tip: edit product selection across all vulnerabilities in one overview via',
        ),
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Product Matrix')).toBeInTheDocument()
  })

  it('renders matrix link in hint below the table', () => {
    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    const matrixLink = screen.getByRole('link', { name: 'Product Matrix' })
    expect(matrixLink).toHaveAttribute('href', '/vulnerabilities/matrix')
  })

  it('renders all product versions with four status radios each', () => {
    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    expect(screen.getByText('Vendor Product 1.0')).toBeInTheDocument()
    expect(screen.getByText('Vendor Product 2.0')).toBeInTheDocument()

    expect(
      screen.getByTestId('status-radio-version-1-known_affected'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('status-radio-version-1-known_not_affected'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('status-radio-version-1-fixed')).toBeInTheDocument()
    expect(
      screen.getByTestId('status-radio-version-1-under_investigation'),
    ).toBeInTheDocument()
  })

  it('starts with no selected status for versions without assignments', () => {
    currentVulnerability = createVulnerability('v-1', 'Current', [])

    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    expect(
      screen.getByTestId('status-radio-version-1-known_affected'),
    ).not.toBeChecked()
    expect(
      screen.getByTestId('status-radio-version-1-known_not_affected'),
    ).not.toBeChecked()
    expect(
      screen.getByTestId('status-radio-version-1-fixed'),
    ).not.toBeChecked()
    expect(
      screen.getByTestId('status-radio-version-1-under_investigation'),
    ).not.toBeChecked()
  })

  it('updates vulnerability product status when a radio is selected', () => {
    currentVulnerability = createVulnerability('v-1', 'Current', [])

    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    fireEvent.click(screen.getByTestId('status-radio-version-1-known_affected'))

    expect(onChangeMock).toHaveBeenCalledTimes(1)
    const updated = onChangeMock.mock.calls[0][0] as TVulnerability
    expect(getMatrixCellStatus(updated, 'version-1')).toBe('known_affected')
  })

  it('keeps one status per version (cannot unselect, can switch)', () => {
    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    fireEvent.click(screen.getByTestId('status-radio-version-2-under_investigation'))

    const updated = onChangeMock.mock.calls[0][0] as TVulnerability
    const version2Entries = updated.products.filter(
      (item) => item.productId === 'version-2',
    )

    expect(version2Entries).toHaveLength(1)
    expect(version2Entries[0].status).toBe('under_investigation')
  })

  it('disables copy button until source vulnerability is selected', () => {
    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    fireEvent.click(screen.getByTestId('toggle-copy-selection'))
    expect(screen.getByTestId('copy-selection-button')).toBeDisabled()
  })

  it('copies product selection from another vulnerability', () => {
    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    fireEvent.click(screen.getByTestId('toggle-copy-selection'))
    fireEvent.change(screen.getByTestId('copy-source-select'), {
      target: { value: 'v-2' },
    })
    fireEvent.click(screen.getByTestId('copy-selection-button'))

    const updated = onChangeMock.mock.calls[0][0] as TVulnerability

    expect(getMatrixCellStatus(updated, 'version-1')).toBe('known_affected')
    expect(getMatrixCellStatus(updated, 'version-2')).toBe('')
    expect(screen.queryByTestId('copy-source-select')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('toggle-copy-selection'),
    ).toBeInTheDocument()
  })

  it('updates radio selection immediately after copying', () => {
    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    fireEvent.click(screen.getByTestId('toggle-copy-selection'))
    fireEvent.change(screen.getByTestId('copy-source-select'), {
      target: { value: 'v-2' },
    })
    fireEvent.click(screen.getByTestId('copy-selection-button'))

    expect(
      screen.getByTestId('status-radio-version-1-known_affected'),
    ).toBeChecked()
    expect(screen.getByTestId('status-radio-version-2-fixed')).not.toBeChecked()
  })

  it('keeps radio groups independent across multiple open vulnerabilities', () => {
    const vulnerabilityA = createVulnerability('v-a', 'A', [])
    const vulnerabilityB = createVulnerability('v-b', 'B', [])

    render(
      <>
        <div data-testid="products-a">
          <Products
            vulnerability={vulnerabilityA}
            vulnerabilityIndex={0}
            onChange={onChangeMock}
          />
        </div>
        <div data-testid="products-b">
          <Products
            vulnerability={vulnerabilityB}
            vulnerabilityIndex={1}
            onChange={onChangeMock}
          />
        </div>
      </>,
    )

    const productA = within(screen.getByTestId('products-a'))
    const productB = within(screen.getByTestId('products-b'))

    fireEvent.click(productA.getByTestId('status-radio-version-1-known_affected'))
    fireEvent.click(productB.getByTestId('status-radio-version-1-fixed'))

    expect(
      productA.getByTestId('status-radio-version-1-known_affected'),
    ).toBeChecked()
    expect(productB.getByTestId('status-radio-version-1-fixed')).toBeChecked()
  })

  it('hides copy controls by default and toggles them on demand', () => {
    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    expect(screen.queryByTestId('copy-source-select')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('copy-selection-button'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('toggle-copy-selection')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('toggle-copy-selection'))

    expect(screen.getByTestId('copy-source-select')).toBeInTheDocument()
    expect(screen.getByTestId('copy-selection-button')).toBeInTheDocument()
    expect(
      screen.queryByTestId('toggle-copy-selection'),
    ).not.toBeInTheDocument()
  })

  it('copies legacy product status values into supported radio statuses', () => {
    mockStore = {
      vulnerabilities: [
        currentVulnerability,
        createVulnerability('v-2', 'Source', [
          { id: 'p-2', productId: 'version-1', status: 'first_affected' },
          { id: 'p-3', productId: 'version-2', status: 'first_fixed' },
        ]),
      ],
    }

    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    fireEvent.click(screen.getByTestId('toggle-copy-selection'))
    fireEvent.change(screen.getByTestId('copy-source-select'), {
      target: { value: 'v-2' },
    })
    fireEvent.click(screen.getByTestId('copy-selection-button'))

    const updated = onChangeMock.mock.calls[0][0] as TVulnerability
    expect(getMatrixCellStatus(updated, 'version-1')).toBe('known_affected')
    expect(getMatrixCellStatus(updated, 'version-2')).toBe('fixed')
  })

  it('can close copy controls without copying', () => {
    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    fireEvent.click(screen.getByTestId('toggle-copy-selection'))
    fireEvent.click(screen.getByTestId('close-copy-selection'))

    expect(screen.queryByTestId('copy-source-select')).not.toBeInTheDocument()
    expect(screen.getByTestId('toggle-copy-selection')).toBeInTheDocument()
  })

  it('shows validation error messages when product status has errors', () => {
    mockValidation = {
      hasErrors: true,
      errorMessages: [
        {
          path: '/vulnerabilities/0/product_status',
          message: 'At least one product status is required',
        },
      ],
    }

    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    expect(
      screen.getByText('At least one product status is required'),
    ).toBeInTheDocument()
  })

  it('shows empty warning with Product Management link and hides copy button when no product versions exist', () => {
    mockProductVersions = []

    render(
      <Products
        vulnerability={currentVulnerability}
        vulnerabilityIndex={0}
        onChange={onChangeMock}
      />,
    )

    const productManagementLink = screen.getByRole('link', {
      name: 'Product Management',
    })

    expect(productManagementLink.closest('div')).toHaveTextContent(
      'No product versions available yet.',
    )
    expect(productManagementLink).toHaveAttribute(
      'href',
      '/products/management',
    )
    expect(screen.queryByTestId('toggle-copy-selection')).not.toBeInTheDocument()
  })
})
