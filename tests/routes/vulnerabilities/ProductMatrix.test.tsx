import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TVulnerability } from '../../../src/routes/vulnerabilities/types/tVulnerability'
import ProductMatrix from '../../../src/routes/vulnerabilities/ProductMatrix'

type StoreState = {
  vulnerabilities: TVulnerability[]
  updateVulnerabilities: (next: TVulnerability[]) => void
}

let mockStore: StoreState
let mockProductVersions: { id: string; name: string }[]
const updateVulnerabilitiesMock = vi.fn()
const useDocumentValidationMock = vi.fn()

vi.mock('@/components/WizardStep', () => ({
  default: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('@heroui/react', () => ({
  Alert: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Button: ({ children, onPress }: { children: ReactNode; onPress: () => void }) => (
    <button onClick={onPress}>{children}</button>
  ),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { index?: number }) => {
      const translations: Record<string, string> = {
        'vulnerabilities.matrix.title': 'Product Selection',
        'vulnerabilities.matrix.description': 'Set the vulnerability status per product version.',
        'vulnerabilities.matrix.empty': 'No matrix data',
        'vulnerabilities.matrix.productVersion': 'Product Version',
        'vulnerabilities.matrix.required': 'Required',
        'vulnerabilities.matrix.applyFirst': 'Apply first',
        'vulnerabilities.matrix.applyRow': 'Apply to row',
        'vulnerabilities.matrix.applyColumn': 'Apply to column',
        'vulnerabilities.matrix.applyRowShort': 'Row',
        'vulnerabilities.matrix.applyColumnShort': 'Col',
        'vulnerabilities.products.status.known_affected': 'Known Affected',
        'vulnerabilities.products.status.known_not_affected': 'Known Not Affected',
        'vulnerabilities.products.status.fixed': 'Fixed',
        'vulnerabilities.products.status.under_investigation': 'Under Investigation',
      }

      if (key === 'vulnerabilities.matrix.vulnerabilityFallback') {
        return `Vulnerability ${options?.index}`
      }

      return translations[key] || key
    },
  }),
}))

vi.mock('@/utils/useDocumentStore', () => ({
  default: (selector: (state: StoreState) => unknown) => selector(mockStore),
}))

vi.mock('@/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: () => ({
    getPTBsByCategory: (category: string) =>
      category === 'product_version'
        ? mockProductVersions.map((version) => ({
            id: version.id,
            category: 'product_version',
            name: version.name,
            description: '',
            subBranches: [],
          }))
        : [],
    getFullProductName: (id: string) =>
      mockProductVersions.find((version) => version.id === id)?.name || id,
  }),
}))

vi.mock('@/utils/useDocumentStoreUpdater', () => ({
  useDocumentValidation: useDocumentValidationMock,
}))

function vulnerability(id: string, title: string, products: any[] = []): TVulnerability {
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

describe('ProductMatrix', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockProductVersions = [
      { id: 'version-1', name: 'Vendor Product 1.0' },
      { id: 'version-2', name: 'Vendor Product 2.0' },
    ]

    mockStore = {
      vulnerabilities: [
        vulnerability('v-1', 'SQL Injection', [
          { id: 'p-1', productId: 'version-1', status: 'known_affected' },
        ]),
        vulnerability('v-2', 'XSS', [
          { id: 'p-2', productId: 'version-2', status: 'fixed' },
        ]),
      ],
      updateVulnerabilities: updateVulnerabilitiesMock,
    }
  })

  it('renders empty message when matrix data is incomplete', () => {
    mockStore.vulnerabilities = []

    render(<ProductMatrix />)

    expect(screen.getByText('No matrix data')).toBeInTheDocument()
  })

  it('renders matrix headers and cells', () => {
    render(<ProductMatrix />)

    expect(screen.getByText('Product Selection')).toBeInTheDocument()
    expect(screen.getByText('Product Version')).toBeInTheDocument()
    expect(screen.getByText('SQL Injection')).toBeInTheDocument()
    expect(screen.getByText('XSS')).toBeInTheDocument()
    expect(screen.getByTestId('matrix-cell-0-0')).toBeInTheDocument()
    expect(screen.getByTestId('matrix-cell-1-1')).toBeInTheDocument()
  })

  it('runs document validation hook on matrix page', () => {
    render(<ProductMatrix />)

    expect(useDocumentValidationMock).toHaveBeenCalled()
  })

  it('uses an empty label for the unset option', () => {
    render(<ProductMatrix />)

    const select = screen.getByTestId('matrix-cell-0-0') as HTMLSelectElement
    expect(select.options[0].text).toBe('')
  })

  it('marks vulnerability headers with missing matrix assignments', () => {
    mockStore.vulnerabilities = [
      vulnerability('v-1', 'SQL Injection', [
        { id: 'p-1', productId: 'version-1', status: 'known_affected' },
      ]),
      vulnerability('v-2', 'XSS', []),
    ]

    render(<ProductMatrix />)

    expect(screen.getByTestId('matrix-vulnerability-missing-1')).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByText('Vulnerability 2')).toBeInTheDocument()
  })

  it('shows apply-to-column button in each vulnerability header', () => {
    mockStore.vulnerabilities = [
      vulnerability('v-1', 'SQL Injection', [
        { id: 'p-1', productId: 'version-1', status: 'known_affected' },
      ]),
      vulnerability('v-2', 'XSS', [
        { id: 'p-2', productId: 'version-1', status: 'fixed' },
      ]),
    ]

    render(<ProductMatrix />)

    expect(screen.getByTestId('matrix-apply-column-header-0')).toBeInTheDocument()
    expect(screen.getByTestId('matrix-apply-column-header-1')).toBeInTheDocument()
  })

  it('shows apply-to-row button in each product row header', () => {
    mockStore.vulnerabilities = [
      vulnerability('v-1', 'SQL Injection', [
        { id: 'p-1', productId: 'version-1', status: 'known_affected' },
        { id: 'p-2', productId: 'version-2', status: 'under_investigation' },
      ]),
      vulnerability('v-2', 'XSS', []),
    ]

    render(<ProductMatrix />)

    expect(screen.getByTestId('matrix-apply-row-header-0')).toBeInTheDocument()
    expect(screen.getByTestId('matrix-apply-row-header-1')).toBeInTheDocument()
  })

  it('shows header bulk action buttons even when source first-cell is empty', () => {
    render(<ProductMatrix />)

    expect(screen.getByTestId('matrix-apply-column-header-1')).toBeInTheDocument()
    expect(screen.getByTestId('matrix-apply-row-header-1')).toBeInTheDocument()
  })

  it('can apply unset value from a column header first cell', () => {
    render(<ProductMatrix />)

    fireEvent.click(screen.getByTestId('matrix-apply-column-header-1'))

    const payload = updateVulnerabilitiesMock.mock.calls[0][0]
    const secondVulnerability = payload[1] as TVulnerability

    expect(secondVulnerability.products).toEqual([])
  })

  it('updates one cell status', () => {
    render(<ProductMatrix />)

    fireEvent.change(screen.getByTestId('matrix-cell-1-0'), {
      target: { value: 'known_not_affected' },
    })

    expect(updateVulnerabilitiesMock).toHaveBeenCalledTimes(1)

    const payload = updateVulnerabilitiesMock.mock.calls[0][0]
    expect(payload[0].products.some((p: any) => p.productId === 'version-2' && p.status === 'known_not_affected')).toBe(true)
  })

  it('applies selected cell value to the full product row', () => {
    mockStore.vulnerabilities = [
      vulnerability('v-1', 'SQL Injection', [
        { id: 'p-1', productId: 'version-1', status: 'known_affected' },
        { id: 'p-2', productId: 'version-2', status: 'under_investigation' },
      ]),
      vulnerability('v-2', 'XSS', [
        { id: 'p-3', productId: 'version-2', status: 'fixed' },
      ]),
    ]

    render(<ProductMatrix />)

    fireEvent.click(screen.getByTestId('matrix-apply-row-header-1'))

    const payload = updateVulnerabilitiesMock.mock.calls[0][0]
    expect(payload.every((v: TVulnerability) =>
      v.products.some(
        (p) =>
          p.productId === 'version-2' &&
          p.status === 'under_investigation',
      ),
    )).toBe(true)
  })

  it('applies selected cell value to the full vulnerability column', () => {
    mockStore.vulnerabilities = [
      vulnerability('v-1', 'SQL Injection', [
        { id: 'p-1', productId: 'version-1', status: 'known_affected' },
      ]),
      vulnerability('v-2', 'XSS', [
        { id: 'p-2', productId: 'version-1', status: 'known_not_affected' },
        { id: 'p-3', productId: 'version-2', status: 'fixed' },
      ]),
    ]

    render(<ProductMatrix />)

    fireEvent.click(screen.getByTestId('matrix-apply-column-header-1'))

    const payload = updateVulnerabilitiesMock.mock.calls[0][0]
    const secondVulnerability = payload[1] as TVulnerability

    expect(
      secondVulnerability.products.some(
        (p) => p.productId === 'version-1' && p.status === 'known_not_affected',
      ),
    ).toBe(true)
    expect(
      secondVulnerability.products.some(
        (p) => p.productId === 'version-2' && p.status === 'known_not_affected',
      ),
    ).toBe(true)
  })
})
