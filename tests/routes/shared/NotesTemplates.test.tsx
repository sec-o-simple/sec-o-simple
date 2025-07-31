import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotesTemplates } from '../../../src/routes/shared/NotesTemplates'
import { ListState } from '../../../src/utils/useListState'
import { TNote } from '../../../src/routes/shared/NotesList'

// Mock dependencies
vi.mock('@/utils/useConfigStore', () => ({
  useConfigStore: vi.fn()
}))

// Get the mocked function
import { useConfigStore } from '@/utils/useConfigStore'
const mockUseConfigStore = vi.mocked(useConfigStore)

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'notesTemplates.addTemplateButton': 'Add Template',
        'notesTemplates.selectTemplateTitle': 'Select Template',
        'common.close': 'Close'
      }
      return translations[key] || key
    }
  })
}))

vi.mock('@heroui/modal', () => {
  const mockUseDisclosure = vi.fn(() => ({
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
    onOpenChange: vi.fn(),
    isControlled: false,
    getButtonProps: vi.fn(),
    getDisclosureProps: vi.fn()
  }))

  return {
    Modal: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) => 
      isOpen ? <div data-testid="modal">{children}</div> : null,
    ModalContent: ({ children }: { children: (onClose: () => void) => React.ReactNode }) => (
      <div data-testid="modal-content">{children(() => {})}</div>
    ),
    ModalHeader: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal-header">{children}</div>
    ),
    ModalBody: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal-body">{children}</div>
    ),
    ModalFooter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal-footer">{children}</div>
    ),
    useDisclosure: mockUseDisclosure
  }
})

// Get the mocked useDisclosure function
import { useDisclosure } from '@heroui/modal'
const mockUseDisclosure = vi.mocked(useDisclosure)

vi.mock('@heroui/button', () => ({
  Button: ({ 
    children, 
    onPress, 
    startContent,
    ...props 
  }: { 
    children: React.ReactNode
    onPress?: () => void
    startContent?: React.ReactNode
  }) => (
    <button onClick={onPress} data-testid="button" {...props}>
      {startContent}
      {children}
    </button>
  )
}))

vi.mock('@heroui/react', () => ({
  Listbox: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="listbox">{children}</div>
  ),
  ListboxItem: ({ 
    children, 
    onClick, 
    description,
    textValue 
  }: { 
    children: React.ReactNode
    onClick?: () => void
    description?: React.ReactNode
    textValue?: string
  }) => (
    <div 
      data-testid="listbox-item" 
      onClick={onClick}
      data-text-value={textValue}
    >
      {children}
      {description && <div data-testid="description">{description}</div>}
    </div>
  )
}))

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => (
    <span data-testid="fontawesome-icon">{icon.iconName || 'icon'}</span>
  )
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faAdd: { iconName: 'add' }
}))

vi.mock('uid', () => ({
  uid: vi.fn(() => 'test-id')
}))

describe('NotesTemplates', () => {
  const mockSetData = vi.fn()
  const mockNotesListState: ListState<TNote> = {
    data: [],
    setData: mockSetData,
    updateDataEntry: vi.fn(),
    removeDataEntry: vi.fn(),
    addDataEntry: vi.fn(),
    getId: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the useDisclosure mock to default state
    mockUseDisclosure.mockReturnValue({
      isOpen: false,
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onOpenChange: vi.fn(),
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn()
    })
  })

  it('should render null when no templates are available', () => {
    mockUseConfigStore.mockReturnValue(undefined)

    const { container } = render(
      <NotesTemplates
        notesListState={mockNotesListState}
        templatePath="test.path"
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render add template button when templates are available', () => {
    mockUseConfigStore.mockReturnValue({
      template1: {
        title: 'Test Template',
        content: 'Test content',
        category: 'test'
      }
    })

    render(
      <NotesTemplates
        notesListState={mockNotesListState}
        templatePath="test.path"
      />
    )

    expect(screen.getByText('Add Template')).toBeInTheDocument()
    expect(screen.getByTestId('fontawesome-icon')).toHaveTextContent('add')
  })

  it('should open modal when add button is clicked', () => {
    const mockOnOpen = vi.fn()
    mockUseDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: vi.fn(),
      onOpenChange: vi.fn(),
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn()
    })

    mockUseConfigStore.mockReturnValue({
    template1: {
        title: 'Test Template',
        content: 'Test content',
        category: 'test'
      }
    })

    render(
      <NotesTemplates
        notesListState={mockNotesListState}
        templatePath="test.path"
      />
    )

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-header')).toHaveTextContent('Select Template')
  })

  it('should render template items in the modal', () => {
    mockUseDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onOpenChange: vi.fn(),
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn()
    })

    mockUseConfigStore.mockReturnValue({
      template1: {
        title: 'Test Template 1',
        content: 'Test content 1',
        category: 'test'
      },
      template2: {
        title: 'Test Template 2',
        content: 'Test content 2',
        category: 'test'
      }
    })

    render(
      <NotesTemplates
        notesListState={mockNotesListState}
        templatePath="test.path"
      />
    )

    expect(screen.getByTestId('listbox')).toBeInTheDocument()
    const listboxItems = screen.getAllByTestId('listbox-item')
    expect(listboxItems).toHaveLength(2)
    expect(screen.getByText('Test Template 1')).toBeInTheDocument()
    expect(screen.getByText('Test Template 2')).toBeInTheDocument()
  })

  it('should truncate long content in description', () => {
    mockUseDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onOpenChange: vi.fn(),
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn()
    })

    const longContent = 'x'.repeat(200)
    mockUseConfigStore.mockReturnValue({
      template1: {
        title: 'Test Template',
        content: longContent,
        category: 'test'
      }
    })

    render(
      <NotesTemplates
        notesListState={mockNotesListState}
        templatePath="test.path"
      />
    )

    const description = screen.getByTestId('description')
    expect(description.textContent).toContain('...')
    expect(description.textContent).toHaveLength(153) // 150 chars + '...'
  })

  it('should add template to notes list when template is selected', () => {
    mockUseDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onOpenChange: vi.fn(),
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn()
    })

    mockUseConfigStore.mockReturnValue({
      template1: {
        title: 'Test Template',
        content: 'Test content',
        category: 'test'
      }
    })

    render(
      <NotesTemplates
        notesListState={mockNotesListState}
        templatePath="test.path"
      />
    )

    const templateItem = screen.getByTestId('listbox-item')
    fireEvent.click(templateItem)

    expect(mockSetData).toHaveBeenCalledWith(expect.any(Function))
  })
})
