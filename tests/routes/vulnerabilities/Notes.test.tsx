import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Notes from '../../../src/routes/vulnerabilities/Notes'
import { TVulnerability } from '../../../src/routes/vulnerabilities/types/tVulnerability'

// Mock all the dependencies
vi.mock('@/components/forms/VSplit', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="vsplit">{children}</div>
  )
}))

vi.mock('@/utils/useListState', () => ({
  useListState: vi.fn(() => ({
    data: [],
    setData: vi.fn(),
    // Add other methods as needed
  }))
}))

vi.mock('@/utils/validation/useListValidation', () => ({
  useListValidation: vi.fn(() => ({
    hasErrors: false,
    isTouched: false,
    errorMessages: []
  }))
}))

vi.mock('@heroui/react', () => ({
  Alert: ({ children, color }: { children: React.ReactNode; color: string }) => (
    <div data-testid="alert" data-color={color}>
      {children}
    </div>
  )
}))

vi.mock('../../../src/routes/shared/NotesList', () => ({
  NotesList: ({ isTouched, csafPath }: { isTouched: boolean; csafPath: string }) => (
    <div data-testid="notes-list" data-touched={isTouched} data-path={csafPath}>
      Notes List Component
    </div>
  ),
  useVulnerabilityNoteGenerator: vi.fn(() => vi.fn()),
  TNote: {}
}))

vi.mock('../../../src/routes/shared/NotesTemplates', () => ({
  NotesTemplates: ({ templatePath }: { templatePath: string }) => (
    <div data-testid="notes-templates" data-template-path={templatePath}>
      Notes Templates Component
    </div>
  )
}))

describe('Vulnerabilities Notes', () => {
  const mockVulnerability: TVulnerability = {
    id: 'test-id',
    cve: 'CVE-2023-1234',
    title: 'Test Vulnerability',
    notes: [],
    products: [],
    remediations: [],
    scores: []
  }

  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render without errors', () => {
    render(
      <Notes
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByTestId('vsplit')).toBeInTheDocument()
    expect(screen.getByTestId('notes-templates')).toBeInTheDocument()
    expect(screen.getByTestId('notes-list')).toBeInTheDocument()
  })

  it('should pass correct props to NotesTemplates', () => {
    render(
      <Notes
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={mockOnChange}
      />
    )

    const notesTemplates = screen.getByTestId('notes-templates')
    expect(notesTemplates).toHaveAttribute('data-template-path', 'vulnerabilities.notes_templates')
  })

  it('should pass correct props to NotesList', () => {
    render(
      <Notes
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={mockOnChange}
        isTouched={true}
      />
    )

    const notesList = screen.getByTestId('notes-list')
    expect(notesList).toHaveAttribute('data-touched', 'true')
    expect(notesList).toHaveAttribute('data-path', '/vulnerabilities/0/notes')
  })

  it('should handle isTouched prop correctly', () => {
    render(
      <Notes
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={mockOnChange}
        isTouched={false}
      />
    )

    const notesList = screen.getByTestId('notes-list')
    expect(notesList).toHaveAttribute('data-touched', 'false')
  })

  it('should use correct vulnerability index in path', () => {
    render(
      <Notes
        vulnerability={mockVulnerability}
        vulnerabilityIndex={5}
        onChange={mockOnChange}
      />
    )

    const notesList = screen.getByTestId('notes-list')
    expect(notesList).toHaveAttribute('data-path', '/vulnerabilities/5/notes')
  })

  it('should not render alert when no validation errors', () => {
    render(
      <Notes
        vulnerability={mockVulnerability}
        vulnerabilityIndex={0}
        onChange={mockOnChange}
      />
    )

    expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
  })
})
