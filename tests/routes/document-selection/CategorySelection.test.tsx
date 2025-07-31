import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CategorySelection from '../../../src/routes/document-selection/CategorySelection'
import { DocumentSelectionState } from '../../../src/routes/document-selection/DocumentSelection'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'documentSelection.selectType': 'Select Document Type',
        'documentSelection.selectTypeDescription': 'Choose how you want to proceed',
        'documentSelection.newDocument': 'New Document',
        'documentSelection.existingDocument': 'Existing Document'
      }
      return translations[key] || key
    }
  })
}))

// Mock motion/react
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  motion: {
    div: ({ children, onClick, className, ...props }: any) => (
      <div onClick={onClick} className={className} {...props}>
        {children}
      </div>
    )
  }
}))

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: { icon: any; className?: string }) => (
    <span data-testid="fontawesome-icon" className={className}>
      {icon.iconName || 'icon'}
    </span>
  )
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faPlus: { iconName: 'plus' },
  faPenToSquare: { iconName: 'pen-to-square' }
}))

describe('CategorySelection', () => {
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  it('should render with selectNewOrOpen state', () => {
    render(
      <CategorySelection
        state="selectNewOrOpen"
        onSelect={mockOnSelect}
      />
    )

    expect(screen.getByText('Select Document Type')).toBeInTheDocument()
    expect(screen.getByText('Choose how you want to proceed')).toBeInTheDocument()
    expect(screen.getByText('New Document')).toBeInTheDocument()
    expect(screen.getByText('Existing Document')).toBeInTheDocument()
  })

  it('should render with createDocument state', () => {
    render(
      <CategorySelection
        state="createDocument"
        onSelect={mockOnSelect}
      />
    )

    expect(screen.getByText('New Document')).toBeInTheDocument()
    expect(screen.getByText('Existing Document')).toBeInTheDocument()
    // The header should not be visible when not in selectNewOrOpen state
    expect(screen.queryByText('Select Document Type')).not.toBeInTheDocument()
  })

  it('should render with editDocument state', () => {
    render(
      <CategorySelection
        state="editDocument"
        onSelect={mockOnSelect}
      />
    )

    expect(screen.getByText('New Document')).toBeInTheDocument()
    expect(screen.getByText('Existing Document')).toBeInTheDocument()
  })

  it('should call onSelect when New Document button is clicked', () => {
    render(
      <CategorySelection
        state="selectNewOrOpen"
        onSelect={mockOnSelect}
      />
    )

    fireEvent.click(screen.getByText('New Document'))
    expect(mockOnSelect).toHaveBeenCalledWith('createDocument')
  })

  it('should call onSelect when Existing Document button is clicked', () => {
    render(
      <CategorySelection
        state="selectNewOrOpen"
        onSelect={mockOnSelect}
      />
    )

    fireEvent.click(screen.getByText('Existing Document'))
    expect(mockOnSelect).toHaveBeenCalledWith('editDocument')
  })

  it('should not call onSelect when onSelect prop is not provided', () => {
    render(
      <CategorySelection
        state="selectNewOrOpen"
      />
    )

    fireEvent.click(screen.getByText('New Document'))
    // Should not throw error
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('should display FontAwesome icons', () => {
    render(
      <CategorySelection
        state="selectNewOrOpen"
        onSelect={mockOnSelect}
      />
    )

    const icons = screen.getAllByTestId('fontawesome-icon')
    expect(icons).toHaveLength(2)
    expect(icons[0]).toHaveTextContent('plus')
    expect(icons[1]).toHaveTextContent('pen-to-square')
  })

  it('should apply active styling for createDocument state', () => {
    render(
      <CategorySelection
        state="createDocument"
        onSelect={mockOnSelect}
      />
    )

    // Find the button container that contains "New Document" text
    const newDocumentButton = screen.getByText('New Document')
    const buttonContainer = newDocumentButton.closest('.flex')
    expect(buttonContainer).toHaveClass('bg-primary')
  })

  it('should apply active styling for editDocument state', () => {
    render(
      <CategorySelection
        state="editDocument"
        onSelect={mockOnSelect}
      />
    )

    // Find the button container that contains "Existing Document" text
    const existingDocumentButton = screen.getByText('Existing Document')
    const buttonContainer = existingDocumentButton.closest('.flex')
    expect(buttonContainer).toHaveClass('bg-primary')
  })
})
