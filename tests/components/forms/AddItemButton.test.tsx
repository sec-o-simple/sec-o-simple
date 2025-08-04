import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import AddItemButton from '../../../src/components/forms/AddItemButton'

// Mock HeroUI Button component
vi.mock('@heroui/button', () => ({
  Button: vi.fn(({ children, onPress, startContent, color, variant, ...props }: any) => (
    <button
      onClick={onPress}
      data-color={color}
      data-variant={variant}
      data-start-content={startContent?.type?.name || startContent}
      {...props}
    >
      {children}
    </button>
  )),
}))

// Mock FontAwesome icon
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: vi.fn(({ icon }: any) => (
    <span data-testid="fa-icon" data-icon={icon.iconName || 'plus'} />
  )),
}))

// Mock FontAwesome icon import
vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faAdd: { iconName: 'plus' },
}))

describe('AddItemButton', () => {
  it('should render with default props', () => {
    render(<AddItemButton label="Add Item" onPress={() => {}} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Add Item')
    expect(button).toHaveAttribute('data-variant', 'bordered')
  })

  it('should display the provided label', () => {
    render(<AddItemButton label="Add New Product" onPress={() => {}} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Add New Product')
  })

  it('should call onPress when clicked', () => {
    const onPress = vi.fn()
    
    render(<AddItemButton label="Add Item" onPress={onPress} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(onPress).toHaveBeenCalledOnce()
  })

  it('should render with FontAwesome plus icon', () => {
    render(<AddItemButton label="Add Item" onPress={() => {}} />)
    
    const icon = screen.getByTestId('fa-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-icon', 'plus')
  })

  it('should accept custom button props', () => {
    render(
      <AddItemButton 
        label="Add Item" 
        onPress={() => {}} 
        className="custom-class"
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should use bordered variant by default', () => {
    render(<AddItemButton label="Add Item" onPress={() => {}} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'bordered')
  })

  it('should use default label when none provided', () => {
    render(<AddItemButton onPress={() => {}} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Add New Item')
  })
})
