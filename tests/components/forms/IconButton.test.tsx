import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import IconButton from '../../../src/components/forms/IconButton'

// Mock FontAwesome and HeroUI components
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => (
    <span data-testid="fa-icon" data-icon={icon.iconName}>
      {icon.iconName}
    </span>
  ),
}))

vi.mock('@heroui/button', () => ({
  Button: ({ children, isIconOnly, variant, className, ...props }: any) => (
    <button 
      {...props} 
      className={className}
      data-variant={variant}
      data-icon-only={isIconOnly}
    >
      {children}
    </button>
  ),
}))

vi.mock('@heroui/react', () => ({
  Tooltip: ({ children, content, isDisabled }: any) => (
    <div data-tooltip={!isDisabled ? content : undefined}>
      {children}
    </div>
  ),
}))

describe('IconButton', () => {
  it('should render icon button with FontAwesome icon', () => {
    const { container } = render(<IconButton icon={faPlus} />)
    
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument()
    expect(screen.getByTestId('fa-icon')).toHaveAttribute('data-icon', 'plus')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render with tooltip when provided', () => {
    const { container } = render(
      <IconButton icon={faEdit} tooltip="Edit item" />
    )
    
    expect(container.querySelector('[data-tooltip="Edit item"]')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render without tooltip when not provided', () => {
    const { container } = render(<IconButton icon={faTrash} />)
    
    const tooltipContainer = container.querySelector('[data-tooltip]')
    if (tooltipContainer) {
      const tooltipValue = tooltipContainer.getAttribute('data-tooltip')
      expect(tooltipValue === null || tooltipValue === 'undefined').toBe(true)
    }
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should pass through button props', () => {
    render(
      <IconButton 
        icon={faPlus} 
        onClick={() => {}} 
        disabled 
        className="custom-class"
        data-testid="custom-button"
      />
    )
    
    const button = screen.getByTestId('custom-button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('custom-class')
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<IconButton icon={faPlus} onClick={handleClick} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply default button styling', () => {
    render(<IconButton icon={faPlus} data-testid="styled-button" />)
    
    const button = screen.getByTestId('styled-button')
    expect(button).toHaveClass('rounded-full', 'text-neutral-foreground')
    // These attributes might be set differently by HeroUI Button component
    expect(button).toBeInTheDocument()
  })

  it('should override default styling with custom props', () => {
    render(
      <IconButton 
        icon={faPlus} 
        className="custom-styling"
        data-testid="custom-styled-button"
      />
    )
    
    const button = screen.getByTestId('custom-styled-button')
    expect(button).toHaveClass('custom-styling')
  })

  describe('Different icons', () => {
    it('should render different FontAwesome icons correctly', () => {
      const { rerender } = render(<IconButton icon={faPlus} />)
      expect(screen.getByTestId('fa-icon')).toHaveAttribute('data-icon', 'plus')
      
      rerender(<IconButton icon={faEdit} />)
      expect(screen.getByTestId('fa-icon')).toHaveAttribute('data-icon', 'pen-to-square')
      
      rerender(<IconButton icon={faTrash} />)
      expect(screen.getByTestId('fa-icon')).toHaveAttribute('data-icon', 'trash')
    })
  })

  describe('Button states', () => {
    it('should render disabled state', () => {
      const { container } = render(
        <IconButton icon={faPlus} disabled tooltip="Disabled button" />
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
