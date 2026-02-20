import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { Autocomplete } from '../../../src/components/forms/Autocomplete'
import { useFieldValidation } from '../../../src/utils/validation/useFieldValidation'
import { useDebounceInput } from '../../../src/utils/useDebounceInput'

// Mock the validation hook
vi.mock('../../../src/utils/validation/useFieldValidation', () => ({
  useFieldValidation: vi.fn(() => ({
    messages: [],
    errorMessages: [],
    warningMessages: [],
    infoMessages: [],
    hasErrors: false,
    hasWarnings: false,
    hasInfos: false,
    isTouched: false,
    markFieldAsTouched: vi.fn(),
  })),
}))

// Mock useDebounceInput hook
vi.mock('../../../src/utils/useDebounceInput', () => ({
  useDebounceInput: vi.fn(() => ({
    handleChange: vi.fn(),
  })),
}))

// Mock HeroUI Autocomplete component
vi.mock('@heroui/react', () => ({
  Autocomplete: vi.fn(({ children, errorMessage, isInvalid, onChange, onBlur, labelPlacement, variant, inputProps, ...props }: any) => (
    <input 
      type="text" 
      data-testid="hero-autocomplete"
      data-error-message={errorMessage || ''}
      data-is-invalid={isInvalid?.toString() || 'false'}
      data-label-placement={labelPlacement}
      data-variant={variant}
      data-input-classnames={inputProps?.classNames ? JSON.stringify(inputProps.classNames) : ''}
      onChange={onChange}
      onBlur={onBlur}
      {...props}
    />
  )),
}))

const mockUseFieldValidation = vi.mocked(useFieldValidation)
const mockUseDebounceInput = vi.mocked(useDebounceInput)

describe('Autocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseFieldValidation.mockReturnValue({
      messages: [],
      errorMessages: [],
      warningMessages: [],
      infoMessages: [],
      hasErrors: false,
      hasWarnings: false,
      hasInfos: false,
      isTouched: false,
      markFieldAsTouched: vi.fn(),
    })
    
    mockUseDebounceInput.mockReturnValue({
      handleChange: vi.fn(),
    } as any)
  })

  it('should render with default props', () => {
    render(<Autocomplete><div>Option 1</div></Autocomplete>)
    
    const autocomplete = screen.getByTestId('hero-autocomplete')
    expect(autocomplete).toBeInTheDocument()
    expect(autocomplete).toHaveAttribute('data-variant', 'bordered')
    expect(autocomplete).toHaveAttribute('data-label-placement', 'outside')
  })

  it('should accept custom props', () => {
    render(
      <Autocomplete
        variant="underlined"
        labelPlacement="inside"
        placeholder="Custom placeholder"
      >
        <div>Option 1</div>
      </Autocomplete>
    )
    
    const autocomplete = screen.getByTestId('hero-autocomplete')
    expect(autocomplete).toHaveAttribute('data-variant', 'underlined')
    expect(autocomplete).toHaveAttribute('data-label-placement', 'inside')
    expect(autocomplete).toHaveAttribute('placeholder', 'Custom placeholder')
  })

  it('should apply custom classNames for inputWrapper', () => {
    render(<Autocomplete><div>Option 1</div></Autocomplete>)
    
    const autocomplete = screen.getByTestId('hero-autocomplete')
    expect(autocomplete).toHaveAttribute('data-input-classnames', JSON.stringify({
      inputWrapper: 'border-1 shadow-none',
    }))
  })

  it('should handle onChange and onValueChange events', () => {
    const onChange = vi.fn()
    const onValueChange = vi.fn()
    const mockHandleChange = vi.fn()
    
    mockUseDebounceInput.mockReturnValue({
      handleChange: mockHandleChange,
    } as any)
    
    render(<Autocomplete onChange={onChange} onValueChange={onValueChange}><div>Option 1</div></Autocomplete>)
    
    const autocomplete = screen.getByTestId('hero-autocomplete')
    fireEvent.change(autocomplete, { target: { value: 'test value' } })
    
    expect(mockHandleChange).toHaveBeenCalled()
  })

  it('should display validation errors when field has errors and is touched', () => {
    const mockValidation = {
      messages: [{ message: 'Invalid input', severity: 'error' }],
      errorMessages: [{ message: 'Invalid input' }],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: true,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<Autocomplete csafPath="test.field"><div>Option 1</div></Autocomplete>)
    
    const autocomplete = screen.getByTestId('hero-autocomplete')
    expect(autocomplete).toHaveAttribute('data-error-message', 'Invalid input')
    expect(autocomplete).toHaveAttribute('data-is-invalid', 'true')
  })

  it('should display validation errors when isTouched prop is true', () => {
    const mockValidation = {
      messages: [{ message: 'Required field', severity: 'error' }],
      errorMessages: [{ message: 'Required field' }],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: false,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<Autocomplete csafPath="test.field" isTouched><div>Option 1</div></Autocomplete>)
    
    const autocomplete = screen.getByTestId('hero-autocomplete')
    expect(autocomplete).toHaveAttribute('data-error-message', 'Required field')
    expect(autocomplete).toHaveAttribute('data-is-invalid', 'true')
  })

  it('should not display validation errors when field has no errors', () => {
    render(<Autocomplete csafPath="test.field"><div>Option 1</div></Autocomplete>)
    
    const autocomplete = screen.getByTestId('hero-autocomplete')
    expect(autocomplete).toHaveAttribute('data-error-message', '')
    expect(autocomplete).toHaveAttribute('data-is-invalid', 'false')
  })

  it('should work without csafPath (no validation)', () => {
    const onChange = vi.fn()
    
    render(<Autocomplete onChange={onChange}><div>Option 1</div></Autocomplete>)
    
    const autocomplete = screen.getByTestId('hero-autocomplete')
    expect(autocomplete).toHaveAttribute('data-error-message', '')
    expect(autocomplete).toHaveAttribute('data-is-invalid', 'false')
  })

  it('should handle onBlur events', () => {
    const onBlur = vi.fn()
    
    render(<Autocomplete onBlur={onBlur}><div>Option 1</div></Autocomplete>)
    
    const autocomplete = screen.getByTestId('hero-autocomplete')
    fireEvent.blur(autocomplete)
    
    // Check that useDebounceInput was called with onBlur
    expect(mockUseDebounceInput).toHaveBeenCalledWith(
      expect.objectContaining({
        onBlur: onBlur,
      })
    )
  })

  it('should call onChange callback when debounce handler is triggered', () => {
    const onChange = vi.fn()
    const onValueChange = vi.fn()
    
    // Mock useDebounceInput to actually call the onChange function
    mockUseDebounceInput.mockImplementation(({ onChange: onChangeCb }) => ({
      handleChange: (e: any) => {
        if (onChangeCb) {
          onChangeCb(e)
        }
      },
    }))
    
    render(<Autocomplete onChange={onChange} onValueChange={onValueChange}><div>Option 1</div></Autocomplete>)
    
    // The useDebounceInput onChange should be called with a function that calls both callbacks
    expect(mockUseDebounceInput).toHaveBeenCalledWith(
      expect.objectContaining({
        onChange: expect.any(Function),
      })
    )

    // Test the actual onChange function that was passed to useDebounceInput
    const { onChange: debounceOnChange } = mockUseDebounceInput.mock.calls[0][0]
    const mockEvent = { target: { value: 'test-value' } }
    
    debounceOnChange(mockEvent)
    
    expect(onValueChange).toHaveBeenCalledWith('test-value')
    expect(onChange).toHaveBeenCalledWith(mockEvent)
  })

  it('should handle onChange without onValueChange callback', () => {
    const onChange = vi.fn()
    
    // Mock useDebounceInput to actually call the onChange function
    mockUseDebounceInput.mockImplementation(({ onChange: onChangeCb }) => ({
      handleChange: (e: any) => {
        if (onChangeCb) {
          onChangeCb(e)
        }
      },
    }))
    
    render(<Autocomplete onChange={onChange}><div>Option 1</div></Autocomplete>)
    
    // Test the onChange function that was passed to useDebounceInput
    const { onChange: debounceOnChange } = mockUseDebounceInput.mock.calls[0][0]
    const mockEvent = { target: { value: 'test-value' } }
    
    debounceOnChange(mockEvent)
    
    expect(onChange).toHaveBeenCalledWith(mockEvent)
  })

  it('should handle onValueChange without onChange callback', () => {
    const onValueChange = vi.fn()
    
    // Mock useDebounceInput to actually call the onChange function
    mockUseDebounceInput.mockImplementation(({ onChange: onChangeCb }) => ({
      handleChange: (e: any) => {
        if (onChangeCb) {
          onChangeCb(e)
        }
      },
    }))
    
    render(<Autocomplete onValueChange={onValueChange}><div>Option 1</div></Autocomplete>)
    
    // Test the onChange function that was passed to useDebounceInput
    const { onChange: debounceOnChange } = mockUseDebounceInput.mock.calls[0][0]
    const mockEvent = { target: { value: 'test-value' } }
    
    debounceOnChange(mockEvent)
    
    expect(onValueChange).toHaveBeenCalledWith('test-value')
  })

  it('should join multiple error messages with commas', () => {
    const mockValidation = {
      messages: [{ message: 'Error 1', severity: 'error' }, { message: 'Error 2', severity: 'error' }],
      errorMessages: [{ message: 'Error 1' }, { message: 'Error 2' }],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: true,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<Autocomplete csafPath="test.field"><div>Option 1</div></Autocomplete>)
    
    const autocomplete = screen.getByTestId('hero-autocomplete')
    expect(autocomplete).toHaveAttribute('data-error-message', 'Error 1, Error 2')
  })
})
