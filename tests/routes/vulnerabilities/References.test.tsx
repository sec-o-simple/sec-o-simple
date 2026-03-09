import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import References from '../../../src/routes/vulnerabilities/References'
import { TVulnerability } from '../../../src/routes/vulnerabilities/types/tVulnerability'

const mockUseListState = vi.fn()
const mockUseListValidation = vi.fn()

vi.mock('@/components/forms/VSplit', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="vsplit">{children}</div>
  ),
}))

vi.mock('@/routes/shared/ReferencesList', () => ({
  ReferencesList: ({
    referencesListState,
    csafPath,
  }: {
    referencesListState: { data: unknown[] }
    csafPath: string
  }) => (
    <div
      data-testid="references-list"
      data-path={csafPath}
      data-count={referencesListState.data.length}
    >
      References List
    </div>
  ),
}))

vi.mock('@/utils/useListState', () => ({
  useListState: (...args: unknown[]) => mockUseListState(...args),
}))

vi.mock('@/utils/validation/useListValidation', () => ({
  useListValidation: (...args: unknown[]) => mockUseListValidation(...args),
}))

vi.mock('@heroui/react', () => ({
  Alert: ({ children, color }: { children: React.ReactNode; color: string }) => (
    <div data-testid="alert" data-color={color}>
      {children}
    </div>
  ),
}))

describe('Vulnerabilities References', () => {
  const mockOnChange = vi.fn()

  const mockVulnerability: TVulnerability = {
    id: 'vuln-1',
    cve: 'CVE-2026-1111',
    title: 'Test vulnerability',
    notes: [],
    references: [
      {
        id: 'ref-1',
        summary: 'Reference 1',
        url: 'https://example.com/ref1',
        category: 'external',
      },
    ],
    products: [],
    flags: [],
    remediations: [],
    scores: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseListState.mockReturnValue({
      data: mockVulnerability.references,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
      removeDataEntry: vi.fn(),
      addDataEntry: vi.fn(),
      getId: vi.fn(),
    })

    mockUseListValidation.mockReturnValue({
      hasErrors: false,
      isTouched: false,
      errorMessages: [],
    })
  })

  it('renders references list with vulnerability-specific path', () => {
    render(
      <References
        vulnerability={mockVulnerability}
        vulnerabilityIndex={3}
        onChange={mockOnChange}
      />,
    )

    expect(screen.getByTestId('vsplit')).toBeInTheDocument()
    const list = screen.getByTestId('references-list')
    expect(list).toHaveAttribute('data-path', '/vulnerabilities/3/references')
    expect(list).toHaveAttribute('data-count', '1')
  })

  it('calls onChange when list data changes', () => {
    render(
      <References
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={mockOnChange}
      />,
    )

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockVulnerability,
      references: mockVulnerability.references,
    })
  })

  it('shows validation error alert when touched and invalid', () => {
    mockUseListValidation.mockReturnValue({
      hasErrors: true,
      isTouched: true,
      errorMessages: [{ path: '/vulnerabilities/0/references', message: 'Invalid references' }],
    })

    render(
      <References
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={mockOnChange}
      />,
    )

    expect(screen.getByTestId('alert')).toHaveAttribute('data-color', 'danger')
    expect(screen.getByText('Invalid references')).toBeInTheDocument()
  })

  it('shows validation alert when page is touched and invalid', () => {
    mockUseListValidation.mockReturnValue({
      hasErrors: true,
      isTouched: false,
      errorMessages: [{ path: '/vulnerabilities/0/references', message: 'Missing summary' }],
    })

    render(
      <References
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={mockOnChange}
        isTouched={true}
      />,
    )

    expect(screen.getByText('Missing summary')).toBeInTheDocument()
  })
})
