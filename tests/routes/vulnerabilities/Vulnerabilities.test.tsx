import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Unmock the Vulnerabilities component to test the actual implementation
vi.unmock('../../../src/routes/vulnerabilities/Vulnerabilities')

// Create mock implementations that can be controlled
let mockListState: any = {
  data: [],
  setData: vi.fn(),
  updateDataEntry: vi.fn(),
}

let mockPageVisit: any = false

let mockListValidation: any = {
  hasErrors: false,
  isTouched: false,
  errorMessages: [],
}

let mockPrefixValidation: any = {
  hasErrors: false,
}

let mockValidationStore: any = {
  messages: [],
}

// Mock all dependencies with controllable implementations
vi.mock('@/components/StatusIndicator', () => ({
  default: () => <div>StatusIndicator</div>,
}))

vi.mock('@/components/WizardStep', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

vi.mock('@/components/forms/ComponentList', () => ({
  default: ({ listState, content, startContent }: any) => (
    <div>
      ComponentList
      {listState.data.map((item: any, index: number) => (
        <div key={item.id || index}>
          {startContent && startContent({ item, index })}
          {content && content(item, index)}
        </div>
      ))}
    </div>
  ),
}))

vi.mock('@/components/forms/VSplit', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

vi.mock('@/utils/useListState', () => ({
  useListState: () => mockListState,
}))

vi.mock('@/utils/useDocumentStoreUpdater', () => ({
  default: () => vi.fn(),
}))

vi.mock('@/utils/validation/useListValidation', () => ({
  useListValidation: () => mockListValidation,
}))

vi.mock('@/utils/validation/usePageVisit', () => ({
  default: () => mockPageVisit,
}))

vi.mock('@/utils/validation/usePrefixValidation', () => ({
  usePrefixValidation: () => mockPrefixValidation,
}))

vi.mock('@/utils/validation/useValidationStore', () => ({
  default: (selector: any) => {
    if (typeof selector === 'function') {
      return selector(mockValidationStore)
    }
    return mockValidationStore
  },
}))

vi.mock('@heroui/chip', () => ({
  Chip: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}))

vi.mock('@heroui/react', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => (
    <div role="alert">{children}</div>
  ),
}))

vi.mock('@heroui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tab: ({
    children,
    title,
  }: {
    children: React.ReactNode
    title: React.ReactNode
  }) => (
    <div>
      <div>{title}</div>
      <div>{children}</div>
    </div>
  ),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock sub-components
vi.mock('../../../src/routes/vulnerabilities/General', () => ({
  default: () => <div>General</div>,
}))

vi.mock('../../../src/routes/vulnerabilities/Notes', () => ({
  default: () => <div>Notes</div>,
}))

vi.mock('../../../src/routes/vulnerabilities/Products', () => ({
  default: () => <div>Products</div>,
}))

vi.mock('../../../src/routes/vulnerabilities/Remediations', () => ({
  default: () => <div>Remediations</div>,
}))

vi.mock('../../../src/routes/vulnerabilities/Scores', () => ({
  default: () => <div>Scores</div>,
}))

vi.mock('../../../src/routes/vulnerabilities/types/tVulnerability', () => ({
  getDefaultVulnerability: () => ({
    id: 'test-id',
    title: 'Test Title',
    notes: [],
    products: [],
    remediations: [],
    scores: [],
  }),
}))

// Import the component after all mocks are set up
import Vulnerabilities from '../../../src/routes/vulnerabilities/Vulnerabilities'

describe('Vulnerabilities', () => {
  beforeEach(() => {
    // Reset to default state
    mockListState = {
      data: [],
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    mockPageVisit = false

    mockListValidation = {
      hasErrors: false,
      isTouched: false,
      errorMessages: [],
    }

    mockPrefixValidation = {
      hasErrors: false,
    }

    mockValidationStore = {
      messages: [],
    }
  })

  it('renders without crashing', () => {
    const { container } = render(<Vulnerabilities />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders alert when page is visited and has validation errors', () => {
    mockPageVisit = true
    mockListValidation = {
      hasErrors: true,
      isTouched: false,
      errorMessages: [{ path: '/test', message: 'Test error message' }],
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.textContent).toContain('Test error message')
  })

  it('renders alert when validation is touched and has errors', () => {
    mockPageVisit = false
    mockListValidation = {
      hasErrors: true,
      isTouched: true,
      errorMessages: [{ path: '/test', message: 'Another error message' }],
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.textContent).toContain('Another error message')
  })

  it('renders multiple error messages', () => {
    mockPageVisit = true
    mockListValidation = {
      hasErrors: true,
      isTouched: false,
      errorMessages: [
        { path: '/test1', message: 'First error' },
        { path: '/test2', message: 'Second error' },
      ],
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.textContent).toContain('First error')
    expect(container.textContent).toContain('Second error')
  })

  it('does not render alert when no errors', () => {
    mockPageVisit = true
    mockListValidation = {
      hasErrors: false,
      isTouched: true,
      errorMessages: [],
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.textContent).not.toContain('error')
  })

  it('renders vulnerability list when data is present', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        cve: 'CVE-2023-12345',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders CVE chip when vulnerability has CVE', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        cve: 'CVE-2023-12345',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.textContent).toContain('CVE-2023-12345')
  })

  it('does not render CVE chip when vulnerability has no CVE', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.textContent).not.toContain('CVE-')
  })

  it('renders vulnerability form with tabs when vulnerability exists', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.textContent).toContain('General')
    expect(container.textContent).toContain('Notes')
    expect(container.textContent).toContain('Products')
    expect(container.textContent).toContain('Remediations')
    expect(container.textContent).toContain('Scores')
  })

  it('handles vulnerability with scores that have no cvssVersion', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        notes: [],
        products: [],
        remediations: [],
        scores: [
          {
            id: 'score-1',
            cvssVersion: null,
            vectorString: '',
            productIds: [],
          },
        ],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.firstChild).toBeTruthy()
  })

  it('handles vulnerability with scores that have cvssVersion', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        notes: [],
        products: [],
        remediations: [],
        scores: [
          {
            id: 'score-1',
            cvssVersion: '3.1',
            vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
            productIds: [],
          },
        ],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.firstChild).toBeTruthy()
  })

  it('handles validation store with error messages for tab titles', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    mockValidationStore = {
      messages: [
        {
          path: '/vulnerabilities/0/cve',
          severity: 'error',
          message: 'CVE is required',
        },
        {
          path: '/vulnerabilities/0/notes/0',
          severity: 'error',
          message: 'Note is required',
        },
      ],
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.firstChild).toBeTruthy()
  })

  it('handles validation with csafPrefix matching', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    mockValidationStore = {
      messages: [
        {
          path: '/vulnerabilities/0/products/0',
          severity: 'error',
          message: 'Product error',
        },
      ],
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.firstChild).toBeTruthy()
  })

  it('handles validation with csafPaths matching', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    mockValidationStore = {
      messages: [
        {
          path: '/vulnerabilities/0/product_status',
          severity: 'error',
          message: 'Product status error',
        },
      ],
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.firstChild).toBeTruthy()
  })

  it('handles multiple vulnerabilities', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'First Vulnerability',
        cve: 'CVE-2023-12345',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
      },
      {
        id: '2',
        title: 'Second Vulnerability',
        cve: 'CVE-2023-67890',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.textContent).toContain('CVE-2023-12345')
    expect(container.textContent).toContain('CVE-2023-67890')
  })

  it('handles prefix validation with errors', () => {
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
      },
    ]

    mockListState = {
      data: mockVulnerabilities,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
    }

    mockPrefixValidation = {
      hasErrors: true,
    }

    const { container } = render(<Vulnerabilities />)
    expect(container.firstChild).toBeTruthy()
  })
})
