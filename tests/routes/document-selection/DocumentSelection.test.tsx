import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentSelection from '../../../src/routes/document-selection/DocumentSelection'

// Mock dependencies
vi.mock('../../../src/routes/document-selection/CategorySelection', () => ({
  default: ({ state, onSelect }: any) => (
    <div data-testid="category-selection">
      <div data-testid="current-state">{state}</div>
      <button 
        data-testid="select-create" 
        onClick={() => onSelect('createDocument')}
      >
        Create Document
      </button>
      <button 
        data-testid="select-edit" 
        onClick={() => onSelect('editDocument')}
      >
        Edit Document
      </button>
      <button 
        data-testid="select-new-or-open" 
        onClick={() => onSelect('selectNewOrOpen')}
      >
        Select New or Open
      </button>
    </div>
  ),
}))

vi.mock('../../../src/routes/document-selection/CreateDocument', () => ({
  default: () => (
    <div data-testid="create-document">Create Document Component</div>
  ),
}))

vi.mock('../../../src/routes/document-selection/EditDocument', () => ({
  default: () => (
    <div data-testid="edit-document">Edit Document Component</div>
  ),
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <div data-testid="animate-presence">{children}</div>,
}))

vi.mock('../../../src/components/forms/LanguageSwitcher', () => ({
  LanguageSwitcher: () => (
    <div data-testid="language-switcher">Language Switcher</div>
  ),
}))

describe('DocumentSelection', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the document selection with initial state', () => {
      render(<DocumentSelection />)

      expect(screen.getByTestId('category-selection')).toBeInTheDocument()
      expect(screen.getByTestId('current-state')).toHaveTextContent('selectNewOrOpen')
      expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
    })

    it('should render with correct layout classes', () => {
      render(<DocumentSelection />)

      const mainContainer = screen.getByTestId('category-selection').parentElement
      expect(mainContainer).toHaveClass('flex', 'grow', 'flex-col', 'items-center', 'gap-8', 'bg-gradient-to-b', 'from-sky-50', 'to-white')
    })

    it('should render language switcher at the bottom', () => {
      render(<DocumentSelection />)

      const languageSwitcherContainer = screen.getByTestId('language-switcher').parentElement
      expect(languageSwitcherContainer).toHaveClass('absolute', 'inset-x-0', 'bottom-4', 'flex', 'justify-center')
    })
  })

  describe('State Management', () => {
    it('should start with selectNewOrOpen state', () => {
      render(<DocumentSelection />)

      expect(screen.getByTestId('current-state')).toHaveTextContent('selectNewOrOpen')
      expect(screen.queryByTestId('create-document')).not.toBeInTheDocument()
      expect(screen.queryByTestId('edit-document')).not.toBeInTheDocument()
    })

    it('should switch to createDocument state when selected', async () => {
      render(<DocumentSelection />)

      await user.click(screen.getByTestId('select-create'))

      expect(screen.getByTestId('current-state')).toHaveTextContent('createDocument')
      expect(screen.getByTestId('create-document')).toBeInTheDocument()
      expect(screen.queryByTestId('edit-document')).not.toBeInTheDocument()
    })

    it('should switch to editDocument state when selected', async () => {
      render(<DocumentSelection />)

      await user.click(screen.getByTestId('select-edit'))

      expect(screen.getByTestId('current-state')).toHaveTextContent('editDocument')
      expect(screen.getByTestId('edit-document')).toBeInTheDocument()
      expect(screen.queryByTestId('create-document')).not.toBeInTheDocument()
    })

    it('should switch back to selectNewOrOpen state', async () => {
      render(<DocumentSelection />)

      // First switch to createDocument
      await user.click(screen.getByTestId('select-create'))
      expect(screen.getByTestId('current-state')).toHaveTextContent('createDocument')

      // Then switch back to selectNewOrOpen
      await user.click(screen.getByTestId('select-new-or-open'))
      expect(screen.getByTestId('current-state')).toHaveTextContent('selectNewOrOpen')
      expect(screen.queryByTestId('create-document')).not.toBeInTheDocument()
      expect(screen.queryByTestId('edit-document')).not.toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should pass state to CategorySelection component', () => {
      render(<DocumentSelection />)

      // Check initial state
      expect(screen.getByTestId('current-state')).toHaveTextContent('selectNewOrOpen')
    })

    it('should handle state changes from CategorySelection', async () => {
      render(<DocumentSelection />)

      // Test each state change
      await user.click(screen.getByTestId('select-create'))
      expect(screen.getByTestId('current-state')).toHaveTextContent('createDocument')

      await user.click(screen.getByTestId('select-edit'))
      expect(screen.getByTestId('current-state')).toHaveTextContent('editDocument')

      await user.click(screen.getByTestId('select-new-or-open'))
      expect(screen.getByTestId('current-state')).toHaveTextContent('selectNewOrOpen')
    })

    it('should render CreateDocument only when state is createDocument', async () => {
      render(<DocumentSelection />)

      // Initially not visible
      expect(screen.queryByTestId('create-document')).not.toBeInTheDocument()

      // Switch to create state
      await user.click(screen.getByTestId('select-create'))
      expect(screen.getByTestId('create-document')).toBeInTheDocument()

      // Switch to edit state - create should disappear
      await user.click(screen.getByTestId('select-edit'))
      expect(screen.queryByTestId('create-document')).not.toBeInTheDocument()
    })

    it('should render EditDocument only when state is editDocument', async () => {
      render(<DocumentSelection />)

      // Initially not visible
      expect(screen.queryByTestId('edit-document')).not.toBeInTheDocument()

      // Switch to edit state
      await user.click(screen.getByTestId('select-edit'))
      expect(screen.getByTestId('edit-document')).toBeInTheDocument()

      // Switch to create state - edit should disappear
      await user.click(screen.getByTestId('select-create'))
      expect(screen.queryByTestId('edit-document')).not.toBeInTheDocument()
    })
  })

  describe('Animation Integration', () => {
    it('should wrap conditional components in AnimatePresence', () => {
      render(<DocumentSelection />)

      expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
    })

    it('should handle component transitions within AnimatePresence', async () => {
      render(<DocumentSelection />)

      // Switch to create document
      await user.click(screen.getByTestId('select-create'))
      expect(screen.getByTestId('create-document')).toBeInTheDocument()

      // Switch to edit document
      await user.click(screen.getByTestId('select-edit'))
      expect(screen.getByTestId('edit-document')).toBeInTheDocument()
      expect(screen.queryByTestId('create-document')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid state changes', async () => {
      render(<DocumentSelection />)

      // Rapidly change states
      await user.click(screen.getByTestId('select-create'))
      await user.click(screen.getByTestId('select-edit'))
      await user.click(screen.getByTestId('select-new-or-open'))
      await user.click(screen.getByTestId('select-create'))

      expect(screen.getByTestId('current-state')).toHaveTextContent('createDocument')
      expect(screen.getByTestId('create-document')).toBeInTheDocument()
    })

    it('should maintain state consistency throughout component lifecycle', async () => {
      render(<DocumentSelection />)

      // Test multiple state transitions
      const states = ['createDocument', 'editDocument', 'selectNewOrOpen', 'createDocument']
      const buttons = ['select-create', 'select-edit', 'select-new-or-open', 'select-create']

      for (let i = 0; i < states.length; i++) {
        await user.click(screen.getByTestId(buttons[i]))
        expect(screen.getByTestId('current-state')).toHaveTextContent(states[i])
      }
    })
  })
})
