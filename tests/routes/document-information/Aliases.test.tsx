import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Unmock the Aliases component to test the actual implementation
vi.unmock('../../../src/routes/document-information/Aliases')

import Aliases from '../../../src/routes/document-information/Aliases'

// Add jest-dom matchers
import '@testing-library/jest-dom'

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
    content: (item: any, index: number) => React.ReactNode
  }) => (
    <div data-testid="component-list">
      <div data-testid="list-title">{title}</div>
      <div data-testid="item-label">{itemLabel}</div>
      <div data-testid="item-bg-color">{itemBgColor}</div>
      <button data-testid="add-item" onClick={() => listState.addDataEntry()}>
        Add Item
      </button>
      {listState.data.map((item: any, index: number) => (
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
            Remove Item
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
    csafPath,
    isDisabled,
    placeholder,
  }: any) => (
    <div data-testid="input-wrapper">
      <label>{label}</label>
      <input
        data-testid="input"
        data-csaf-path={csafPath}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={isDisabled}
        placeholder={placeholder}
      />
    </div>
  ),
}))

vi.mock('@/components/forms/VSplit', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="vsplit">{children}</div>
  ),
}))

vi.mock('@/utils/useDocumentStoreUpdater', () => ({
  default: ({ localState, init }: any) => {
    // Mock implementation for testing initialization
    // const [data, setData] = localState
    // We can simulate initialization if needed, but integration test is better
    return null
  },
}))

vi.mock('@/utils/validation/usePageVisit', () => ({
  default: vi.fn(),
}))

vi.mock('@/utils/validation/useValidationStore', () => ({
  default: vi.fn((selector) => selector({ messages: [], markFieldAsTouched: vi.fn() })),
}))

vi.mock('@/utils/validation/useFieldValidation', () => ({
  useFieldValidation: vi.fn(() => ({
    messages: [],
    hasErrors: false,
  })),
}))

vi.mock('@/utils/validation/useListValidation', () => ({
  useListValidation: vi.fn(() => ({
    isTouched: false,
    hasErrors: false,
    errorMessages: [],
  })),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('Aliases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<Aliases />)
    expect(screen.getByTestId('wizard-title')).toHaveTextContent('nav.documentInformation.aliases')
    expect(screen.getByTestId('component-list')).toBeInTheDocument()
    expect(screen.getByTestId('list-title')).toHaveTextContent('alias')
    expect(screen.getByTestId('item-label')).toHaveTextContent('document.general.alias')
  })

  it('allows adding an alias', async () => {
    render(<Aliases />)
    const user = userEvent.setup()

    const addButton = screen.getByTestId('add-item')
    await user.click(addButton)

    expect(screen.getByTestId('list-item-0')).toBeInTheDocument()
    expect(screen.getByTestId('input')).toBeInTheDocument()
  })

  it('allows editing an alias', async () => {
    render(<Aliases />)
    const user = userEvent.setup()

    const addButton = screen.getByTestId('add-item')
    await user.click(addButton)

    const input = screen.getByTestId('input')
    await user.type(input, 'New Alias')

    expect(input).toHaveValue('New Alias')
  })

  it('allows removing an alias', async () => {
    render(<Aliases />)
    const user = userEvent.setup()

    const addButton = screen.getByTestId('add-item')
    await user.click(addButton)
    
    expect(screen.getByTestId('list-item-0')).toBeInTheDocument()

    const removeButton = screen.getByTestId('remove-item-0')
    await user.click(removeButton)

    expect(screen.queryByTestId('list-item-0')).not.toBeInTheDocument()
  })
})
