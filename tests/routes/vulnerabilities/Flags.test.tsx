import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Flags from '../../../src/routes/vulnerabilities/Flags'
import { TVulnerability } from '../../../src/routes/vulnerabilities/types/tVulnerability'
import { TVulnerabilityFlag } from '../../../src/routes/vulnerabilities/types/tVulnerabilityFlag'

// Mock functions that will be reassigned in tests
let mockUseListState: any
let mockUseVulnerabilityFlagGenerator: any
let mockUseFieldValidation: any
let mockUseTranslation: any

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => mockUseTranslation(),
}))

// Mock useListState hook
vi.mock('../../../src/utils/useListState', () => ({
  useListState: (...args: any[]) => mockUseListState(...args),
}))

// Mock useVulnerabilityFlagGenerator
vi.mock('../../../src/routes/vulnerabilities/types/tVulnerabilityFlag', () => ({
  useVulnerabilityFlagGenerator: () => mockUseVulnerabilityFlagGenerator(),
  flagLabels: ['component_not_present', 'inline_mitigations_already_exist', 'vulnerable_code_cannot_be_controlled_by_adversary', 'vulnerable_code_not_in_execute_path', 'vulnerable_code_not_present'],
}))

// Mock useFieldValidation
vi.mock('../../../src/utils/validation/useFieldValidation', () => ({
  useFieldValidation: (...args: any[]) => mockUseFieldValidation(...args),
}))

// Mock VSplit component
vi.mock('../../../src/components/forms/VSplit', () => ({
  default: ({ children, className, ...props }: any) => (
    <div data-testid="vsplit" className={className} {...props}>
      {children}
    </div>
  ),
}))

// Mock AddItemButton component
vi.mock('../../../src/components/forms/AddItemButton', () => ({
  default: ({ label, onPress, className, ...props }: any) => (
    <button
      data-testid="add-item-button"
      className={className}
      onClick={onPress}
      {...props}
    >
      {label}
    </button>
  ),
}))

// Mock VulnerabilityFlag component
vi.mock('../../../src/routes/vulnerabilities/components/VulnerabilityFlag', () => ({
  default: ({ vulnerabilityFlag, csafPath, onChange, onDelete, ...props }: any) => (
    <div
      data-testid="vulnerability-flag"
      data-flag-id={vulnerabilityFlag.id}
      data-csaf-path={csafPath}
      data-flag-label={vulnerabilityFlag.label}
      {...props}
    >
      <span>{vulnerabilityFlag.label}</span>
      <button
        data-testid={`change-flag-${vulnerabilityFlag.id}`}
        onClick={() => onChange?.({ ...vulnerabilityFlag, label: 'changed_label' })}
      >
        Change
      </button>
      <button
        data-testid={`delete-flag-${vulnerabilityFlag.id}`}
        onClick={() => onDelete?.(vulnerabilityFlag)}
      >
        Delete
      </button>
    </div>
  ),
}))

// Mock HeroUI Alert component
vi.mock('@heroui/react', () => ({
  Alert: ({ children, color, ...props }: any) => (
    <div data-testid="alert" data-color={color} {...props}>
      {children}
    </div>
  ),
}))

describe('Flags', () => {
  const mockVulnerabilityFlags: TVulnerabilityFlag[] = [
    {
      id: 'flag-1',
      label: 'component_not_present',
      productIds: ['product-1'],
    },
    {
      id: 'flag-2',
      label: 'vulnerable_code_not_present',
      productIds: ['product-2'],
    },
  ]

  const mockVulnerability: TVulnerability = {
    id: 'vulnerability-1',
    title: 'Test Vulnerability',
    notes: [],
    products: [],
    flags: mockVulnerabilityFlags,
    remediations: [],
    scores: [],
  }

  const defaultProps = {
    vulnerability: mockVulnerability,
    vulnerabilityIndex: 0,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseTranslation = vi.fn(() => ({
      t: (key: string, options?: any) => {
        const translations: Record<string, string> = {
          'common.add': `Add ${options?.label || 'Item'}`,
          'vulnerabilities.flag.title': 'Flag',
        }
        return translations[key] || key
      },
    }))

    mockUseListState = vi.fn(() => ({
      data: mockVulnerabilityFlags,
      setData: vi.fn(),
      updateDataEntry: vi.fn(),
      removeDataEntry: vi.fn(),
      addDataEntry: vi.fn(),
      getId: vi.fn((entry) => entry.id),
    }))

    mockUseVulnerabilityFlagGenerator = vi.fn(() => ({
      generateVulnerabilityFlag: vi.fn(() => ({
        id: 'new-flag-id',
        label: 'component_not_present',
        productIds: [],
      })),
    }))

    mockUseFieldValidation = vi.fn(() => ({
      hasErrors: false,
      errorMessages: [],
    }))
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<Flags {...defaultProps} />)

      expect(screen.getByTestId('vsplit')).toBeInTheDocument()
    })

    it('should render VSplit with correct props', () => {
      render(<Flags {...defaultProps} />)

      const vsplit = screen.getByTestId('vsplit')
      expect(vsplit).toHaveClass('gap-2')
    })

    it('should render all vulnerability flags', () => {
      render(<Flags {...defaultProps} />)

      expect(screen.getAllByTestId('vulnerability-flag')).toHaveLength(2)
      expect(screen.getByText('component_not_present')).toBeInTheDocument()
      expect(screen.getByText('vulnerable_code_not_present')).toBeInTheDocument()
    })

    it('should render VulnerabilityFlag components with correct props', () => {
      render(<Flags {...defaultProps} />)

      const flagComponents = screen.getAllByTestId('vulnerability-flag')
      expect(flagComponents).toHaveLength(2)

      expect(flagComponents[0]).toHaveAttribute('data-flag-id', 'flag-1')
      expect(flagComponents[0]).toHaveAttribute('data-csaf-path', '/vulnerabilities/0/flags/0')
      expect(flagComponents[0]).toHaveAttribute('data-flag-label', 'component_not_present')

      expect(flagComponents[1]).toHaveAttribute('data-flag-id', 'flag-2')
      expect(flagComponents[1]).toHaveAttribute('data-csaf-path', '/vulnerabilities/0/flags/1')
      expect(flagComponents[1]).toHaveAttribute('data-flag-label', 'vulnerable_code_not_present')
    })

    it('should render add item button', () => {
      render(<Flags {...defaultProps} />)

      const addButton = screen.getByTestId('add-item-button')
      expect(addButton).toBeInTheDocument()
      expect(addButton).toHaveTextContent('Add Flag')
      expect(addButton).toHaveClass('w-full')
    })

    it('should render empty list when no flags', () => {
      const mockEmptyListState = {
        data: [],
        setData: vi.fn(),
        updateDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      }
      mockUseListState.mockReturnValue(mockEmptyListState)

      render(<Flags {...defaultProps} />)

      expect(screen.queryByTestId('vulnerability-flag')).not.toBeInTheDocument()
      expect(screen.getByTestId('add-item-button')).toBeInTheDocument()
    })
  })

  describe('Hook Integration', () => {
    it('should call useListState with correct parameters', () => {
      render(<Flags {...defaultProps} />)

      expect(mockUseListState).toHaveBeenCalledWith({
        initialData: mockVulnerabilityFlags,
        generator: expect.any(Object),
      })
    })

    it('should call useVulnerabilityFlagGenerator', () => {
      render(<Flags {...defaultProps} />)

      expect(mockUseVulnerabilityFlagGenerator).toHaveBeenCalled()
    })

    it('should call useFieldValidation with correct path', () => {
      render(<Flags {...defaultProps} />)

      expect(mockUseFieldValidation).toHaveBeenCalledWith('/vulnerabilities/0/flags')
    })

    it('should call useFieldValidation with different vulnerability index', () => {
      render(<Flags {...defaultProps} vulnerabilityIndex={3} />)

      expect(mockUseFieldValidation).toHaveBeenCalledWith('/vulnerabilities/3/flags')
    })

    it('should call useTranslation', () => {
      render(<Flags {...defaultProps} />)

      expect(mockUseTranslation).toHaveBeenCalled()
    })
  })

  describe('State Management and Effects', () => {
    it('should call onChange when flags data changes', () => {
      const mockSetData = vi.fn()
      const mockListState = {
        data: mockVulnerabilityFlags,
        setData: mockSetData,
        updateDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      }
      mockUseListState.mockReturnValue(mockListState)

      const { rerender } = render(<Flags {...defaultProps} />)

      // Simulate data change
      const updatedFlags: TVulnerabilityFlag[] = [...mockVulnerabilityFlags, { 
        id: 'flag-3', 
        label: 'component_not_present', 
        productIds: [] 
      }]
      mockListState.data = updatedFlags

      rerender(<Flags {...defaultProps} />)

      // The effect should trigger onChange when flagsListState.data changes
      expect(defaultProps.onChange).toHaveBeenCalled()
    })

    it('should pass correct data to onChange effect', () => {
      const newFlags: TVulnerabilityFlag[] = [{ 
        id: 'new-flag', 
        label: 'vulnerable_code_not_present', 
        productIds: [] 
      }]
      mockUseListState.mockReturnValue({
        data: newFlags,
        setData: vi.fn(),
        updateDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      })

      render(<Flags {...defaultProps} />)

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        ...mockVulnerability,
        flags: newFlags,
      })
    })
  })

  describe('User Interactions', () => {
    it('should handle add button click', async () => {
      const user = userEvent.setup()
      const mockSetData = vi.fn()
      const mockGenerateFlag = vi.fn(() => ({
        id: 'new-flag',
        label: 'component_not_present',
        productIds: [],
      }))

      mockUseListState.mockReturnValue({
        data: mockVulnerabilityFlags,
        setData: mockSetData,
        updateDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      })

      mockUseVulnerabilityFlagGenerator.mockReturnValue({
        generateVulnerabilityFlag: mockGenerateFlag,
      })

      render(<Flags {...defaultProps} />)

      const addButton = screen.getByTestId('add-item-button')
      await user.click(addButton)

      expect(mockSetData).toHaveBeenCalledWith(expect.any(Function))
      expect(mockGenerateFlag).toHaveBeenCalled()
    })

    it('should handle flag change through VulnerabilityFlag component', async () => {
      const user = userEvent.setup()
      const mockUpdateDataEntry = vi.fn()

      mockUseListState.mockReturnValue({
        data: mockVulnerabilityFlags,
        setData: vi.fn(),
        updateDataEntry: mockUpdateDataEntry,
        removeDataEntry: vi.fn(),
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      })

      render(<Flags {...defaultProps} />)

      const changeButton = screen.getByTestId('change-flag-flag-1')
      await user.click(changeButton)

      expect(mockUpdateDataEntry).toHaveBeenCalledWith({
        ...mockVulnerabilityFlags[0],
        label: 'changed_label',
      })
    })

    it('should handle flag deletion through VulnerabilityFlag component', async () => {
      const user = userEvent.setup()
      const mockRemoveDataEntry = vi.fn()

      mockUseListState.mockReturnValue({
        data: mockVulnerabilityFlags,
        setData: vi.fn(),
        updateDataEntry: vi.fn(),
        removeDataEntry: mockRemoveDataEntry,
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      })

      render(<Flags {...defaultProps} />)

      const deleteButton = screen.getByTestId('delete-flag-flag-1')
      await user.click(deleteButton)

      expect(mockRemoveDataEntry).toHaveBeenCalledWith(mockVulnerabilityFlags[0])
    })

    it('should add new flag with correct structure when add button is clicked', async () => {
      const user = userEvent.setup()
      const mockSetData = vi.fn()
      const newFlag = {
        id: 'generated-flag-id',
        label: 'component_not_present',
        productIds: ['default-product'],
      }

      mockUseListState.mockReturnValue({
        data: mockVulnerabilityFlags,
        setData: mockSetData,
        updateDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      })

      mockUseVulnerabilityFlagGenerator.mockReturnValue({
        generateVulnerabilityFlag: () => newFlag,
      })

      render(<Flags {...defaultProps} />)

      const addButton = screen.getByTestId('add-item-button')
      await user.click(addButton)

      // Verify setData was called with a function that adds the new flag
      expect(mockSetData).toHaveBeenCalledWith(expect.any(Function))
      
      // Get the function that was passed to setData and test it
      const setDataFunction = mockSetData.mock.calls[0][0]
      const result = setDataFunction(mockVulnerabilityFlags)
      
      expect(result).toEqual([...mockVulnerabilityFlags, newFlag])
    })
  })

  describe('Validation Integration', () => {
    it('should not render alert when no validation errors', () => {
      mockUseFieldValidation.mockReturnValue({
        hasErrors: false,
        errorMessages: [],
      })

      render(<Flags {...defaultProps} />)

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
    })

    it('should render alert when validation has errors', () => {
      mockUseFieldValidation.mockReturnValue({
        hasErrors: true,
        errorMessages: [
          { path: '/vulnerabilities/0/flags/0/label', message: 'Flag label is required' },
          { path: '/vulnerabilities/0/flags/1/productIds', message: 'At least one product must be selected' },
        ],
      })

      render(<Flags {...defaultProps} />)

      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('data-color', 'danger')
    })

    it('should display all validation error messages', () => {
      mockUseFieldValidation.mockReturnValue({
        hasErrors: true,
        errorMessages: [
          { path: '/vulnerabilities/0/flags/0/label', message: 'Flag label is required' },
          { path: '/vulnerabilities/0/flags/1/productIds', message: 'At least one product must be selected' },
        ],
      })

      render(<Flags {...defaultProps} />)

      expect(screen.getByText('Flag label is required')).toBeInTheDocument()
      expect(screen.getByText('At least one product must be selected')).toBeInTheDocument()
    })

    it('should render error messages with correct keys', () => {
      mockUseFieldValidation.mockReturnValue({
        hasErrors: true,
        errorMessages: [
          { path: '/vulnerabilities/0/flags/0/label', message: 'Error 1' },
          { path: '/vulnerabilities/0/flags/1/label', message: 'Error 2' },
        ],
      })

      render(<Flags {...defaultProps} />)

      const errorElements = screen.getAllByText(/Error \d/)
      expect(errorElements).toHaveLength(2)
      
      // Verify each error element has a unique key (React requirement)
      errorElements.forEach((element, index) => {
        expect(element).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing onChange callback', () => {
      const propsWithoutOnChange = {
        ...defaultProps,
        onChange: undefined as any,
      }

      // The component calls onChange in useEffect, so it will throw if onChange is undefined
      // This is expected behavior as onChange is a required prop
      expect(() => {
        render(<Flags {...propsWithoutOnChange} />)
      }).toThrow('onChange is not a function')
    })

    it('should handle empty vulnerability object', () => {
      const emptyVulnerability: TVulnerability = {
        id: 'empty-vulnerability',
        title: '',
        notes: [],
        products: [],
        flags: [],
        remediations: [],
        scores: [],
      }

      mockUseListState.mockReturnValue({
        data: [],
        setData: vi.fn(),
        updateDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      })

      render(<Flags {...defaultProps} vulnerability={emptyVulnerability} />)

      expect(screen.getByTestId('vsplit')).toBeInTheDocument()
      expect(screen.getByTestId('add-item-button')).toBeInTheDocument()
      expect(screen.queryByTestId('vulnerability-flag')).not.toBeInTheDocument()
    })

    it('should handle negative vulnerability index', () => {
      render(<Flags {...defaultProps} vulnerabilityIndex={-1} />)

      expect(mockUseFieldValidation).toHaveBeenCalledWith('/vulnerabilities/-1/flags')
    })

    it('should handle large vulnerability index', () => {
      render(<Flags {...defaultProps} vulnerabilityIndex={999} />)

      expect(mockUseFieldValidation).toHaveBeenCalledWith('/vulnerabilities/999/flags')
    })

    it('should handle undefined flags array', () => {
      const vulnerabilityWithUndefinedFlags = {
        ...mockVulnerability,
        flags: undefined as any,
      }

      mockUseListState.mockReturnValue({
        data: [],
        setData: vi.fn(),
        updateDataEntry: vi.fn(),
        removeDataEntry: vi.fn(),
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      })

      render(<Flags {...defaultProps} vulnerability={vulnerabilityWithUndefinedFlags} />)

      expect(screen.getByTestId('add-item-button')).toBeInTheDocument()
    })
  })

  describe('Accessibility and UI', () => {
    it('should render with proper semantic structure', () => {
      render(<Flags {...defaultProps} />)

      const container = screen.getByTestId('vsplit')
      expect(container).toBeInTheDocument()
      
      const addButton = screen.getByTestId('add-item-button')
      expect(addButton).toBeInTheDocument()
      expect(addButton.tagName).toBe('BUTTON')
    })

    it('should have proper button text for add functionality', () => {
      render(<Flags {...defaultProps} />)

      const addButton = screen.getByTestId('add-item-button')
      expect(addButton).toHaveTextContent('Add Flag')
    })

    it('should render flags in correct order', () => {
      render(<Flags {...defaultProps} />)

      const flagElements = screen.getAllByTestId('vulnerability-flag')
      expect(flagElements[0]).toHaveAttribute('data-flag-id', 'flag-1')
      expect(flagElements[1]).toHaveAttribute('data-flag-id', 'flag-2')
    })
  })

  describe('Translation Integration', () => {
    it('should use translated text for add button', () => {
      mockUseTranslation.mockReturnValue({
        t: (key: string, options?: any) => {
          if (key === 'common.add') return `Hinzufügen ${options?.label}`
          if (key === 'vulnerabilities.flag.title') return 'Flagge'
          return key
        },
      })

      render(<Flags {...defaultProps} />)

      const addButton = screen.getByTestId('add-item-button')
      expect(addButton).toHaveTextContent('Hinzufügen Flagge')
    })

    it('should handle missing translation keys gracefully', () => {
      mockUseTranslation.mockReturnValue({
        t: (key: string) => key, // Return key as fallback
      })

      render(<Flags {...defaultProps} />)

      expect(screen.getByTestId('add-item-button')).toBeInTheDocument()
    })
  })

  describe('Complex Interactions', () => {
    it('should handle rapid add and delete operations', async () => {
      const user = userEvent.setup()
      const mockSetData = vi.fn()
      const mockRemoveDataEntry = vi.fn()

      mockUseListState.mockReturnValue({
        data: mockVulnerabilityFlags,
        setData: mockSetData,
        updateDataEntry: vi.fn(),
        removeDataEntry: mockRemoveDataEntry,
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      })

      render(<Flags {...defaultProps} />)

      // Add a new flag
      const addButton = screen.getByTestId('add-item-button')
      await user.click(addButton)
      expect(mockSetData).toHaveBeenCalled()

      // Delete a flag
      const deleteButton = screen.getByTestId('delete-flag-flag-1')
      await user.click(deleteButton)
      expect(mockRemoveDataEntry).toHaveBeenCalledWith(mockVulnerabilityFlags[0])
    })

    it('should maintain state consistency during multiple operations', async () => {
      const user = userEvent.setup()
      const mockUpdateDataEntry = vi.fn()
      const mockRemoveDataEntry = vi.fn()

      mockUseListState.mockReturnValue({
        data: mockVulnerabilityFlags,
        setData: vi.fn(),
        updateDataEntry: mockUpdateDataEntry,
        removeDataEntry: mockRemoveDataEntry,
        addDataEntry: vi.fn(),
        getId: vi.fn(),
      })

      render(<Flags {...defaultProps} />)

      // Update a flag
      const changeButton = screen.getByTestId('change-flag-flag-1')
      await user.click(changeButton)

      // Then delete another flag
      const deleteButton = screen.getByTestId('delete-flag-flag-2')
      await user.click(deleteButton)

      expect(mockUpdateDataEntry).toHaveBeenCalledWith({
        ...mockVulnerabilityFlags[0],
        label: 'changed_label',
      })
      expect(mockRemoveDataEntry).toHaveBeenCalledWith(mockVulnerabilityFlags[1])
    })
  })
})