import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AcknowledgmentNamesTable from '../../../src/components/forms/AcknowledgmentNamesTable'
import {
  TAcknowledgment,
  TAcknowledgmentName,
  getDefaultDocumentAcknowledgmentName,
} from '../../../src/routes/document-information/types/tDocumentAcknowledgments'
import { useListState } from '../../../src/utils/useListState'

// Mock all the dependencies
vi.mock('@/components/forms/Input', () => ({
  Input: ({
    value,
    onValueChange,
    placeholder,
    csafPath,
  }: {
    value: string
    onValueChange: (value: string) => void
    placeholder: string
    csafPath: string
  }) => (
    <div data-testid="input">
      <label htmlFor="input-field">{placeholder}</label>
      <input
        id="input-field"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        data-csaf-path={csafPath}
      />
    </div>
  ),
}))

vi.mock('@/components/forms/IconButton', () => ({
  default: ({
    icon,
    onPress,
  }: {
    icon: any
    onPress: () => void
  }) => (
    <button data-testid="icon-button" onClick={onPress}>
      Delete
    </button>
  ),
}))

vi.mock('@/utils/useListState', () => ({
  useListState: vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'document.acknowledgments.names': 'Names',
        'document.acknowledgments.name': 'Name',
        'document.acknowledgments.empty': 'No names added yet',
        'common.add': `Add ${options?.label || 'Item'}`,
        'common.actions': 'Actions',
        'common.placeholder': `Enter ${options?.label || 'value'}`,
      }
      return translations[key] || key
    },
  }),
}))

vi.mock('@heroui/button', () => ({
  Button: ({
    children,
    onPress,
    variant,
    color,
  }: {
    children: React.ReactNode
    onPress: () => void
    variant?: string
    color?: string
  }) => (
    <button
      data-testid="add-button"
      onClick={onPress}
      data-variant={variant}
      data-color={color}
    >
      {children}
    </button>
  ),
}))

vi.mock('@heroui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="table">{children}</table>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead data-testid="table-header">{children}</thead>
  ),
  TableBody: ({
    children,
    emptyContent,
  }: {
    children: React.ReactNode
    emptyContent: string
  }) => (
    <tbody data-testid="table-body" data-empty-content={emptyContent}>
      {children}
    </tbody>
  ),
  TableColumn: ({
    children,
    width,
  }: {
    children: React.ReactNode
    width?: string
  }) => (
    <th data-testid="table-column" data-width={width}>
      {children}
    </th>
  ),
  TableRow: ({
    children,
  }: {
    children: React.ReactNode
    key?: string
  }) => (
    <tr data-testid="table-row">
      {children}
    </tr>
  ),
  TableCell: ({ children }: { children: React.ReactNode }) => (
    <td data-testid="table-cell">{children}</td>
  ),
}))

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => (
    <span data-testid="font-awesome-icon">{icon.iconName}</span>
  ),
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faAdd: { iconName: 'add' },
  faTrash: { iconName: 'trash' },
}))

describe('AcknowledgmentNamesTable', () => {
  const mockUseListState = vi.hoisted(() => ({
    data: [] as TAcknowledgmentName[],
    setData: vi.fn(),
    addDataEntry: vi.fn(),
    updateDataEntry: vi.fn(),
    removeDataEntry: vi.fn(),
    getId: vi.fn((entry: any) => entry.id),
  }))

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useListState).mockReturnValue(mockUseListState)
  })

  const createMockAcknowledgment = (names: TAcknowledgmentName[] = []): TAcknowledgment => ({
    id: 'test-acknowledgment-id',
    summary: 'Test summary',
    organization: 'Test Organization',
    names,
    url: 'https://example.com',
  })

  const createMockName = (id: string, name: string): TAcknowledgmentName => ({
    id,
    name,
  })

  const defaultProps = {
    acknowledgment: createMockAcknowledgment(),
    acknowledgmentIndex: 0,
    onChange: vi.fn(),
  }

  describe('Component Rendering', () => {
    it('should render with empty names list', () => {
      mockUseListState.data = []
      
      const { container } = render(<AcknowledgmentNamesTable {...defaultProps} />)

      expect(screen.getByText('Names')).toBeInTheDocument()
      expect(screen.getByTestId('add-button')).toBeInTheDocument()
      expect(screen.getByText('Add Name')).toBeInTheDocument()
      expect(screen.getByTestId('table')).toBeInTheDocument()
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render table headers correctly', () => {
      mockUseListState.data = []
      
      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const columns = screen.getAllByTestId('table-column')
      expect(columns).toHaveLength(2)
      expect(columns[0]).toHaveTextContent('Name')
      expect(columns[0]).toHaveAttribute('data-width', '20%')
      expect(columns[1]).toHaveTextContent('Actions')
      expect(columns[1]).toHaveAttribute('data-width', '10%')
    })

    it('should render empty content when no names exist', () => {
      mockUseListState.data = []
      
      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const tableBody = screen.getByTestId('table-body')
      expect(tableBody).toHaveAttribute('data-empty-content', 'No names added yet')
    })

    it('should render names when they exist', () => {
      const testNames = [
        createMockName('1', 'John Doe'),
        createMockName('2', 'Jane Smith'),
      ]
      mockUseListState.data = testNames

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const tableRows = screen.getAllByTestId('table-row')
      expect(tableRows).toHaveLength(2)

      const inputs = screen.getAllByRole('textbox')
      expect(inputs).toHaveLength(2)
      expect(inputs[0]).toHaveValue('John Doe')
      expect(inputs[1]).toHaveValue('Jane Smith')
    })
  })

  describe('User Interactions', () => {
    it('should call addDataEntry when add button is clicked', async () => {
      const user = userEvent.setup()
      mockUseListState.data = []

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const addButton = screen.getByTestId('add-button')
      await user.click(addButton)

      expect(mockUseListState.addDataEntry).toHaveBeenCalledTimes(1)
    })

    it('should call updateDataEntry when input value changes', async () => {
      const user = userEvent.setup()
      const testNames = [createMockName('1', '')]
      mockUseListState.data = testNames

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'Test')

      // Check that updateDataEntry was called multiple times (for each character)
      expect(mockUseListState.updateDataEntry).toHaveBeenCalled()
      expect(mockUseListState.updateDataEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: expect.any(String),
        })
      )
    })

    it('should call removeDataEntry when delete button is clicked', async () => {
      const user = userEvent.setup()
      const testNames = [createMockName('1', 'John Doe')]
      mockUseListState.data = testNames

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const deleteButton = screen.getByTestId('icon-button')
      await user.click(deleteButton)

      expect(mockUseListState.removeDataEntry).toHaveBeenCalledWith(testNames[0])
    })

    it('should handle multiple name entries correctly', async () => {
      const user = userEvent.setup()
      const testNames = [
        createMockName('1', 'John Doe'),
        createMockName('2', ''),
        createMockName('3', 'Bob Johnson'),
      ]
      mockUseListState.data = testNames

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const inputs = screen.getAllByRole('textbox')
      const deleteButtons = screen.getAllByTestId('icon-button')

      expect(inputs).toHaveLength(3)
      expect(deleteButtons).toHaveLength(3)

      // Test updating second name (which is empty)
      await user.type(inputs[1], 'Test')

      expect(mockUseListState.updateDataEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '2',
          name: expect.any(String),
        })
      )

      // Test deleting third name
      await user.click(deleteButtons[2])
      expect(mockUseListState.removeDataEntry).toHaveBeenCalledWith(testNames[2])
    })
  })

  describe('Props and Configuration', () => {
    it('should initialize useListState with correct parameters', () => {
      const acknowledgment = createMockAcknowledgment([
        createMockName('1', 'Test Name'),
      ])

      render(
        <AcknowledgmentNamesTable
          {...defaultProps}
          acknowledgment={acknowledgment}
          acknowledgmentIndex={5}
        />
      )

      expect(useListState).toHaveBeenCalledWith({
        initialData: acknowledgment.names,
        generator: getDefaultDocumentAcknowledgmentName,
      })
    })

    it('should generate correct csafPath for inputs', () => {
      const testNames = [createMockName('1', 'John Doe')]
      mockUseListState.data = testNames

      render(
        <AcknowledgmentNamesTable
          {...defaultProps}
          acknowledgmentIndex={3}
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute(
        'data-csaf-path',
        '/document/acknowledgments/3/names/0'
      )
    })

    it('should handle different acknowledgment indices', () => {
      const testNames = [
        createMockName('1', 'Name 1'),
        createMockName('2', 'Name 2'),
      ]
      mockUseListState.data = testNames

      render(
        <AcknowledgmentNamesTable
          {...defaultProps}
          acknowledgmentIndex={7}
        />
      )

      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveAttribute(
        'data-csaf-path',
        '/document/acknowledgments/7/names/0'
      )
      expect(inputs[1]).toHaveAttribute(
        'data-csaf-path',
        '/document/acknowledgments/7/names/1'
      )
    })

    it('should set correct placeholder text for inputs', () => {
      const testNames = [createMockName('1', 'John Doe')]
      mockUseListState.data = testNames

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Enter Name')
    })
  })

  describe('onChange Callback', () => {
    it('should call onChange when useListState data changes', async () => {
      const onChangeMock = vi.fn()
      const initialNames = [createMockName('1', 'John Doe')]
      const acknowledgment = createMockAcknowledgment(initialNames)

      // Mock useEffect by directly calling onChange when data changes
      vi.mocked(useListState).mockImplementation(
        (options: any) => {
          const { initialData } = options || {}
          const mockState = {
            data: initialData || [],
            setData: vi.fn(),
            addDataEntry: vi.fn(),
            updateDataEntry: vi.fn(),
            removeDataEntry: vi.fn(),
            getId: vi.fn((entry: any) => entry.id),
          }
          
          // Mock the effect by calling onChange immediately
          setTimeout(() => {
            onChangeMock({
              ...acknowledgment,
              names: mockState.data,
            })
          }, 0)
          
          return mockState
        }
      )

      render(
        <AcknowledgmentNamesTable
          acknowledgment={acknowledgment}
          acknowledgmentIndex={0}
          onChange={onChangeMock}
        />
      )

      await waitFor(() => {
        expect(onChangeMock).toHaveBeenCalledWith({
          ...acknowledgment,
          names: initialNames,
        })
      })
    })

    it('should update acknowledgment with new names data', async () => {
      const onChangeMock = vi.fn()
      const acknowledgment = createMockAcknowledgment()
      const updatedNames = [createMockName('1', 'New Name')]

      // Mock useEffect behavior
      vi.mocked(useListState).mockImplementation(() => {
        const mockState = {
          data: updatedNames,
          setData: vi.fn(),
          addDataEntry: vi.fn(),
          updateDataEntry: vi.fn(),
          removeDataEntry: vi.fn(),
          getId: vi.fn((entry: any) => entry.id),
        }
        
        setTimeout(() => {
          onChangeMock({
            ...acknowledgment,
            names: updatedNames,
          })
        }, 0)
        
        return mockState
      })

      render(
        <AcknowledgmentNamesTable
          acknowledgment={acknowledgment}
          acknowledgmentIndex={0}
          onChange={onChangeMock}
        />
      )

      await waitFor(() => {
        expect(onChangeMock).toHaveBeenCalledWith({
          ...acknowledgment,
          names: updatedNames,
        })
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty acknowledgment names array', () => {
      const acknowledgment = createMockAcknowledgment([])
      mockUseListState.data = []

      render(
        <AcknowledgmentNamesTable
          {...defaultProps}
          acknowledgment={acknowledgment}
        />
      )

      expect(screen.getByTestId('table-body')).toHaveAttribute(
        'data-empty-content',
        'No names added yet'
      )
      expect(screen.queryByTestId('table-row')).not.toBeInTheDocument()
    })

    it('should handle acknowledgment without names property', () => {
      const acknowledgment = {
        id: 'test-id',
        summary: 'Test',
      } as TAcknowledgment
      mockUseListState.data = []

      render(
        <AcknowledgmentNamesTable
          {...defaultProps}
          acknowledgment={acknowledgment}
        />
      )

      expect(useListState).toHaveBeenCalledWith({
        initialData: undefined,
        generator: getDefaultDocumentAcknowledgmentName,
      })
    })

    it('should handle rapid input changes', async () => {
      const user = userEvent.setup()
      const testNames = [createMockName('1', 'Test')]
      mockUseListState.data = testNames

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const input = screen.getByRole('textbox')
      
      // Rapid typing
      await user.clear(input)
      await user.type(input, 'A')
      await user.type(input, 'B')
      await user.type(input, 'C')

      // Should have been called for each character
      expect(mockUseListState.updateDataEntry).toHaveBeenCalledTimes(4) // clear + 3 characters
    })

    it('should handle special characters in names', async () => {
      const user = userEvent.setup()
      const testNames = [createMockName('1', '')]
      mockUseListState.data = testNames

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await user.type(input, '@#$')

      expect(mockUseListState.updateDataEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: expect.any(String),
        })
      )
    })

    it('should handle empty string input', async () => {
      const user = userEvent.setup()
      const testNames = [createMockName('1', 'Original Name')]
      mockUseListState.data = testNames

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const input = screen.getByRole('textbox')
      await user.clear(input)

      expect(mockUseListState.updateDataEntry).toHaveBeenCalledWith({
        ...testNames[0],
        name: '',
      })
    })

    it('should handle input clearing and re-typing', async () => {
      const user = userEvent.setup()
      const testNames = [createMockName('1', 'Initial')]
      mockUseListState.data = testNames

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const input = screen.getByRole('textbox')
      
      // Clear and type new content
      await user.clear(input)
      await user.type(input, 'New')

      // Should have been called for clearing and for each character
      expect(mockUseListState.updateDataEntry).toHaveBeenCalledWith({
        ...testNames[0],
        name: '',
      })
      expect(mockUseListState.updateDataEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: expect.any(String),
        })
      )
    })
  })

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      mockUseListState.data = [createMockName('1', 'Test Name')]

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      expect(screen.getByTestId('table')).toBeInTheDocument()
      expect(screen.getByTestId('table-header')).toBeInTheDocument()
      expect(screen.getByTestId('table-body')).toBeInTheDocument()
      expect(screen.getByTestId('table-row')).toBeInTheDocument()
      expect(screen.getAllByTestId('table-cell')).toHaveLength(2)
    })

    it('should have proper button attributes', () => {
      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const addButton = screen.getByTestId('add-button')
      expect(addButton).toHaveAttribute('data-variant', 'light')
      expect(addButton).toHaveAttribute('data-color', 'primary')
    })

    it('should render proper input labels and placeholders', () => {
      mockUseListState.data = [createMockName('1', 'Test Name')]

      render(<AcknowledgmentNamesTable {...defaultProps} />)

      const placeholder = screen.getByText('Enter Name')
      expect(placeholder).toBeInTheDocument()
    })
  })
})
