import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Unmock the Acknowledgments component to test the actual implementation
vi.unmock('../../../src/routes/document-information/Acknowledgments')

import Acknowledgments from '../../../src/routes/document-information/Acknowledgments'
import {
  TAcknowledgment,
  getDefaultDocumentAcknowledgment,
} from '../../../src/routes/document-information/types/tDocumentAcknowledgments'

// Mock all the dependencies
vi.mock('@/components/StatusIndicator', () => ({
  default: ({
    hasErrors,
    hasVisited,
  }: {
    hasErrors: boolean
    hasVisited: boolean
  }) => (
    <div
      data-testid="status-indicator"
      data-has-errors={hasErrors}
      data-has-visited={hasVisited}
    >
      Status Indicator
    </div>
  ),
}))

vi.mock('@/components/WizardStep', () => ({
  default: ({
    title,
    progress,
    onBack,
    onContinue,
    children,
  }: {
    title: string
    progress: number
    onBack: string
    onContinue: string
    children: React.ReactNode
  }) => (
    <div data-testid="wizard-step">
      <h1 data-testid="wizard-title">{title}</h1>
      <div data-testid="progress" data-progress={progress}></div>
      <div data-testid="navigation">
        <a href={onBack} data-testid="back-link">
          Back
        </a>
        <a href={onContinue} data-testid="continue-link">
          Continue
        </a>
      </div>
      <div data-testid="wizard-content">{children}</div>
    </div>
  ),
}))

vi.mock('@/components/forms/AcknowledgmentNamesTable', () => ({
  default: ({
    acknowledgment,
    acknowledgmentIndex,
    onChange,
  }: {
    acknowledgment: TAcknowledgment
    acknowledgmentIndex: number
    onChange: (ack: TAcknowledgment) => void
  }) => (
    <div data-testid="acknowledgment-names-table">
      <span data-testid="ack-index">{acknowledgmentIndex}</span>
      <span data-testid="ack-id">{acknowledgment.id}</span>
      <button
        data-testid="update-names"
        onClick={() =>
          onChange({
            ...acknowledgment,
            names: [{ id: 'test', name: 'Test Name' }],
          })
        }
      >
        Update Names
      </button>
    </div>
  ),
}))

vi.mock('@/components/forms/ComponentList', () => ({
  default: ({
    listState,
    title,
    itemLabel,
    itemBgColor,
    startContent: StartContent,
    content,
  }: {
    listState: any
    title: string
    itemLabel: string
    itemBgColor: string
    startContent: React.ComponentType<{ index: number }>
    content: (item: TAcknowledgment, index: number) => React.ReactNode
  }) => (
    <div data-testid="component-list">
      <div data-testid="list-title">{title}</div>
      <div data-testid="item-label">{itemLabel}</div>
      <div data-testid="item-bg-color">{itemBgColor}</div>
      <button data-testid="add-item" onClick={() => listState.addDataEntry()}>
        Add Item
      </button>
      {listState.data.map((item: TAcknowledgment, index: number) => (
        <div key={item.id} data-testid={`list-item-${index}`}>
          <div data-testid={`start-content-${index}`}>
            <StartContent index={index} />
          </div>
          <div data-testid={`item-content-${index}`}>
            {content(item, index)}
          </div>
          <button
            data-testid={`remove-item-${index}`}
            onClick={() => listState.removeDataEntry(item)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  ),
}))

vi.mock('@/components/forms/Input', () => ({
  Input: ({
    label,
    value,
    onValueChange,
    isDisabled,
    placeholder,
    type,
    csafPath,
  }: {
    label: string
    value?: string
    onValueChange: (value: string) => void
    isDisabled?: boolean
    placeholder?: string
    type?: string
    csafPath: string
  }) => (
    <div data-testid="input">
      <label htmlFor={`input-${csafPath}`}>{label}</label>
      <input
        id={`input-${csafPath}`}
        value={value || ''}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={isDisabled}
        placeholder={placeholder}
        type={type}
        data-csaf-path={csafPath}
      />
    </div>
  ),
  Textarea: ({
    label,
    value,
    onValueChange,
    isDisabled,
    placeholder,
    autoFocus,
    csafPath,
  }: {
    label: string
    value?: string
    onValueChange: (value: string) => void
    isDisabled?: boolean
    placeholder?: string
    autoFocus?: boolean
    csafPath: string
  }) => (
    <div data-testid="textarea">
      <label htmlFor={`textarea-${csafPath}`}>{label}</label>
      <textarea
        id={`textarea-${csafPath}`}
        value={value || ''}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={isDisabled}
        placeholder={placeholder}
        autoFocus={autoFocus}
        data-csaf-path={csafPath}
      />
    </div>
  ),
}))

vi.mock('@/components/forms/VSplit', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="vsplit">{children}</div>
  ),
}))

vi.mock('@/utils/template', () => ({
  checkReadOnly: vi.fn(() => false),
  getPlaceholder: vi.fn(
    (obj: any, field: string) => `Placeholder for ${field}`,
  ),
}))

vi.mock('@/utils/useDocumentStoreUpdater')

vi.mock('@/utils/useListState', () => ({
  useListState: vi.fn(),
}))

vi.mock('@/utils/validation/useFieldValidation', () => ({
  useFieldValidation: vi.fn(),
}))

vi.mock('@/utils/validation/useListValidation', () => ({
  useListValidation: vi.fn(),
}))

vi.mock('@/utils/validation/usePageVisit', () => ({
  default: vi.fn(),
}))

vi.mock('@/utils/validation/useValidationStore', () => ({
  default: vi.fn(),
}))

vi.mock('@heroui/react', () => ({
  Alert: ({
    color,
    children,
    className,
  }: {
    color: string
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="alert" data-color={color} className={className}>
      {children}
    </div>
  ),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'nav.documentInformation.acknowledgments': 'Acknowledgments',
        'document.acknowledgments.acknowledgment': 'Acknowledgment',
        'document.acknowledgments.organization': 'Organization',
        'document.acknowledgments.summary': 'Summary',
        'document.acknowledgments.url': 'URL',
      }
      return translations[key] || key
    },
  }),
}))

// Import mocked modules
import useDocumentStoreUpdater from '../../../src/utils/useDocumentStoreUpdater'
import { useListState } from '../../../src/utils/useListState'
import { useFieldValidation } from '../../../src/utils/validation/useFieldValidation'
import { useListValidation } from '../../../src/utils/validation/useListValidation'
import usePageVisit from '../../../src/utils/validation/usePageVisit'
import useValidationStore from '../../../src/utils/validation/useValidationStore'

describe('Acknowledgments', () => {
  const mockListState = vi.hoisted(() => ({
    data: [] as TAcknowledgment[],
    setData: vi.fn(),
    addDataEntry: vi.fn(),
    updateDataEntry: vi.fn(),
    removeDataEntry: vi.fn(),
    getId: vi.fn((entry: any) => entry.id),
  }))

  const mockListValidation = vi.hoisted(() => ({
    messages: [],
    hasErrors: false,
    hasWarnings: false,
    hasInfos: false,
    errorMessages: [] as Array<{ path: string; message: string }>,
    warningMessages: [],
    infoMessages: [],
    isTouched: false,
    markFieldAsTouched: vi.fn(),
  }))

  const mockFieldValidation = vi.hoisted(() => ({
    messages: [],
    hasErrors: false,
    hasWarnings: false,
    hasInfos: false,
    errorMessages: [],
    warningMessages: [],
    infoMessages: [],
    isTouched: false,
    markFieldAsTouched: vi.fn(),
  }))

  const mockValidationStore = vi.hoisted(() => ({
    messages: [] as Array<{ path: string; message: string; severity: string }>,
  }))

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useListState).mockReturnValue(mockListState)
    vi.mocked(useDocumentStoreUpdater).mockImplementation(() => {})
    vi.mocked(useFieldValidation).mockReturnValue(mockFieldValidation)
    vi.mocked(useListValidation).mockReturnValue(mockListValidation)
    vi.mocked(usePageVisit).mockImplementation(() => true)
    vi.mocked(useValidationStore).mockImplementation((selector: any) => {
      const store = {
        messages: mockValidationStore.messages,
        touchedFields: [],
        visitedPages: [],
        isValidating: false,
        isValid: true,
        hasErrors: false,
        hasWarnings: false,
        hasInfos: false,
        errorMessages: [],
        warningMessages: [],
        infoMessages: [],
        addMessage: vi.fn(),
        removeMessage: vi.fn(),
        clearMessages: vi.fn(),
        markFieldAsTouched: vi.fn(),
        markPageAsVisited: vi.fn(),
      }

      if (typeof selector === 'function') {
        return selector(store)
      }
      return store
    })
  })

  const createMockAcknowledgment = (
    id: string = 'test-id',
  ): TAcknowledgment => ({
    id,
    organization: 'Test Organization',
    summary: 'Test Summary',
    names: [{ id: 'name-1', name: 'Test Name' }],
    url: 'https://example.com',
  })

  describe('Component Rendering', () => {
    it('should render with empty acknowledgments list', () => {
      mockListState.data = []

      const { container } = render(<Acknowledgments />)

      expect(screen.getByTestId('wizard-step')).toBeInTheDocument()
      expect(screen.getByTestId('wizard-title')).toHaveTextContent(
        'Acknowledgments',
      )
      expect(screen.getByTestId('progress')).toHaveAttribute(
        'data-progress',
        '1.8',
      )
      expect(screen.getByTestId('back-link')).toHaveAttribute(
        'href',
        '/document-information/aliases',
      )
      expect(screen.getByTestId('continue-link')).toHaveAttribute(
        'href',
        '/products/families',
      )
      expect(screen.getByTestId('component-list')).toBeInTheDocument()
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render ComponentList with correct props', () => {
      mockListState.data = []

      render(<Acknowledgments />)

      expect(screen.getByTestId('list-title')).toHaveTextContent('organization')
      expect(screen.getByTestId('item-label')).toHaveTextContent(
        'Acknowledgment',
      )
      expect(screen.getByTestId('item-bg-color')).toHaveTextContent(
        'bg-zinc-50',
      )
    })

    it('should render acknowledgments when they exist', () => {
      const testAcknowledgments = [
        createMockAcknowledgment('ack-1'),
        createMockAcknowledgment('ack-2'),
      ]
      mockListState.data = testAcknowledgments

      render(<Acknowledgments />)

      expect(screen.getByTestId('list-item-0')).toBeInTheDocument()
      expect(screen.getByTestId('list-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('start-content-0')).toBeInTheDocument()
      expect(screen.getByTestId('start-content-1')).toBeInTheDocument()
      expect(screen.getByTestId('item-content-0')).toBeInTheDocument()
      expect(screen.getByTestId('item-content-1')).toBeInTheDocument()
    })

    it('should show validation errors when list has errors', () => {
      mockListValidation.isTouched = true
      mockListValidation.hasErrors = true
      mockListValidation.errorMessages = [
        { path: '/document/acknowledgments/0', message: 'Error message 1' },
        { path: '/document/acknowledgments/1', message: 'Error message 2' },
      ]

      render(<Acknowledgments />)

      expect(screen.getByTestId('alert')).toBeInTheDocument()
      expect(screen.getByTestId('alert')).toHaveAttribute(
        'data-color',
        'danger',
      )
      expect(screen.getByText('Error message 1')).toBeInTheDocument()
      expect(screen.getByText('Error message 2')).toBeInTheDocument()
    })

    it('should not show validation errors when list is not touched', () => {
      mockListValidation.isTouched = false
      mockListValidation.hasErrors = true
      mockListValidation.errorMessages = [
        { path: '/document/acknowledgments/0', message: 'Error message' },
      ]

      render(<Acknowledgments />)

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
    })

    it('should not show validation errors when list has no errors', () => {
      mockListValidation.isTouched = true
      mockListValidation.hasErrors = false
      mockListValidation.errorMessages = []

      render(<Acknowledgments />)

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
    })
  })

  describe('Hook Integration', () => {
    it('should initialize useListState with correct generator', () => {
      render(<Acknowledgments />)

      expect(useListState).toHaveBeenCalledWith({
        generator: getDefaultDocumentAcknowledgment,
      })
    })

    it('should call useDocumentStoreUpdater with correct parameters', () => {
      render(<Acknowledgments />)

      expect(useDocumentStoreUpdater).toHaveBeenCalledWith({
        localState: [mockListState.data, expect.any(Function)],
        valueField: 'documentInformation',
        valueUpdater: 'updateDocumentInformation',
        init: expect.any(Function),
      })
    })

    it('should call useListValidation with correct parameters', () => {
      render(<Acknowledgments />)

      expect(useListValidation).toHaveBeenCalledWith(
        '/document/acknowledgments',
        mockListState.data,
      )
    })

    it('should call usePageVisit', () => {
      render(<Acknowledgments />)

      expect(usePageVisit).toHaveBeenCalled()
    })
  })

  describe('StartContent Component', () => {
    it('should render StatusIndicator with correct props when no errors', () => {
      mockFieldValidation.hasErrors = false
      mockListState.data = [createMockAcknowledgment()]

      render(<Acknowledgments />)

      const statusIndicator = screen.getByTestId('status-indicator')
      expect(statusIndicator).toHaveAttribute('data-has-errors', 'false')
      expect(statusIndicator).toHaveAttribute('data-has-visited', 'true')
    })

    it('should render StatusIndicator with errors when field has errors', () => {
      mockFieldValidation.hasErrors = true
      mockListState.data = [createMockAcknowledgment()]

      render(<Acknowledgments />)

      const statusIndicator = screen.getByTestId('status-indicator')
      expect(statusIndicator).toHaveAttribute('data-has-errors', 'true')
      expect(statusIndicator).toHaveAttribute('data-has-visited', 'true')
    })
  })

  describe('AcknowledgmentForm Component', () => {
    it('should render form fields with correct values', () => {
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]

      render(<Acknowledgments />)

      // Organization input
      const orgInput = screen.getByLabelText('Organization')
      expect(orgInput).toHaveValue('Test Organization')
      expect(orgInput).toHaveAttribute(
        'data-csaf-path',
        '/document/acknowledgments/0/organization',
      )

      // Summary textarea
      const summaryTextarea = screen.getByLabelText('Summary')
      expect(summaryTextarea).toHaveValue('Test Summary')
      expect(summaryTextarea).toHaveAttribute(
        'data-csaf-path',
        '/document/acknowledgments/0/summary',
      )

      // URL input
      const urlInput = screen.getByLabelText('URL')
      expect(urlInput).toHaveValue('https://example.com')
      expect(urlInput).toHaveAttribute(
        'data-csaf-path',
        '/document/acknowledgments/0/urls/0',
      )
      expect(urlInput).toHaveAttribute('type', 'url')
    })

    it('should render AcknowledgmentNamesTable with correct props', () => {
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]

      render(<Acknowledgments />)

      expect(
        screen.getByTestId('acknowledgment-names-table'),
      ).toBeInTheDocument()
      expect(screen.getByTestId('ack-index')).toHaveTextContent('0')
      expect(screen.getByTestId('ack-id')).toHaveTextContent(acknowledgment.id)
    })

    it('should show validation error when acknowledgment has error', () => {
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]
      mockValidationStore.messages = [
        {
          path: '/document/acknowledgments/0',
          message: 'Acknowledgment error',
          severity: 'error',
        },
      ]

      render(<Acknowledgments />)

      expect(screen.getByTestId('alert')).toBeInTheDocument()
      expect(screen.getByTestId('alert')).toHaveAttribute(
        'data-color',
        'danger',
      )
      expect(screen.getByText('Acknowledgment error')).toBeInTheDocument()
    })

    it('should not show validation error when acknowledgment has non-error message', () => {
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]
      mockValidationStore.messages = [
        {
          path: '/document/acknowledgments/0',
          message: 'Warning message',
          severity: 'warning',
        },
      ]

      render(<Acknowledgments />)

      expect(screen.queryByText('Warning message')).not.toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should handle organization input change', async () => {
      const user = userEvent.setup()
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]

      render(<Acknowledgments />)

      const orgInput = screen.getByLabelText('Organization')

      // Simulate the onChange event directly
      fireEvent.change(orgInput, { target: { value: 'New Organization' } })

      expect(mockListState.updateDataEntry).toHaveBeenCalledWith({
        ...acknowledgment,
        organization: 'New Organization',
      })
    })

    it('should handle summary textarea change', async () => {
      const user = userEvent.setup()
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]

      render(<Acknowledgments />)

      const summaryTextarea = screen.getByLabelText('Summary')

      // Simulate the onChange event directly
      fireEvent.change(summaryTextarea, { target: { value: 'New Summary' } })

      expect(mockListState.updateDataEntry).toHaveBeenCalledWith({
        ...acknowledgment,
        summary: 'New Summary',
      })
    })

    it('should handle URL input change', async () => {
      const user = userEvent.setup()
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]

      render(<Acknowledgments />)

      const urlInput = screen.getByLabelText('URL')

      // Simulate the onChange event directly
      fireEvent.change(urlInput, { target: { value: 'https://newurl.com' } })

      expect(mockListState.updateDataEntry).toHaveBeenCalledWith({
        ...acknowledgment,
        url: 'https://newurl.com',
      })
    })

    it('should handle names table update', async () => {
      const user = userEvent.setup()
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]

      render(<Acknowledgments />)

      const updateNamesButton = screen.getByTestId('update-names')
      await user.click(updateNamesButton)

      expect(mockListState.updateDataEntry).toHaveBeenCalledWith({
        ...acknowledgment,
        names: [{ id: 'test', name: 'Test Name' }],
      })
    })

    it('should handle adding new acknowledgment', async () => {
      const user = userEvent.setup()
      mockListState.data = []

      render(<Acknowledgments />)

      const addButton = screen.getByTestId('add-item')
      await user.click(addButton)

      expect(mockListState.addDataEntry).toHaveBeenCalled()
    })

    it('should handle removing acknowledgment', async () => {
      const user = userEvent.setup()
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]

      render(<Acknowledgments />)

      const removeButton = screen.getByTestId('remove-item-0')
      await user.click(removeButton)

      expect(mockListState.removeDataEntry).toHaveBeenCalledWith(acknowledgment)
    })
  })

  describe('Edge Cases', () => {
    it('should handle acknowledgment with undefined values', () => {
      const acknowledgment: TAcknowledgment = {
        id: 'test-id',
        organization: undefined,
        summary: undefined,
        names: undefined,
        url: undefined,
      }
      mockListState.data = [acknowledgment]

      render(<Acknowledgments />)

      expect(screen.getByLabelText('Organization')).toHaveValue('')
      expect(screen.getByLabelText('Summary')).toHaveValue('')
      expect(screen.getByLabelText('URL')).toHaveValue('')
    })

    it('should handle multiple acknowledgments', () => {
      const acknowledgments = [
        createMockAcknowledgment('ack-1'),
        createMockAcknowledgment('ack-2'),
        createMockAcknowledgment('ack-3'),
      ]
      mockListState.data = acknowledgments

      render(<Acknowledgments />)

      expect(screen.getAllByTestId(/^list-item-/)).toHaveLength(3)
      expect(screen.getAllByTestId(/^start-content-/)).toHaveLength(3)
      expect(screen.getAllByTestId(/^item-content-/)).toHaveLength(3)
    })

    it('should handle validation messages for different acknowledgments', () => {
      const acknowledgments = [
        createMockAcknowledgment('ack-1'),
        createMockAcknowledgment('ack-2'),
      ]
      mockListState.data = acknowledgments
      mockValidationStore.messages = [
        {
          path: '/document/acknowledgments/0',
          message: 'Error for first ack',
          severity: 'error',
        },
        {
          path: '/document/acknowledgments/1',
          message: 'Error for second ack',
          severity: 'error',
        },
      ]

      render(<Acknowledgments />)

      expect(screen.getByText('Error for first ack')).toBeInTheDocument()
      expect(screen.getByText('Error for second ack')).toBeInTheDocument()
    })

    it('should handle empty validation messages array', () => {
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]
      mockValidationStore.messages = []

      render(<Acknowledgments />)

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
    })
  })

  describe('Template Integration', () => {
    it('should check readonly status for form fields', async () => {
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]

      const { checkReadOnly } = await import('../../../src/utils/template')

      render(<Acknowledgments />)

      expect(checkReadOnly).toHaveBeenCalledWith(acknowledgment, 'organization')
      expect(checkReadOnly).toHaveBeenCalledWith(acknowledgment, 'summary')
      expect(checkReadOnly).toHaveBeenCalledWith(acknowledgment, 'url')
    })

    it('should get placeholder text for form fields', async () => {
      const acknowledgment = createMockAcknowledgment()
      mockListState.data = [acknowledgment]

      const { getPlaceholder } = await import('../../../src/utils/template')

      render(<Acknowledgments />)

      expect(getPlaceholder).toHaveBeenCalledWith(
        acknowledgment,
        'organization',
      )
      expect(getPlaceholder).toHaveBeenCalledWith(acknowledgment, 'summary')
      expect(getPlaceholder).toHaveBeenCalledWith(acknowledgment, 'url')
    })
  })

  describe('DocumentStoreUpdater Integration', () => {
    it('should call init function with initial data', () => {
      const mockInit = vi.fn()

      vi.mocked(useDocumentStoreUpdater).mockImplementation(({ init }) => {
        if (init) {
          init({ acknowledgments: [createMockAcknowledgment()] })
        }
      })

      render(<Acknowledgments />)

      expect(mockListState.setData).toHaveBeenCalledWith([
        createMockAcknowledgment(),
      ])
    })

    it('should handle missing acknowledgments in initial data', () => {
      vi.mocked(useDocumentStoreUpdater).mockImplementation(({ init }) => {
        if (init) {
          init({} as any)
        }
      })

      render(<Acknowledgments />)

      expect(mockListState.setData).toHaveBeenCalledWith([])
    })

    it('should return correct state transformation', () => {
      let stateTransformer: () => any

      vi.mocked(useDocumentStoreUpdater).mockImplementation(
        ({ localState }) => {
          stateTransformer = localState[1]
        },
      )

      render(<Acknowledgments />)

      const result = stateTransformer!()
      expect(result).toEqual({
        acknowledgments: mockListState.data,
      })
    })
  })
})
