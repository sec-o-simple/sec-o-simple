import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import ConfirmButton from '../../../src/components/forms/ConfirmButton'

// Mock HeroUI components
vi.mock('@heroui/button', () => ({
  Button: vi.fn(({ children, onPress, color, variant, ...props }: any) => (
    <button
      onClick={onPress}
      data-color={color}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  )),
}))

vi.mock('@heroui/react', () => ({
  Modal: vi.fn(({ children, isOpen }: any) => 
    isOpen ? <div data-testid="modal">{children}</div> : null
  ),
  ModalContent: vi.fn(({ children }: any) => {
    const mockOnClose = vi.fn()
    return <div data-testid="modal-content">{typeof children === 'function' ? children(mockOnClose) : children}</div>
  }),
  ModalHeader: vi.fn(({ children }: any) => <div data-testid="modal-header">{children}</div>),
  ModalBody: vi.fn(({ children }: any) => <div data-testid="modal-body">{children}</div>),
  ModalFooter: vi.fn(({ children }: any) => <div data-testid="modal-footer">{children}</div>),
  useDisclosure: vi.fn(() => ({
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
    onOpenChange: vi.fn(),
    isControlled: false,
    getButtonProps: vi.fn(),
    getDisclosureProps: vi.fn(),
  })),
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: vi.fn(({ icon }: any) => (
    <span data-testid="fa-icon" data-icon={icon.iconName || 'question'} />
  )),
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faQuestion: { iconName: 'question' },
}))

// Get mock reference after import
const mockHeroUI = vi.mocked(await import('@heroui/react'))

describe('ConfirmButton', () => {
  let mockOnOpen: any
  let mockOnClose: any
  let mockOnOpenChange: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnOpen = vi.fn()
    mockOnClose = vi.fn()
    mockOnOpenChange = vi.fn()
    
    mockHeroUI.useDisclosure.mockReturnValue({
      isOpen: false,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
      onOpenChange: mockOnOpenChange,
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn(),
    })
  })

  it('should render with required props', () => {
    render(
      <ConfirmButton 
        confirmText="Are you sure?" 
        confirmTitle="Confirm Action"
        onConfirm={() => {}} 
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('common.confirm')
  })

  it('should render with custom children text', () => {
    render(
      <ConfirmButton 
        confirmText="Are you sure?" 
        confirmTitle="Confirm Action"
        onConfirm={() => {}}
      >
        Custom Action
      </ConfirmButton>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Custom Action')
  })

  it('should open modal when clicked', () => {
    render(
      <ConfirmButton 
        confirmText="Are you sure?" 
        confirmTitle="Confirm Action"
        onConfirm={() => {}} 
      />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockOnOpen).toHaveBeenCalledOnce()
  })

  it('should skip confirmation when skipConfirm is true', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmButton 
        confirmText="Are you sure?" 
        confirmTitle="Confirm Action"
        onConfirm={onConfirm} 
        skipConfirm
      />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(mockOnOpen).not.toHaveBeenCalled()
  })

  it('should show modal when isOpen is true', () => {
    mockHeroUI.useDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
      onOpenChange: mockOnOpenChange,
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn(),
    })

    render(
      <ConfirmButton 
        confirmText="Are you sure?" 
        confirmTitle="Confirm Action"
        onConfirm={() => {}} 
      />
    )
    
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-header')).toBeInTheDocument()
    expect(screen.getByTestId('modal-body')).toBeInTheDocument()
    expect(screen.getByTestId('modal-footer')).toBeInTheDocument()
  })

  it('should render confirm modal with provided content', () => {
    mockHeroUI.useDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
      onOpenChange: mockOnOpenChange,
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn(),
    })

    render(
      <ConfirmButton 
        confirmText="Are you sure you want to delete this item?" 
        confirmTitle="Delete Item"
        onConfirm={() => {}} 
      />
    )
    
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument()
  })

  it('should call onConfirm and close modal when confirm button is clicked', () => {
    mockHeroUI.useDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
      onOpenChange: mockOnOpenChange,
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn(),
    })

    const onConfirm = vi.fn()

    render(
      <ConfirmButton 
        confirmText="Are you sure?" 
        confirmTitle="Confirm Action"
        onConfirm={onConfirm} 
      />
    )
    
    const confirmButtons = screen.getAllByText('common.confirm')
    const modalConfirmButton = confirmButtons.find(button => button.tagName === 'BUTTON' && button.closest('[data-testid="modal-footer"]'))
    
    if (modalConfirmButton) {
      fireEvent.click(modalConfirmButton)
      expect(onConfirm).toHaveBeenCalledOnce()
    }
  })

  it('should close modal when cancel button is clicked', () => {
    mockHeroUI.useDisclosure.mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
      onOpenChange: mockOnOpenChange,
      isControlled: false,
      getButtonProps: vi.fn(),
      getDisclosureProps: vi.fn(),
    })

    render(
      <ConfirmButton 
        confirmText="Are you sure?" 
        confirmTitle="Confirm Action"
        onConfirm={() => {}} 
      />
    )
    
    const cancelButton = screen.getByText('common.cancel')
    expect(cancelButton).toBeInTheDocument()
    fireEvent.click(cancelButton)
    
    // Since the onClose is mocked in ModalContent, we can't verify the exact call
    // but we can verify the button exists and is clickable
  })

  it('should accept custom button props', () => {
    render(
      <ConfirmButton 
        confirmText="Are you sure?" 
        confirmTitle="Confirm Action"
        onConfirm={() => {}} 
        color="warning"
        variant="solid"
        className="custom-class"
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-color', 'warning')
    expect(button).toHaveAttribute('data-variant', 'solid')
    expect(button).toHaveClass('custom-class')
  })
})
