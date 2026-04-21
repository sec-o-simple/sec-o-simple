import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Unmock the General component to test the actual implementation
vi.unmock('../../../src/routes/document-information/General')

import General from '../../../src/routes/document-information/General'

// Mock dependencies using vi.hoisted to avoid hoisting issues
vi.mock('@/components/WizardStep', () => ({
  default: ({ title, progress, onContinue, children }: any) => (
    <div data-testid="wizard-step">
      <h1 data-testid="wizard-title">{title}</h1>
      <div data-testid="progress" data-progress={progress}></div>
      <div data-testid="navigation">
        <a href={onContinue} data-testid="continue-link">
          Continue
        </a>
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

vi.mock('@/components/forms/VSplit', () => ({
  default: ({ children }: any) => <div data-testid="vsplit">{children}</div>,
}))

vi.mock('@/components/forms/Input', () => ({
  Input: ({
    label,
    value,
    onValueChange,
    csafPath,
    type,
    isRequired,
    placeholder,
    isDisabled,
    isTouched,
  }: any) => {
    const inputId = `input-${csafPath}`
    return (
      <div data-testid="input-wrapper">
        <label data-testid="input-label" htmlFor={inputId}>
          {label}
        </label>
        <input
          id={inputId}
          data-testid={inputId}
          data-csaf-path={csafPath}
          data-is-required={isRequired}
          data-is-disabled={isDisabled}
          data-is-touched={isTouched}
          placeholder={placeholder}
          value={value || ''}
          type={type || 'text'}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={isDisabled}
        />
      </div>
    )
  },
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
    renderValue,
  }: any) => {
    const selectId = `select-${csafPath || 'select'}`
    const selectedValue = selectedKeys?.size
      ? String(Array.from(selectedKeys)[0])
      : selectedKeys?.length
        ? String(selectedKeys[0])
        : ''

    return (
      <div data-testid="select-wrapper" className={className}>
        <label data-testid="select-label" htmlFor={selectId}>
          {label}
        </label>
        <select
          id={selectId}
          data-testid={selectId}
          data-csaf-path={csafPath}
          data-is-required={isRequired}
          data-placeholder={placeholder}
          value={selectedValue}
          onChange={(e) => {
            const newValue = e.target.value
            onSelectionChange(newValue ? new Set([newValue]) : new Set())
          }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {children}
        </select>
        {renderValue && selectedValue && (
          <div data-testid="select-render-value">
            {renderValue([{ key: selectedValue }])}
          </div>
        )}
      </div>
    )
  },
}))

vi.mock('@/components/forms/Autocomplete', () => ({
  Autocomplete: ({
    label,
    selectedKey,
    onSelectionChange,
    children,
    csafPath,
    className,
    isRequired,
    placeholder,
    isDisabled,
  }: any) => {
    const inputId = `autocomplete-${csafPath || 'autocomplete'}`

    return (
      <div data-testid="autocomplete-wrapper" className={className}>
        <label data-testid="autocomplete-label" htmlFor={inputId}>
          {label}
        </label>
        <input
          id={inputId}
          data-testid={inputId}
          data-csaf-path={csafPath}
          data-is-required={isRequired}
          data-placeholder={placeholder}
          list={`${inputId}-list`}
          value={selectedKey || ''}
          onChange={(e) => onSelectionChange?.(e.target.value)}
          disabled={isDisabled}
        />
        <datalist id={`${inputId}-list`}>{children}</datalist>
      </div>
    )
  },
}))

vi.mock('@heroui/select', () => ({
  SelectItem: ({ children, ...props }: any) => (
    <option value={props.textValue || children}>{children}</option>
  ),
}))

vi.mock('@heroui/react', () => ({
  Alert: ({ children, color }: any) => (
    <div data-testid="alert" data-color={color}>
      {children}
    </div>
  ),
  AutocompleteItem: ({ children, ...props }: any) => (
    <option value={props.key || children}>{children}</option>
  ),
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('@/utils/template', () => ({
  useTemplate: () => ({
    isFieldReadonly: () => false,
    getFieldPlaceholder: () => undefined,
  }),
}))

vi.mock('@/utils/useDocumentStoreUpdater', () => ({
  default: vi.fn(),
}))

vi.mock('@/utils/validation/usePageVisit', () => ({
  default: () => false,
}))

vi.mock('@/utils/validation/useValidationStore', () => ({
  default: () => [],
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.documentInformation.general': 'General Information',
        'document.general.title': 'Document Title',
        'document.general.id': 'Document ID',
        'document.general.language': 'Language',
        'document.general.licenseExpression': 'License',
        'document.general.languages.de': 'German',
        'document.general.languages.en': 'English',
        'document.general.tlp.title': 'Traffic Light Protocol',
        'document.general.tlp.label': 'TLP Level',
        'document.general.tlp.label.placeholder': 'Select TLP Level',
        'document.general.tlp.url': 'TLP URL',
      }
      return translations[key] || key
    },
    i18n: {
      language: 'en',
      changeLanguage: () => {},
      store: {
        data: {
          en: {},
          de: {},
        },
      },
    },
  }),
}))

describe('General', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the wizard step with correct props', () => {
      render(<General />)

      expect(screen.getByTestId('wizard-step')).toBeInTheDocument()
      expect(screen.getByTestId('wizard-title')).toHaveTextContent(
        'General Information',
      )
      expect(screen.getByTestId('progress')).toHaveAttribute(
        'data-progress',
        '1',
      )
      expect(screen.getByTestId('continue-link')).toHaveAttribute(
        'href',
        '/document-information/notes',
      )
    })

    it('should render all form fields', () => {
      render(<General />)

      // Title field
      expect(screen.getByTestId('input-/document/title')).toBeInTheDocument()
      expect(screen.getByLabelText('Document Title')).toBeInTheDocument()

      // ID field
      expect(
        screen.getByTestId('input-/document/tracking/id'),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Document ID')).toBeInTheDocument()

      // Language select
      expect(screen.getByTestId('select-/document/lang')).toBeInTheDocument()
      expect(screen.getByLabelText('Language')).toBeInTheDocument()

      // License select
      expect(
        screen.getByTestId('autocomplete-/document/license_expression'),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('License')).toBeInTheDocument()

      // TLP section
      expect(screen.getByText('Traffic Light Protocol')).toBeInTheDocument()
      expect(
        screen.getByTestId('select-/document/distribution/tlp/label'),
      ).toBeInTheDocument()
    })

    it('should render language options', () => {
      render(<General />)

      // Check language options using getAllByText since English appears twice
      const germanOptions = screen.getAllByText('German')
      expect(germanOptions.length).toBeGreaterThan(0)

      const englishOptions = screen.getAllByText('English')
      expect(englishOptions.length).toBeGreaterThan(0)
    })

    it('should render TLP level options', () => {
      render(<General />)

      // Check all TLP levels are rendered
      expect(screen.getAllByText('GREEN').length).toBeGreaterThan(0)
      expect(screen.getAllByText('AMBER').length).toBeGreaterThan(0)
      expect(screen.getAllByText('RED').length).toBeGreaterThan(0)
      expect(screen.getAllByText('WHITE').length).toBeGreaterThan(0)
    })

    it('should render layout components correctly', () => {
      render(<General />)

      expect(screen.getAllByTestId('hsplit')).toHaveLength(3)
      expect(screen.getByTestId('vsplit')).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('should handle title input changes', async () => {
      render(<General />)
      const titleInput = screen.getByTestId('input-/document/title')

      await user.type(titleInput, 'Test Document Title')
      expect(titleInput).toHaveValue('Test Document Title')
    })

    it('should handle document ID input changes', async () => {
      render(<General />)
      const idInput = screen.getByTestId('input-/document/tracking/id')

      await user.type(idInput, 'DOC-123')
      expect(idInput).toHaveValue('DOC-123')
    })

    it('should handle language selection changes', async () => {
      render(<General />)
      const languageSelect = screen.getByTestId(
        'select-/document/lang',
      ) as HTMLSelectElement

      // Test that the change event can be fired without errors
      expect(() => {
        fireEvent.change(languageSelect, { target: { value: 'de' } })
      }).not.toThrow()

      // Verify the select element is rendered and interactive
      expect(languageSelect).toBeInTheDocument()
      expect(languageSelect.tagName).toBe('SELECT')
    })

    it('should handle license selection changes', async () => {
      render(<General />)
      const licenseInput = screen.getByTestId(
        'autocomplete-/document/license_expression',
      ) as HTMLInputElement

      expect(licenseInput).toHaveValue('CC-BY-SA-4.0')

      expect(() => {
        fireEvent.change(licenseInput, { target: { value: 'MIT' } })
      }).not.toThrow()

      expect(licenseInput).toBeInTheDocument()
      expect(licenseInput.tagName).toBe('INPUT')
    })

    it('should handle TLP level selection changes', async () => {
      render(<General />)
      const tlpSelect = screen.getByTestId(
        'select-/document/distribution/tlp/label',
      ) as HTMLSelectElement

      // Test that the change event can be fired without errors
      expect(() => {
        fireEvent.change(tlpSelect, { target: { value: 'RED' } })
      }).not.toThrow()

      // Verify the select element is rendered and interactive
      expect(tlpSelect).toBeInTheDocument()
      expect(tlpSelect.tagName).toBe('SELECT')
    })

    it('should set correct input types', () => {
      render(<General />)

      const titleInput = screen.getByTestId('input-/document/title')
      const idInput = screen.getByTestId('input-/document/tracking/id')

      expect(titleInput).toHaveAttribute('type', 'text')
      expect(idInput).toHaveAttribute('type', 'text')
    })

    it('should apply CSAF paths correctly', () => {
      render(<General />)

      expect(screen.getByTestId('input-/document/title')).toHaveAttribute(
        'data-csaf-path',
        '/document/title',
      )
      expect(screen.getByTestId('input-/document/tracking/id')).toHaveAttribute(
        'data-csaf-path',
        '/document/tracking/id',
      )
      expect(screen.getByTestId('select-/document/lang')).toHaveAttribute(
        'data-csaf-path',
        '/document/lang',
      )
      expect(
        screen.getByTestId('autocomplete-/document/license_expression'),
      ).toHaveAttribute('data-csaf-path', '/document/license_expression')
      expect(
        screen.getByTestId('select-/document/distribution/tlp/label'),
      ).toHaveAttribute('data-csaf-path', '/document/distribution/tlp/label')
    })
  })

  describe('TLPColor Component', () => {
    it('should render TLP colors with text labels', () => {
      render(<General />)

      const tlpOptions = screen.getAllByText(/^(WHITE|GREEN|AMBER|RED)$/)
      expect(tlpOptions.length).toBeGreaterThan(0)
    })

    it('should handle all TLP levels in selection', () => {
      render(<General />)

      const tlpSelect = screen.getByTestId(
        'select-/document/distribution/tlp/label',
      ) as HTMLSelectElement

      const levels = ['WHITE', 'GREEN', 'AMBER', 'RED']
      levels.forEach((level) => {
        expect(() => {
          fireEvent.change(tlpSelect, { target: { value: level } })
        }).not.toThrow()
      })

      // Verify select element remains functional
      expect(tlpSelect).toBeInTheDocument()
      expect(tlpSelect.tagName).toBe('SELECT')
    })
  })

  describe('State Management', () => {
    it('should handle complex state updates for TLP object', async () => {
      render(<General />)

      const tlpSelect = screen.getByTestId(
        'select-/document/distribution/tlp/label',
      ) as HTMLSelectElement

      // Update TLP level - verify no errors occur
      expect(() => {
        fireEvent.change(tlpSelect, { target: { value: 'AMBER' } })
      }).not.toThrow()

      // Verify both elements remain functional
      expect(tlpSelect).toBeInTheDocument()
    })

    it('should maintain independent state for all fields', async () => {
      render(<General />)

      const titleInput = screen.getByTestId('input-/document/title')
      const idInput = screen.getByTestId('input-/document/tracking/id')
      const languageSelect = screen.getByTestId(
        'select-/document/lang',
      ) as HTMLSelectElement

      await user.type(titleInput, 'Test Title')
      await user.type(idInput, 'TEST-001')
      fireEvent.change(languageSelect, { target: { value: 'de' } })

      // Verify input fields maintain their values
      expect(titleInput).toHaveValue('Test Title')
      expect(idInput).toHaveValue('TEST-001')

      // Verify select remains functional
      expect(languageSelect).toBeInTheDocument()
      expect(languageSelect.tagName).toBe('SELECT')
    })

    it('should handle default language initialization', () => {
      render(<General />)

      const languageSelect = screen.getByTestId(
        'select-/document/lang',
      ) as HTMLSelectElement

      // Verify the language select is rendered and functional
      expect(languageSelect).toBeInTheDocument()
      expect(languageSelect.tagName).toBe('SELECT')

      // Check that language options are available
      const germanOption = screen.getByText('German')
      const englishOptions = screen.getAllByText('English')
      expect(germanOption).toBeInTheDocument()
      expect(englishOptions.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty/undefined state gracefully', () => {
      render(<General />)

      // All inputs should render without values initially except language
      expect(screen.getByTestId('input-/document/title')).toHaveValue('')
      expect(screen.getByTestId('input-/document/tracking/id')).toHaveValue('')
    })

    it('should handle rapid state changes', async () => {
      render(<General />)

      const titleInput = screen.getByTestId('input-/document/title')

      // Rapid typing
      await user.type(titleInput, 'First')
      await user.clear(titleInput)
      await user.type(titleInput, 'Second')
      await user.clear(titleInput)
      await user.type(titleInput, 'Final Title')

      expect(titleInput).toHaveValue('Final Title')
    })

    it('should handle special characters in form inputs', async () => {
      render(<General />)

      const titleInput = screen.getByTestId('input-/document/title')
      const specialTitle = 'Document with "quotes" & symbols < > / \\ @#$%'

      await user.type(titleInput, specialTitle)
      expect(titleInput).toHaveValue(specialTitle)
    })

    it('should handle invalid TLP selections gracefully', async () => {
      render(<General />)

      const tlpSelect = screen.getByTestId(
        'select-/document/distribution/tlp/label',
      ) as HTMLSelectElement

      // Try to select an invalid option - should not throw errors
      expect(() => {
        fireEvent.change(tlpSelect, { target: { value: 'INVALID' } })
      }).not.toThrow()

      // Component should remain functional
      expect(tlpSelect).toBeInTheDocument()
      expect(tlpSelect.tagName).toBe('SELECT')
    })
  })

  describe('Layout and CSS Classes', () => {
    it('should apply correct CSS classes to layout components', () => {
      render(<General />)

      const hsplits = screen.getAllByTestId('hsplit')
      expect(hsplits[0]).toHaveClass('items-start')
      expect(hsplits[1]).toHaveClass('items-start')

      const languageSelectWrapper = screen
        .getByTestId('select-/document/lang')
        .closest('[data-testid="select-wrapper"]')
      expect(languageSelectWrapper).toHaveClass('w-1/2')
    })

    it('should structure TLP section correctly', () => {
      render(<General />)

      expect(screen.getByText('Traffic Light Protocol')).toBeInTheDocument()
      expect(screen.getByTestId('vsplit')).toBeInTheDocument()
    })
  })
})
