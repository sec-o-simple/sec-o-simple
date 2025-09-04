import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Unmock the Notes component to test the actual implementation
vi.unmock('../../../src/routes/document-information/Notes')

import Notes from '../../../src/routes/document-information/Notes'

// Mock WizardStep component
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
    <div
      data-testid="wizard-step"
      data-title={title}
      data-progress={progress}
      data-back={onBack}
      data-continue={onContinue}
    >
      {children}
    </div>
  ),
}))

// Mock hooks
vi.mock('@/utils/useDocumentStoreUpdater', () => ({
  default: vi.fn(),
}))

vi.mock('@/utils/useListState', () => ({
  useListState: vi.fn(() => ({
    data: [],
    setData: vi.fn(),
  })),
}))

vi.mock('@/utils/validation/useListValidation', () => ({
  useListValidation: vi.fn(() => ({
    hasErrors: false,
    isTouched: false,
    errorMessages: [],
  })),
}))

vi.mock('@/utils/validation/usePageVisit', () => ({
  default: vi.fn(() => false),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.documentInformation.notes': 'Document Notes',
      }
      return translations[key] || key
    },
  }),
}))

vi.mock('@heroui/react', () => ({
  Alert: ({
    children,
    color,
  }: {
    children: React.ReactNode
    color: string
  }) => (
    <div data-testid="alert" data-color={color}>
      {children}
    </div>
  ),
}))

vi.mock('../../../src/routes/shared/NotesList', () => ({
  NotesList: ({
    notesListState,
    csafPath,
    isTouched,
  }: {
    notesListState: any
    csafPath: string
    isTouched: boolean
  }) => (
    <div data-testid="notes-list" data-path={csafPath} data-touched={isTouched}>
      Notes List Component
    </div>
  ),
  useNoteGenerator: vi.fn(() => vi.fn()),
  TNote: {},
}))

vi.mock('../../../src/routes/shared/NotesTemplates', () => ({
  NotesTemplates: ({
    notesListState,
    templatePath,
  }: {
    notesListState: any
    templatePath: string
  }) => (
    <div data-testid="notes-templates" data-template-path={templatePath}>
      Notes Templates Component
    </div>
  ),
}))

describe('Document Information Notes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render WizardStep with correct props', () => {
    render(<Notes />)

    const wizardStep = screen.getByTestId('wizard-step')
    expect(wizardStep).toBeInTheDocument()
    expect(wizardStep).toHaveAttribute('data-title', 'Document Notes')
    expect(wizardStep).toHaveAttribute('data-progress', '1.2')
    expect(wizardStep).toHaveAttribute(
      'data-back',
      '/document-information/general',
    )
    expect(wizardStep).toHaveAttribute(
      'data-continue',
      '/document-information/publisher',
    )
  })

  it('should render NotesTemplates with correct props', () => {
    render(<Notes />)

    const notesTemplates = screen.getByTestId('notes-templates')
    expect(notesTemplates).toBeInTheDocument()
    expect(notesTemplates).toHaveAttribute(
      'data-template-path',
      'document-information.notes_templates',
    )
  })

  it('should render NotesList with correct props', () => {
    render(<Notes />)

    const notesList = screen.getByTestId('notes-list')
    expect(notesList).toBeInTheDocument()
    expect(notesList).toHaveAttribute('data-path', '/document/notes')
    expect(notesList).toHaveAttribute('data-touched', 'false') // default from mock
  })

  it('should not render alert when no validation errors', () => {
    render(<Notes />)

    expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
  })
})
