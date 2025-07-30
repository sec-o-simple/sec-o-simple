import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Select from '../../../src/components/forms/Select'
import { useFieldValidation } from '../../../src/utils/validation/useFieldValidation'

// Mock the validation hook
vi.mock('../../../src/utils/validation/useFieldValidation', () => ({
  useFieldValidation: vi.fn(() => ({
    errorMessages: [],
    hasErrors: false,
    isTouched: false,
    markFieldAsTouched: vi.fn(),
  })),
}))

// Mock HeroUI Select component
vi.mock('@heroui/select', () => ({
  Select: vi.fn(({ children, errorMessage, isInvalid, classNames, ...props }: any) => (
    <select 
      {...props} 
      data-testid="hero-select"
      data-error-message={errorMessage || ''}
      data-is-invalid={isInvalid?.toString() || 'false'}
      data-classnames={typeof classNames === 'object' ? JSON.stringify(classNames) : classNames}
    >
      {children}
    </select>
  )),
}))

const mockUseFieldValidation = vi.mocked(useFieldValidation)

describe('Select', () => {
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
  })

  it('should render with default props', () => {
    const { container } = render(<Select><option>Test</option></Select>)
    
    const select = screen.getByTestId('hero-select')
    expect(select).toBeInTheDocument()
    expect(select).toHaveAttribute('variant', 'bordered')
    expect(select).toHaveAttribute('labelPlacement', 'outside')
    expect(select).toHaveAttribute('placeholder', ' ')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should accept custom props', () => {
    render(
      <Select
        label="Custom Label"
        placeholder="Custom placeholder"
        variant="underlined"
        labelPlacement="inside"
      >
        <option>Test</option>
      </Select>
    )
    
    const select = screen.getByTestId('hero-select')
    expect(select).toHaveAttribute('label', 'Custom Label')
    expect(select).toHaveAttribute('placeholder', 'Custom placeholder')
    expect(select).toHaveAttribute('variant', 'underlined')
    expect(select).toHaveAttribute('labelPlacement', 'inside')
  })

  it('should apply custom classNames for trigger', () => {
    render(<Select><option>Test</option></Select>)
    
    const select = screen.getByTestId('hero-select')
    expect(select).toHaveAttribute('data-classnames', JSON.stringify({
      trigger: 'border-1 shadow-none',
    }))
  })

  it('should handle onChange events', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<Select onChange={onChange}><option>Test</option></Select>)
    
    const select = screen.getByTestId('hero-select')
    fireEvent.change(select, { target: { value: 'option1' } })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should mark field as touched on change with csafPath', () => {
    const mockMarkFieldAsTouched = vi.fn()
    const mockValidation = {
      messages: [],
      errorMessages: [],
      warningMessages: [],
      infoMessages: [],
      hasErrors: false,
      hasWarnings: false,
      hasInfos: false,
      isTouched: false,
      markFieldAsTouched: mockMarkFieldAsTouched,
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<Select csafPath="test.field"><option>Test</option></Select>)
    
    const select = screen.getByTestId('hero-select')
    fireEvent.change(select, { target: { value: 'option1' } })
    
    expect(mockMarkFieldAsTouched).toHaveBeenCalledWith('test.field')
  })

  it('should display validation errors when field has errors and is touched', () => {
    const mockValidation = {
      messages: [{ message: 'Field is required', severity: 'error' }],
      errorMessages: [{ message: 'Field is required' }],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: true,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<Select csafPath="test.field"><option>Test</option></Select>)
    
    const select = screen.getByTestId('hero-select')
    expect(select).toHaveAttribute('data-error-message', 'Field is required')
    expect(select).toHaveAttribute('data-is-invalid', 'true')
  })

  it('should display validation errors when field has errors and isTouched prop is true', () => {
    const mockValidation = {
      messages: [{ message: 'Invalid selection', severity: 'error' }],
      errorMessages: [{ message: 'Invalid selection' }],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: false,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<Select csafPath="test.field" isTouched><option>Test</option></Select>)
    
    const select = screen.getByTestId('hero-select')
    expect(select).toHaveAttribute('data-error-message', 'Invalid selection')
    expect(select).toHaveAttribute('data-is-invalid', 'true')
  })

  it('should show error message but not mark as invalid when field has errors but is not touched', () => {
    const mockValidation = {
      messages: [{ message: 'Field is required', severity: 'error' }],
      errorMessages: [{ message: 'Field is required' }],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: false,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<Select csafPath="test.field"><option>Test</option></Select>)
    
    const select = screen.getByTestId('hero-select')
    expect(select).toHaveAttribute('data-error-message', 'Field is required')
    expect(select).toHaveAttribute('data-is-invalid', 'false')
  })

  it('should handle multiple validation errors', () => {
    const mockValidation = {
      messages: [
        { message: 'Field is required', severity: 'error' },
        { message: 'Invalid format', severity: 'error' }
      ],
      errorMessages: [
        { message: 'Field is required' },
        { message: 'Invalid format' }
      ],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: true,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<Select csafPath="test.field"><option>Test</option></Select>)
    
    const select = screen.getByTestId('hero-select')
    expect(select).toHaveAttribute('data-error-message', 'Field is required, Invalid format')
  })

  it('should work without csafPath (no validation)', () => {
    const onChange = vi.fn()
    
    render(<Select onChange={onChange}><option>Test</option></Select>)
    
    const select = screen.getByTestId('hero-select')
    fireEvent.change(select, { target: { value: 'option1' } })
    
    expect(onChange).toHaveBeenCalled()
    expect(select).toHaveAttribute('data-error-message', '')
    expect(select).toHaveAttribute('data-is-invalid', 'false')
  })

  it('should pass through other props to HeroUI Select', () => {
    render(
      <Select
        disabled
        required
        name="test-select"
        data-testid="custom-select"
      >
        <option>Test</option>
      </Select>
    )
    
    const select = screen.getByTestId('hero-select')
    expect(select).toHaveAttribute('disabled', '')
    expect(select).toHaveAttribute('required', '')
    expect(select).toHaveAttribute('name', 'test-select')
  })

  describe('Snapshots', () => {
    it('should render default state', () => {
      const { container } = render(<Select><option>Test</option></Select>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with error state', () => {
      const mockValidation = {
        messages: [{ message: 'Required field', severity: 'error' }],
        errorMessages: [{ message: 'Required field' }],
        warningMessages: [],
        infoMessages: [],
        hasErrors: true,
        hasWarnings: false,
        hasInfos: false,
        isTouched: true,
        markFieldAsTouched: vi.fn(),
      }
      
      mockUseFieldValidation.mockReturnValue(mockValidation)
      
      const { container } = render(<Select csafPath="test.field"><option>Test</option></Select>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with custom variant', () => {
      const { container } = render(<Select variant="flat"><option>Test</option></Select>)
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
