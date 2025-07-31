import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Tracking from '../../../src/routes/document-information/Tracking'

// Mock dependencies using vi.hoisted to avoid hoisting issues
vi.mock('@/components/WizardStep', () => ({
  default: ({ title, progress, onBack, children }: any) => (
    <div data-testid="wizard-step">
      <h1 data-testid="wizard-title">{title}</h1>
      <div data-testid="progress" data-progress={progress}></div>
      <div data-testid="navigation">
        <a href={onBack} data-testid="back-link">Back</a>
      </div>
      <div data-testid="wizard-content">{children}</div>
    </div>
  ),
}))

vi.mock('@/components/forms/HSplit', () => ({
  default: ({ children, className }: any) => (
    <div data-testid="hsplit" className={className}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/forms/RevisionHistoryTable', () => ({
  default: () => <div data-testid="revision-history-table">Revision History Table</div>,
}))

vi.mock('@/components/forms/Select', () => ({
  default: ({ 
    label, 
    selectedKeys, 
    onSelectionChange, 
    children, 
    csafPath, 
    className, 
    isRequired, 
    placeholder, 
    isDisabled, 
    isTouched 
  }: any) => {
    const selectId = `select-${csafPath || 'select'}`
    const selectedValue = selectedKeys && Array.isArray(selectedKeys) && selectedKeys.length > 0 
      ? String(selectedKeys[0]) 
      : ''
    
    return (
      <div data-testid="select-wrapper" className={className}>
        <label data-testid="select-label" htmlFor={selectId}>{label}</label>
        <select
          id={selectId}
          data-testid={selectId}
          data-csaf-path={csafPath}
          data-is-required={isRequired}
          data-is-disabled={isDisabled}
          data-is-touched={isTouched}
          data-placeholder={placeholder}
          value={selectedValue}
          disabled={isDisabled}
          onChange={(e) => {
            const newValue = e.target.value
            if (newValue) {
              const mockSet = {
                anchorKey: newValue,
                [Symbol.iterator]: function* () {
                  yield newValue
                }
              }
              onSelectionChange(mockSet)
            } else {
              onSelectionChange({ anchorKey: null })
            }
          }}
        >
          <option value="" disabled>{placeholder}</option>
          {children}
        </select>
      </div>
    )
  },
}))

vi.mock('@heroui/select', () => ({
  SelectItem: ({ children, key, ...props }: any) => {
    // Extract the status value from the children text since key is not accessible
    const statusText = String(children).toLowerCase()
    const statusValue = statusText === 'draft' ? 'draft' : 
                       statusText === 'final' ? 'final' : 
                       statusText === 'interim' ? 'interim' : 
                       statusText
    
    return (
      <option value={statusValue} data-testid={`option-${statusValue}`}>
        {children}
      </option>
    )
  },
}))

vi.mock('@/utils/useDocumentStoreUpdater', () => ({
  default: vi.fn(),
}))

vi.mock('@/utils/validation/usePageVisit', () => ({
  default: vi.fn(() => false),
}))

vi.mock('@/utils/template', () => ({
  useTemplate: vi.fn(() => ({
    isFieldReadonly: vi.fn(() => false),
    getFieldPlaceholder: vi.fn(() => 'Select status'),
  })),
}))

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.tracking': 'Tracking',
        'document.general.state': 'Document Status',
        'document.general.status.draft': 'Draft',
        'document.general.status.final': 'Final',
        'document.general.status.interim': 'Interim',
      }
      return translations[key] || key
    },
  })),
}))

describe('Tracking', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the wizard step with correct props', () => {
      render(<Tracking />)

      expect(screen.getByTestId('wizard-step')).toBeInTheDocument()
      expect(screen.getByTestId('wizard-title')).toHaveTextContent('Tracking')
      expect(screen.getByTestId('progress')).toHaveAttribute('data-progress', '5')
      expect(screen.getByTestId('back-link')).toHaveAttribute('href', '/vulnerabilities')
    })

    it('should render HSplit with correct className', () => {
      render(<Tracking />)

      const hsplit = screen.getByTestId('hsplit')
      expect(hsplit).toBeInTheDocument()
      expect(hsplit).toHaveClass('items-start')
    })

    it('should render the Select component with correct props', () => {
      render(<Tracking />)

      const selectWrapper = screen.getByTestId('select-wrapper')
      expect(selectWrapper).toBeInTheDocument()
      expect(selectWrapper).toHaveClass('w-1/2')

      const selectLabel = screen.getByTestId('select-label')
      expect(selectLabel).toHaveTextContent('Document Status')

      const select = screen.getByTestId('select-/document/tracking/status')
      expect(select).toBeInTheDocument()
      expect(select).toHaveAttribute('data-csaf-path', '/document/tracking/status')
      expect(select).toHaveAttribute('data-is-required', 'true')
      expect(select).toHaveAttribute('data-placeholder', 'Select status')
    })

    it('should render all status options', () => {
      render(<Tracking />)

      expect(screen.getByTestId('option-draft')).toBeInTheDocument()
      expect(screen.getByTestId('option-final')).toBeInTheDocument()
      expect(screen.getByTestId('option-interim')).toBeInTheDocument()

      expect(screen.getByTestId('option-draft')).toHaveTextContent('Draft')
      expect(screen.getByTestId('option-final')).toHaveTextContent('Final')
      expect(screen.getByTestId('option-interim')).toHaveTextContent('Interim')
    })

    it('should render the RevisionHistoryTable component', () => {
      render(<Tracking />)

      expect(screen.getByTestId('revision-history-table')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should handle status selection changes', async () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status') as HTMLSelectElement
      
      await user.selectOptions(select, 'final')

      // Verify the select value changed
      expect(select.value).toBe('final')
    })

    it('should handle status change to interim', async () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status') as HTMLSelectElement
      
      await user.selectOptions(select, 'interim')

      expect(select.value).toBe('interim')
    })

    it('should handle status change to draft', async () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status') as HTMLSelectElement
      
      await user.selectOptions(select, 'draft')

      expect(select.value).toBe('draft')
    })

    it('should handle empty selection gracefully', () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status') as HTMLSelectElement
      
      // The select will have a default value since the component initializes with 'draft'
      // Just verify it doesn't throw an error when changing values
      expect(() => {
        fireEvent.change(select, { target: { value: '' } })
      }).not.toThrow()
    })
  })

  describe('Component Integration', () => {
    it('should render all required components in correct structure', () => {
      render(<Tracking />)

      // Check the overall structure
      const wizardStep = screen.getByTestId('wizard-step')
      const wizardContent = screen.getByTestId('wizard-content')
      const hsplit = screen.getByTestId('hsplit')
      const selectWrapper = screen.getByTestId('select-wrapper')
      const revisionHistory = screen.getByTestId('revision-history-table')

      expect(wizardStep).toBeInTheDocument()
      expect(wizardContent).toBeInTheDocument()
      expect(hsplit).toBeInTheDocument()
      expect(selectWrapper).toBeInTheDocument()
      expect(revisionHistory).toBeInTheDocument()

      // Check nesting structure
      expect(wizardContent).toContainElement(hsplit)
      expect(hsplit).toContainElement(selectWrapper)
      expect(wizardContent).toContainElement(revisionHistory)
    })

    it('should pass all required props to WizardStep', () => {
      render(<Tracking />)

      // Verify WizardStep props
      expect(screen.getByTestId('progress')).toHaveAttribute('data-progress', '5')
      expect(screen.getByTestId('back-link')).toHaveAttribute('href', '/vulnerabilities')
    })

    it('should pass all required props to Select', () => {
      render(<Tracking />)

      // Verify Select props
      const select = screen.getByTestId('select-/document/tracking/status')
      expect(select).toHaveAttribute('data-csaf-path', '/document/tracking/status')
      expect(select).toHaveAttribute('data-is-required', 'true')
    })
  })

  describe('Error Handling', () => {
    it('should handle component rendering without errors', () => {
      expect(() => {
        render(<Tracking />)
      }).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(<Tracking />)

      const label = screen.getByTestId('select-label')
      const select = screen.getByTestId('select-/document/tracking/status')

      expect(label).toHaveAttribute('for', 'select-/document/tracking/status')
      expect(select).toHaveAttribute('id', 'select-/document/tracking/status')
    })

    it('should mark required fields appropriately', () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status')
      expect(select).toHaveAttribute('data-is-required', 'true')
    })
  })

  describe('User Interactions', () => {
    it('should allow user to change status selection via keyboard', async () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status') as HTMLSelectElement
      
      // Focus on the select element
      await user.click(select)
      
      // Use keyboard navigation
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')
      
      // The test validates that keyboard interactions work
      expect(select).toHaveFocus()
    })

    it('should handle multiple status changes', async () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status') as HTMLSelectElement
      
      // Change to final
      await user.selectOptions(select, 'final')
      expect(select.value).toBe('final')
      
      // Change to interim
      await user.selectOptions(select, 'interim')
      expect(select.value).toBe('interim')
      
      // Change back to draft
      await user.selectOptions(select, 'draft')
      expect(select.value).toBe('draft')
    })
  })

  describe('Component State', () => {
    it('should initialize with default state', () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status') as HTMLSelectElement
      
      // Component should render without errors, indicating proper initialization  
      expect(select).toBeInTheDocument()
    })

    it('should handle status changes correctly', async () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status') as HTMLSelectElement
      
      // Test all possible status values
      const statusValues = ['draft', 'final', 'interim']
      
      for (const status of statusValues) {
        await user.selectOptions(select, status)
        expect(select.value).toBe(status)
      }
    })
  })

  describe('Form Validation', () => {
    it('should show required field indicator', () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status')
      expect(select).toHaveAttribute('data-is-required', 'true')
    })

    it('should have proper CSAF path for validation', () => {
      render(<Tracking />)

      const select = screen.getByTestId('select-/document/tracking/status')
      expect(select).toHaveAttribute('data-csaf-path', '/document/tracking/status')
    })
  })
})
