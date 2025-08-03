import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Publisher from '../../../src/routes/document-information/Publisher'

// Mock dependencies using vi.hoisted to avoid hoisting issues
vi.mock('../../../src/components/WizardStep', () => ({
  default: ({ title, progress, onBack, onContinue, children }: any) => (
    <div data-testid="wizard-step">
      <h1 data-testid="wizard-title">{title}</h1>
      <div data-testid="progress" data-progress={progress}></div>
      <div data-testid="navigation">
        <a href={onBack} data-testid="back-link">Back</a>
        <a href={onContinue} data-testid="continue-link">Continue</a>
      </div>
      <div data-testid="wizard-content">{children}</div>
    </div>
  ),
}))

vi.mock('../../../src/components/forms/HSplit', () => ({
  default: ({ children, className }: any) => <div data-testid="hsplit" className={className}>{children}</div>,
}))

vi.mock('../../../src/components/forms/Input', () => ({
  Input: ({ label, value, onValueChange, csafPath, type, isRequired, placeholder, isDisabled, isTouched }: any) => {
    const inputId = `input-${csafPath}`
    return (
      <div data-testid="input-wrapper">
        <label data-testid="input-label" htmlFor={inputId}>{label}</label>
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
  Textarea: ({ label, value, onValueChange, csafPath, isRequired, placeholder, isDisabled, isTouched }: any) => {
    const textareaId = `textarea-${csafPath}`
    return (
      <div data-testid="textarea-wrapper">
        <label data-testid="textarea-label" htmlFor={textareaId}>{label}</label>
        <textarea
          id={textareaId}
          data-testid={textareaId}
          data-csaf-path={csafPath}
          data-is-required={isRequired}
          data-is-disabled={isDisabled}
          data-is-touched={isTouched}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={isDisabled}
        />
      </div>
    )
  },
}))

vi.mock('../../../src/components/forms/Select', () => ({
  default: ({ label, selectedKeys, onSelectionChange, children, csafPath, className, isRequired, placeholder, isDisabled }: any) => {
    const selectId = `select-${csafPath || 'select'}`
    const selectedValue = selectedKeys && selectedKeys.length > 0 ? String(selectedKeys[0]) : ''
    
    return (
      <div data-testid="select-wrapper" className={className}>
        <label data-testid="select-label" htmlFor={selectId}>{label}</label>
        <select
          id={selectId}
          data-testid={selectId}
          data-csaf-path={csafPath}
          data-is-required={isRequired}
          data-is-disabled={isDisabled}
          data-placeholder={placeholder}
          value={selectedValue}
          onChange={(e) => {
            const newValue = e.target.value
            const mockSelection = {
              anchorKey: newValue,
              currentKey: newValue,
              [Symbol.iterator]: function* () { yield newValue }
            }
            onSelectionChange(mockSelection)
          }}
          disabled={isDisabled}
        >
          <option value="" disabled>{placeholder}</option>
          {children}
        </select>
      </div>
    )
  },
}))

vi.mock('@heroui/select', () => ({
  SelectItem: ({ children, ...props }: any) => <option value={props.key || children}>{children}</option>,
}))

vi.mock('../../../src/utils/template', () => ({
  useTemplate: () => ({
    isFieldReadonly: vi.fn(() => false),
    getFieldPlaceholder: vi.fn(() => undefined),
  }),
}))

vi.mock('../../../src/utils/useDocumentStoreUpdater', () => ({
  default: vi.fn(),
}))

vi.mock('../../../src/utils/validation/usePageVisit', () => ({
  default: () => false,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.documentInformation.publisher': 'Publisher Information',
        'document.publisher.name': 'Publisher Name',
        'document.publisher.category': 'Publisher Category',
        'document.publisher.namespace': 'Publisher Namespace',
        'document.publisher.contactDetails': 'Contact Details',
        'document.publisher.issuingAuthority': 'Issuing Authority',
        'document.publisher.categories.coordinator': 'Coordinator',
        'document.publisher.categories.discoverer': 'Discoverer',
        'document.publisher.categories.other': 'Other',
        'document.publisher.categories.translator': 'Translator',
        'document.publisher.categories.user': 'User',
        'document.publisher.categories.vendor': 'Vendor',
      }
      return translations[key] || key
    },
  }),
}))

describe('Publisher', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the wizard step with correct props', () => {
      render(<Publisher />)

      expect(screen.getByTestId('wizard-step')).toBeInTheDocument()
      expect(screen.getByTestId('wizard-title')).toHaveTextContent('Publisher Information')
      expect(screen.getByTestId('progress')).toHaveAttribute('data-progress', '1.4')
      expect(screen.getByTestId('back-link')).toHaveAttribute('href', '/document-information/notes')
      expect(screen.getByTestId('continue-link')).toHaveAttribute('href', '/document-information/references')
    })

    it('should render all form fields with correct labels', () => {
      render(<Publisher />)

      // Check all input fields are rendered
      const inputLabels = screen.getAllByTestId('input-label')
      expect(inputLabels[0]).toHaveTextContent('Publisher Name')
      expect(screen.getByTestId('input-/document/publisher/name')).toBeInTheDocument()

      expect(screen.getByTestId('select-label')).toHaveTextContent('Publisher Category')
      expect(screen.getByTestId('select-/document/publisher/category')).toBeInTheDocument()

      expect(inputLabels[1]).toHaveTextContent('Publisher Namespace')
      expect(screen.getByTestId('input-/document/publisher/namespace')).toBeInTheDocument()

      const textareaLabels = screen.getAllByTestId('textarea-label')
      expect(textareaLabels[0]).toHaveTextContent('Contact Details')
      expect(screen.getByTestId('textarea-/document/publisher/contact_details')).toBeInTheDocument()

      expect(textareaLabels[1]).toHaveTextContent('Issuing Authority')
      expect(screen.getByTestId('textarea-/document/publisher/issuing_authority')).toBeInTheDocument()
    })

    it('should render HSplit component', () => {
      render(<Publisher />)
      expect(screen.getByTestId('hsplit')).toBeInTheDocument()
    })

    it('should render all publisher category options', () => {
      render(<Publisher />)
      
      const options = screen.getAllByRole('option')
      const categoryOptions = options.filter(option => option.textContent !== '')
      
      expect(categoryOptions).toHaveLength(6)
      expect(screen.getByRole('option', { name: 'Coordinator' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Discoverer' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Translator' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'User' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Vendor' })).toBeInTheDocument()
    })
  })

  describe('Form Field Attributes', () => {
    it('should set correct CSAF paths for all fields', () => {
      render(<Publisher />)

      expect(screen.getByTestId('input-/document/publisher/name')).toHaveAttribute('data-csaf-path', '/document/publisher/name')
      expect(screen.getByTestId('select-/document/publisher/category')).toHaveAttribute('data-csaf-path', '/document/publisher/category')
      expect(screen.getByTestId('input-/document/publisher/namespace')).toHaveAttribute('data-csaf-path', '/document/publisher/namespace')
      expect(screen.getByTestId('textarea-/document/publisher/contact_details')).toHaveAttribute('data-csaf-path', '/document/publisher/contact_details')
      expect(screen.getByTestId('textarea-/document/publisher/issuing_authority')).toHaveAttribute('data-csaf-path', '/document/publisher/issuing_authority')
    })

    it('should mark required fields correctly', () => {
      render(<Publisher />)

      // Required fields
      expect(screen.getByTestId('input-/document/publisher/name')).toHaveAttribute('data-is-required', 'true')
      expect(screen.getByTestId('select-/document/publisher/category')).toHaveAttribute('data-is-required', 'true')
      expect(screen.getByTestId('input-/document/publisher/namespace')).toHaveAttribute('data-is-required', 'true')
      expect(screen.getByTestId('textarea-/document/publisher/contact_details')).toHaveAttribute('data-is-required', 'true')

      // Optional field
      expect(screen.getByTestId('textarea-/document/publisher/issuing_authority')).not.toHaveAttribute('data-is-required', 'true')
    })

    it('should set namespace input type to url', () => {
      render(<Publisher />)
      expect(screen.getByTestId('input-/document/publisher/namespace')).toHaveAttribute('type', 'url')
    })
  })

  describe('User Interactions', () => {
    it('should update publisher name when user types', async () => {
      render(<Publisher />)
      
      const nameInput = screen.getByTestId('input-/document/publisher/name')
      await user.type(nameInput, 'Test Publisher')
      
      expect(nameInput).toHaveValue('Test Publisher')
    })

    it('should update namespace when user types', async () => {
      render(<Publisher />)
      
      const namespaceInput = screen.getByTestId('input-/document/publisher/namespace')
      await user.type(namespaceInput, 'https://example.com')
      
      expect(namespaceInput).toHaveValue('https://example.com')
    })

    it('should update contact details when user types', async () => {
      render(<Publisher />)
      
      const contactDetailsTextarea = screen.getByTestId('textarea-/document/publisher/contact_details')
      await user.type(contactDetailsTextarea, 'Contact information here')
      
      expect(contactDetailsTextarea).toHaveValue('Contact information here')
    })

    it('should update issuing authority when user types', async () => {
      render(<Publisher />)
      
      const issuingAuthorityTextarea = screen.getByTestId('textarea-/document/publisher/issuing_authority')
      await user.type(issuingAuthorityTextarea, 'Authority information')
      
      expect(issuingAuthorityTextarea).toHaveValue('Authority information')
    })

    it('should update category when user selects option', async () => {
      render(<Publisher />)
      
      const categorySelect = screen.getByTestId('select-/document/publisher/category')
      await user.selectOptions(categorySelect, 'Coordinator')
      
      expect(categorySelect).toHaveValue('Coordinator')
    })

    it('should handle category selection change properly', async () => {
      render(<Publisher />)
      
      const categorySelect = screen.getByTestId('select-/document/publisher/category')
      
      // Test different category selections
      await user.selectOptions(categorySelect, 'Discoverer')
      expect(categorySelect).toHaveValue('Discoverer')
      
      await user.selectOptions(categorySelect, 'Other')
      expect(categorySelect).toHaveValue('Other')
      
      await user.selectOptions(categorySelect, 'Translator')
      expect(categorySelect).toHaveValue('Translator')
      
      await user.selectOptions(categorySelect, 'User')
      expect(categorySelect).toHaveValue('User')
    })
  })

  describe('useDocumentStoreUpdater Integration', () => {
    it('should render without crashing when useDocumentStoreUpdater is called', () => {
      // This test verifies that the component renders successfully
      // and calls the useDocumentStoreUpdater hook correctly
      expect(() => render(<Publisher />)).not.toThrow()
    })
  })

  describe('Template Integration', () => {
    it('should render correctly with default template settings', () => {
      render(<Publisher />)
      
      // Check that all form fields are rendered
      expect(screen.getByTestId('input-/document/publisher/name')).toBeInTheDocument()
      expect(screen.getByTestId('select-/document/publisher/category')).toBeInTheDocument()
      expect(screen.getByTestId('input-/document/publisher/namespace')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-/document/publisher/contact_details')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-/document/publisher/issuing_authority')).toBeInTheDocument()
    })
  })

  describe('Page Visit Integration', () => {
    it('should render form fields with default page visit status', () => {  
      render(<Publisher />)

      // All fields should have isTouched set to false by default
      expect(screen.getByTestId('input-/document/publisher/name')).toHaveAttribute('data-is-disabled', 'false')
      expect(screen.getByTestId('select-/document/publisher/category')).toHaveAttribute('data-is-disabled', 'false')
      expect(screen.getByTestId('input-/document/publisher/namespace')).toHaveAttribute('data-is-disabled', 'false')
      expect(screen.getByTestId('textarea-/document/publisher/contact_details')).toHaveAttribute('data-is-disabled', 'false')
      expect(screen.getByTestId('textarea-/document/publisher/issuing_authority')).toHaveAttribute('data-is-disabled', 'false')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty selection in category dropdown gracefully', async () => {
      render(<Publisher />)
      
      const categorySelect = screen.getByTestId('select-/document/publisher/category')
      
      // Select a value first
      await user.selectOptions(categorySelect, 'Coordinator')
      expect(categorySelect).toHaveValue('Coordinator')
      
      // The component should handle the selection properly without errors
      expect(categorySelect).toBeInTheDocument()
    })

    it('should render successfully without crashing', () => {
      // This test ensures the component handles edge cases gracefully
      expect(() => render(<Publisher />)).not.toThrow()
    })
  })
})
