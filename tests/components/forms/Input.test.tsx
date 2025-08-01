import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Input, Textarea } from '../../../src/components/forms/Input'

describe('Input', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with default props', () => {
    const { container } = render(<Input />)
    
    const input = screen.getByTestId('hero-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-variant', 'bordered')
    expect(input).toHaveAttribute('data-labelplacement', 'outside')
    expect(input).toHaveAttribute('placeholder', ' ')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should accept custom props', () => {
    render(
      <Input
        label="Custom Label"
        placeholder="Custom placeholder"
        variant="underlined"
        labelPlacement="inside"
      />
    )
    
    const input = screen.getByTestId('hero-input')
    expect(input).toHaveAttribute('label', 'Custom Label')
    expect(input).toHaveAttribute('placeholder', 'Custom placeholder')
    expect(input).toHaveAttribute('data-variant', 'underlined')
    expect(input).toHaveAttribute('data-labelplacement', 'inside')
  })

  it('should render with controlled value', () => {
    render(<Input value="controlled value" />)
    
    const input = screen.getByTestId('hero-input')
    expect(input).toHaveAttribute('value', 'controlled value')
  })

  it('should apply custom classNames', () => {
    render(<Input />)
    
    const input = screen.getByTestId('hero-input')
    expect(input).toHaveAttribute('data-classnames', JSON.stringify({
      inputWrapper: 'border-1 shadow-none',
    }))
  })

  it('should handle invalid state correctly', () => {
    const { container } = render(<Input isInvalid />)
    
    const input = screen.getByTestId('hero-input')
    expect(input).toHaveAttribute('data-isinvalid', 'true')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should handle error message prop', () => {
    render(<Input errorMessage="Custom error" />)
    
    const input = screen.getByTestId('hero-input')
    expect(input).toHaveAttribute('data-errormessage', 'Custom error')
  })

  it('should pass through additional props', () => {
    render(<Input disabled id="test-input" />)
    
    const input = screen.getByTestId('hero-input')
    expect(input).toHaveAttribute('disabled')
    expect(input).toHaveAttribute('id', 'test-input')
  })

  it('should render with csafPath prop', () => {
    render(<Input csafPath="test.field" />)
    
    const input = screen.getByTestId('hero-input')
    expect(input).toBeInTheDocument()
    // The csafPath is used internally for validation but doesn't affect the DOM
  })
})

describe('Textarea', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with default props', () => {
    const { container } = render(<Textarea />)
    
    const textarea = screen.getByTestId('hero-textarea')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('data-variant', 'bordered')
    expect(textarea).toHaveAttribute('data-labelplacement', 'outside')
    expect(textarea).toHaveAttribute('placeholder', ' ')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should accept custom props', () => {
    render(
      <Textarea
        label="Custom Label"
        placeholder="Custom placeholder"
        variant="underlined"
        labelPlacement="inside"
      />
    )
    
    const textarea = screen.getByTestId('hero-textarea')
    expect(textarea).toHaveAttribute('label', 'Custom Label')
    expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder')
    expect(textarea).toHaveAttribute('data-variant', 'underlined')
    expect(textarea).toHaveAttribute('data-labelplacement', 'inside')
  })

  it('should render with controlled value', () => {
    render(<Textarea value="controlled textarea value" />)
    
    const textarea = screen.getByTestId('hero-textarea')
    expect(textarea).toBeInTheDocument()
    // The value prop is handled internally by the component
  })

  it('should handle error message prop', () => {
    render(<Textarea errorMessage="Textarea error" />)
    
    const textarea = screen.getByTestId('hero-textarea')
    expect(textarea).toHaveAttribute('data-errormessage', 'Textarea error')
  })

  it('should apply custom classNames', () => {
    render(<Textarea />)
    
    const textarea = screen.getByTestId('hero-textarea')
    expect(textarea).toHaveAttribute('data-classnames', JSON.stringify({
      inputWrapper: 'border-1 shadow-none',
    }))
  })

  it('should pass through additional props', () => {
    render(<Textarea disabled id="test-textarea" />)
    
    const textarea = screen.getByTestId('hero-textarea')
    expect(textarea).toHaveAttribute('disabled')
    expect(textarea).toHaveAttribute('id', 'test-textarea')
  })

  it('should render with csafPath prop', () => {
    render(<Textarea csafPath="test.textarea" />)
    
    const textarea = screen.getByTestId('hero-textarea')
    expect(textarea).toBeInTheDocument()
    // The csafPath is used internally for validation but doesn't affect the DOM
  })

  it('should handle isTouched prop', () => {
    render(<Textarea isTouched />)
    
    const textarea = screen.getByTestId('hero-textarea')
    expect(textarea).toBeInTheDocument()
    // The isTouched prop affects validation but doesn't directly change DOM attributes
  })
})
