import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RevisionHistoryTable from '../../../src/components/forms/RevisionHistoryTable'

// Mock external dependencies
vi.mock('@heroui/button', () => ({
  Button: ({ children, onPress, variant, color, ...props }: any) => (
    <button 
      onClick={onPress}
      data-variant={variant}
      data-color={color}
      data-testid="add-button"
      {...props}
    >
      {children}
    </button>
  )
}))

vi.mock('@heroui/table', () => ({
  Table: ({ children, ...props }: any) => <table data-testid="table" {...props}>{children}</table>,
  TableHeader: ({ children, ...props }: any) => <thead data-testid="table-header" {...props}>{children}</thead>,
  TableColumn: ({ children, width, ...props }: any) => (
    <th data-width={width} data-testid="table-column" {...props}>{children}</th>
  ),
  TableBody: ({ children, emptyContent, ...props }: any) => (
    <tbody data-testid="table-body" data-empty-content={emptyContent} {...props}>
      {children || <tr><td>{emptyContent}</td></tr>}
    </tbody>
  ),
  TableRow: ({ children, ...props }: any) => <tr data-testid="table-row" {...props}>{children}</tr>,
  TableCell: ({ children, ...props }: any) => <td data-testid="table-cell" {...props}>{children}</td>
}))

vi.mock('@heroui/react', () => ({
  Alert: ({ children, color, className, ...props }: any) => (
    <div data-testid="alert" data-color={color} className={className} {...props}>
      {children}
    </div>
  )
}))

vi.mock('../../../src/components/forms/Input', () => ({
  Input: ({ value, onValueChange, placeholder, csafPath, ...props }: any) => (
    <input
      data-testid="input"
      data-csaf-path={csafPath}
      value={value || ''}
      onChange={(e) => onValueChange?.(e.target.value)}
      placeholder={placeholder}
      {...props}
    />
  )
}))

vi.mock('../../../src/components/forms/DatePicker', () => ({
  default: ({ value, onChange, csafPath, ...props }: any) => (
    <input
      data-testid="date-picker"
      data-csaf-path={csafPath}
      type="date"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      {...props}
    />
  )
}))

vi.mock('../../../src/components/forms/IconButton', () => ({
  default: ({ icon, onPress, ...props }: any) => (
    <button
      data-testid="icon-button"
      data-icon={typeof icon === 'string' ? icon : 'trash'}
      onClick={onPress}
      {...props}
    >
      Delete
    </button>
  )
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'document.general.revisionHistory.history': 'Revision History',
        'document.general.revisionHistory.label': 'Revision',
        'document.general.revisionHistory.version': 'Version',
        'document.general.revisionHistory.date': 'Date',
        'document.general.revisionHistory.description': 'Description',
        'document.general.revisionHistory.empty': 'No revisions available',
        'common.add': `Add ${params?.label || ''}`,
        'common.actions': 'Actions',
        'common.placeholder': `Enter ${params?.label || ''}`
      }
      return translations[key] || key
    }
  })
}))

// Mock the custom hooks and utilities
const mockListState = {
  data: [] as any[],
  setData: vi.fn(),
  addDataEntry: vi.fn(),
  updateDataEntry: vi.fn(),
  removeDataEntry: vi.fn()
}

vi.mock('../../../src/utils/useListState', () => ({
  useListState: vi.fn(() => mockListState)
}))

vi.mock('../../../src/utils/useDocumentStoreUpdater', () => ({
  default: vi.fn()
}))

vi.mock('../../../src/utils/validation/useListValidation', () => ({
  useListValidation: vi.fn(() => ({
    hasErrors: false,
    errorMessages: []
  }))
}))

vi.mock('../../../src/routes/document-information/types/tRevisionHistoryEntry', () => ({
  getDefaultRevisionHistoryEntry: () => ({
    id: 'test-id',
    number: '1.0.0',
    date: '2025-01-01',
    summary: 'Initial release'
  })
}))

vi.mock('../../../src/utils/csafExport/latestVersion', () => ({
  retrieveLatestVersion: vi.fn(() => '1.0.0')
}))

vi.mock('semver', () => ({
  valid: vi.fn(),
  inc: vi.fn()
}))

describe('RevisionHistoryTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListState.data = []
  })

  it('should render correctly with empty state', () => {
    const { container } = render(<RevisionHistoryTable />)
    expect(container).toMatchSnapshot()
  })

  it('should display the component title and add button', () => {
    render(<RevisionHistoryTable />)
    
    expect(screen.getByText('Revision History')).toBeInTheDocument()
    expect(screen.getByText('Add Revision')).toBeInTheDocument()
  })

  it('should display table headers', () => {
    render(<RevisionHistoryTable />)
    
    expect(screen.getByText('Version')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('should display empty content when no revisions exist', () => {
    render(<RevisionHistoryTable />)
    
    const tableBody = screen.getByTestId('table-body')
    expect(tableBody).toHaveAttribute('data-empty-content', 'No revisions available')
  })

  it('should render revision entries when data exists', () => {
    const mockRevisions = [
      {
        id: '1',
        number: '1.0.0',
        date: '2025-01-01',
        summary: 'Initial release'
      },
      {
        id: '2', 
        number: '1.0.1',
        date: '2025-01-02',
        summary: 'Bug fixes'
      }
    ]

    mockListState.data = mockRevisions
    render(<RevisionHistoryTable />)

    // Check that revision data is displayed
    const inputs = screen.getAllByTestId('input')
    const datePickers = screen.getAllByTestId('date-picker')
    const deleteButtons = screen.getAllByTestId('icon-button')

    expect(inputs).toHaveLength(4) // 2 version inputs + 2 summary inputs
    expect(datePickers).toHaveLength(2) // 2 date pickers
    expect(deleteButtons).toHaveLength(2) // 2 delete buttons

    // Check input values
    expect(inputs[0]).toHaveValue('1.0.0')
    expect(inputs[1]).toHaveValue('Initial release')
    expect(inputs[2]).toHaveValue('1.0.1')
    expect(inputs[3]).toHaveValue('Bug fixes')

    // Check date picker values
    expect(datePickers[0]).toHaveValue('2025-01-01')
    expect(datePickers[1]).toHaveValue('2025-01-02')
  })

  it('should call addDataEntry when add button is clicked', () => {
    render(<RevisionHistoryTable />)
    
    const addButton = screen.getByTestId('add-button')
    fireEvent.click(addButton)
    
    expect(mockListState.addDataEntry).toHaveBeenCalledTimes(1)
  })

  it('should call updateDataEntry when input values change', () => {
    const mockRevision = {
      id: '1',
      number: '1.0.0',
      date: '2025-01-01',
      summary: 'Initial release'
    }

    mockListState.data = [mockRevision]
    render(<RevisionHistoryTable />)

    const versionInput = screen.getAllByTestId('input')[0]
    fireEvent.change(versionInput, { target: { value: '1.0.1' } })

    expect(mockListState.updateDataEntry).toHaveBeenCalledWith({
      ...mockRevision,
      number: '1.0.1'
    })
  })

  it('should call updateDataEntry when date picker value changes', () => {
    const mockRevision = {
      id: '1',
      number: '1.0.0',
      date: '2025-01-01',
      summary: 'Initial release'
    }

    mockListState.data = [mockRevision]
    render(<RevisionHistoryTable />)

    const datePicker = screen.getByTestId('date-picker')
    fireEvent.change(datePicker, { target: { value: '2025-01-02' } })

    expect(mockListState.updateDataEntry).toHaveBeenCalledWith({
      ...mockRevision,
      date: '2025-01-02'
    })
  })

  it('should call updateDataEntry when summary input changes', () => {
    const mockRevision = {
      id: '1',
      number: '1.0.0',
      date: '2025-01-01',
      summary: 'Initial release'
    }

    mockListState.data = [mockRevision]
    render(<RevisionHistoryTable />)

    const summaryInput = screen.getAllByTestId('input')[1]
    fireEvent.change(summaryInput, { target: { value: 'Updated summary' } })

    expect(mockListState.updateDataEntry).toHaveBeenCalledWith({
      ...mockRevision,
      summary: 'Updated summary'
    })
  })

  it('should call removeDataEntry when delete button is clicked', () => {
    const mockRevision = {
      id: '1',
      number: '1.0.0',
      date: '2025-01-01',
      summary: 'Initial release'
    }

    mockListState.data = [mockRevision]
    render(<RevisionHistoryTable />)

    const deleteButton = screen.getByTestId('icon-button')
    fireEvent.click(deleteButton)

    expect(mockListState.removeDataEntry).toHaveBeenCalledWith(mockRevision)
  })

  it('should have correct CSAF paths for form fields', () => {
    const mockRevision = {
      id: '1',
      number: '1.0.0',
      date: '2025-01-01',
      summary: 'Initial release'
    }

    mockListState.data = [mockRevision]
    render(<RevisionHistoryTable />)

    const inputs = screen.getAllByTestId('input')
    const datePicker = screen.getByTestId('date-picker')

    expect(inputs[0]).toHaveAttribute('data-csaf-path', '/document/tracking/revision_history/0/number')
    expect(datePicker).toHaveAttribute('data-csaf-path', '/document/tracking/revision_history/0/date')
    expect(inputs[1]).toHaveAttribute('data-csaf-path', '/document/tracking/revision_history/0/summary')
  })

  it('should display correct placeholders', () => {
    const mockRevision = {
      id: '1',
      number: '',
      date: '',
      summary: ''
    }

    mockListState.data = [mockRevision]
    render(<RevisionHistoryTable />)

    const inputs = screen.getAllByTestId('input')
    
    expect(inputs[0]).toHaveAttribute('placeholder', 'Enter Version')
    expect(inputs[1]).toHaveAttribute('placeholder', 'Enter Description')
  })
})
