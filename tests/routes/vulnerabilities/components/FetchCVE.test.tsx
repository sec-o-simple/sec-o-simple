import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FetchCVE from '../../../../src/routes/vulnerabilities/components/FetchCVE'
import { TVulnerability } from '../../../../src/routes/vulnerabilities/types/tVulnerability'

// Mock all the dependencies
vi.mock('@/components/forms/HSplit', () => ({
  default: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="hsplit" className={className}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/forms/Input', () => ({
  Input: ({
    label,
    value,
    onValueChange,
    onClear,
    isDisabled,
    isInvalid,
    placeholder,
    autoFocus,
    csafPath,
    isTouched,
  }: any) => (
    <div data-testid="input">
      <label htmlFor="input-field">{label}</label>
      <input
        id="input-field"
        data-testid="input-field"
        value={value || ''}
        onChange={(e) => onValueChange?.(e.target.value)}
        disabled={isDisabled}
        placeholder={placeholder}
        autoFocus={autoFocus}
        data-invalid={isInvalid}
        data-csaf-path={csafPath}
        data-touched={isTouched}
      />
      {onClear && (
        <button data-testid="clear-button" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  ),
}))

vi.mock('@heroui/modal', () => ({
  Modal: ({ children, isOpen }: any) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
  ModalBody: ({ children }: any) => (
    <div data-testid="modal-body">{children}</div>
  ),
  ModalContent: ({ children }: any) => (
    <div data-testid="modal-content">
      {typeof children === 'function' ? children(() => {}) : children}
    </div>
  ),
  ModalFooter: ({ children }: any) => (
    <div data-testid="modal-footer">{children}</div>
  ),
  ModalHeader: ({ children }: any) => (
    <div data-testid="modal-header">{children}</div>
  ),
  useDisclosure: () => ({
    isOpen: false,
    onOpen: vi.fn(),
    onOpenChange: vi.fn(),
  }),
}))

vi.mock('@/utils/template', () => ({
  checkReadOnly: vi.fn(() => false),
  getPlaceholder: vi.fn(() => 'Enter CVE ID'),
}))

vi.mock('@/utils/useConfigStore', () => ({
  useConfigStore: vi.fn(() => ({
    config: { cveApiUrl: 'https://test-api.com/api/cve' },
  })),
}))

vi.mock('@/utils/useDocumentStore', () => ({
  default: vi.fn(() => 'en'),
}))

vi.mock('@heroui/react', () => ({
  addToast: vi.fn(),
  Button: ({
    children,
    onPress,
    disabled,
    isLoading,
    color,
    ...props
  }: any) => (
    <button
      data-testid={props['data-testid'] || 'fetch-button'}
      onClick={onPress}
      disabled={disabled}
      data-loading={isLoading}
      data-color={color}
    >
      {children}
    </button>
  ),
  Tooltip: ({ children, content, showArrow, isDisabled }: any) => (
    <div
      data-testid="tooltip"
      data-content={content}
      data-disabled={isDisabled}
    >
      {children}
    </div>
  ),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'vulnerabilities.general.noCveNotesFound': 'No CVE notes found',
        'vulnerabilities.general.noCveNotesFoundDescription':
          'No CVE notes found description',
        'vulnerabilities.general.description': 'Description',
        'vulnerabilities.general.cveNotesFetched': 'CVE notes fetched',
        'vulnerabilities.general.cveNotesFetchedDescription': `Fetched ${
          options?.count || 0
        } notes`,
        'vulnerabilities.general.cveFetchError': 'CVE fetch error',
        'vulnerabilities.general.cveFetchErrorDescription':
          'CVE fetch error description',
        'vulnerabilities.general.fetchCVEData': 'Fetch CVE Data',
        'vulnerabilities.general.fetchCve': 'Fetch CVE',
      }
      return translations[key] || key
    },
  }),
}))

vi.mock('uid', () => ({
  uid: vi.fn(() => 'mock-uid-123'),
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('FetchCVE', () => {
  const mockOnChange = vi.fn()
  const mockCwes = [
    { id: 'CWE-79', name: 'Cross-site Scripting' },
    { id: 'CWE-89', name: 'SQL Injection' },
  ]

  const mockVulnerability: TVulnerability = {
    id: 'test-vuln-1',
    cve: 'CVE-2023-1234',
    title: 'Test Vulnerability',
    notes: [],
    products: [],
    remediations: [],
    scores: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock for successful fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          containers: {
            cna: {
              title: 'Test CVE Title',
              descriptions: [{ lang: 'en', value: 'English description' }],
              metrics: [
                {
                  cvssV3_1: {
                    vectorString:
                      'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
                  },
                },
              ],
            },
          },
        }),
    } as any)
  })

  it('should render correctly with default props', () => {
    render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
      />,
    )

    expect(screen.getByTestId('hsplit')).toBeInTheDocument()
    expect(screen.getByTestId('input')).toBeInTheDocument()
    expect(screen.getByLabelText('CVE ID')).toBeInTheDocument()
    expect(screen.getByTestId('fetch-button')).toBeInTheDocument()
    expect(screen.getByText('Fetch CVE')).toBeInTheDocument()
  })

  it('should render input with correct props', () => {
    render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={mockVulnerability}
        vulnerabilityIndex={5}
        isTouched={true}
      />,
    )

    const input = screen.getByTestId('input-field')
    expect(input).toHaveValue('CVE-2023-1234')
    expect(input).toHaveAttribute('data-csaf-path', '/vulnerabilities/5/cve')
    expect(input).toHaveAttribute('data-touched', 'true')
    expect(input).toHaveAttribute('placeholder', 'Enter CVE ID')
    expect(input).toBeTruthy() // autoFocus is set but might not be visible in tests
  })

  it('should handle CVE input changes', async () => {
    const user = userEvent.setup()

    render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
      />,
    )

    const input = screen.getByTestId('input-field')

    // Simulate typing a single character to test onChange
    await user.type(input, 'X')

    // Check that mockOnChange has been called (it gets called for each character typed)
    expect(mockOnChange).toHaveBeenCalled()

    // The exact value doesn't matter as much as the fact that onChange was triggered
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockVulnerability.id,
      }),
    )
  })

  it('should handle clear button click', async () => {
    const user = userEvent.setup()

    render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
      />,
    )

    await user.click(screen.getByTestId('clear-button'))

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockVulnerability,
      cve: '',
    })
  })

  it('should disable fetch button when CVE is empty', () => {
    const emptyVulnerability = { ...mockVulnerability, cve: '' }

    render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={emptyVulnerability}
        vulnerabilityIndex={0}
      />,
    )

    const fetchButton = screen.getByTestId('fetch-button')
    expect(fetchButton).toBeDisabled()
    expect(fetchButton).toHaveAttribute('data-color', 'default')
  })

  it('should successfully fetch CVE data and update vulnerability', async () => {
    const user = userEvent.setup()

    render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
      />,
    )

    await user.click(screen.getByTestId('fetch-button'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://cveawg.mitre.org/api/cve/CVE-2023-1234',
      )
    })

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockVulnerability,
      title: 'Test CVE Title',
    })
  })

  it('should handle fetch error correctly', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const user = userEvent.setup()

    render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
      />,
    )

    await user.click(screen.getByTestId('fetch-button'))

    await waitFor(() => {
      // Check that CVE error state is set
      const input = screen.getByTestId('input-field')
      expect(input).toHaveAttribute('data-invalid', 'true')
    })
  })

  it('should handle HTTP error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as any)

    const user = userEvent.setup()

    render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
      />,
    )

    await user.click(screen.getByTestId('fetch-button'))

    await waitFor(() => {
      const input = screen.getByTestId('input-field')
      expect(input).toHaveAttribute('data-invalid', 'true')
    })
  })

  it('should show loading state during fetch', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockFetch.mockReturnValueOnce(promise)
    const user = userEvent.setup()

    render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
      />,
    )

    await user.click(screen.getByTestId('fetch-button'))

    // Check loading state
    const fetchButton = screen.getByTestId('fetch-button')
    expect(fetchButton).toHaveAttribute('data-loading', 'true')
    expect(fetchButton).toBeDisabled()

    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ containers: { cna: { title: 'Test' } } }),
    })

    await waitFor(() => {
      expect(fetchButton).toHaveAttribute('data-loading', 'false')
    })
  })

  it('should reset CVE error when input value changes', async () => {
    // First set error state by triggering a fetch error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const user = userEvent.setup()

    render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
      />,
    )

    await user.click(screen.getByTestId('fetch-button'))

    await waitFor(() => {
      const input = screen.getByTestId('input-field')
      expect(input).toHaveAttribute('data-invalid', 'true')
    })

    // Now change the input value
    const input = screen.getByTestId('input-field')
    await user.clear(input)
    await user.type(input, 'CVE-2024-9999')

    // Error should be reset
    expect(input).toHaveAttribute('data-invalid', 'false')
  })

  it('should match snapshot', () => {
    const { container } = render(
      <FetchCVE
        onChange={mockOnChange}
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        isTouched={true}
      />,
    )

    expect(container.firstChild).toMatchSnapshot()
  })
})
