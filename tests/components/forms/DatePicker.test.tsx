import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import DatePicker from '../../../src/components/forms/DatePicker'
import { useFieldValidation } from '../../../src/utils/validation/useFieldValidation'
import { getLocalTimeZone, parseAbsolute } from '@internationalized/date'

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

// Mock internationalized date functions
vi.mock('@internationalized/date', () => ({
  getLocalTimeZone: vi.fn(() => 'UTC'),
  parseAbsolute: vi.fn((date) => ({
    toDate: vi.fn(() => new Date(date)),
  })),
}))

// Mock HeroUI DatePicker component
vi.mock('@heroui/date-picker', () => ({
  DatePicker: vi.fn(({ children, errorMessage, isInvalid, classNames, value, onChange, onBlur, labelPlacement, variant, label, ...props }: any) => (
    <input 
      type="date" 
      data-testid="hero-datepicker"
      data-error-message={errorMessage || ''}
      data-is-invalid={isInvalid?.toString() || 'false'}
      data-classnames={typeof classNames === 'object' ? JSON.stringify(classNames) : classNames}
      data-value={value?.toString() || ''}
      data-label-placement={labelPlacement}
      data-variant={variant}
      data-label={label}
      onChange={(e) => {
        if (onChange) {
          const mockDateValue = {
            toDate: vi.fn(() => new Date(e.target.value)),
          }
          onChange(mockDateValue)
        }
      }}
      onBlur={onBlur}
    />
  )),
}))

const mockUseFieldValidation = vi.mocked(useFieldValidation)
const mockParseAbsolute = vi.mocked(parseAbsolute)
const mockGetLocalTimeZone = vi.mocked(getLocalTimeZone)

describe('DatePicker', () => {
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
    mockParseAbsolute.mockImplementation((date) => ({
      toDate: vi.fn(() => new Date(date)),
    }))
    mockGetLocalTimeZone.mockReturnValue('UTC')
  })

  it('should render with default props', () => {
    const { container } = render(<DatePicker />)
    
    const datePicker = screen.getByTestId('hero-datepicker')
    expect(datePicker).toBeInTheDocument()
    expect(datePicker).toHaveAttribute('data-variant', 'bordered')
    expect(datePicker).toHaveAttribute('data-label-placement', 'outside')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should accept custom props', () => {
    render(
      <DatePicker
        label="Custom Date"
        variant="underlined"
        labelPlacement="inside"
      />
    )
    
    const datePicker = screen.getByTestId('hero-datepicker')
    expect(datePicker).toHaveAttribute('data-label', 'Custom Date')
    expect(datePicker).toHaveAttribute('data-variant', 'underlined')
    expect(datePicker).toHaveAttribute('data-label-placement', 'inside')
  })

  it('should apply custom classNames for inputWrapper', () => {
    render(<DatePicker />)
    
    const datePicker = screen.getByTestId('hero-datepicker')
    expect(datePicker).toHaveAttribute('data-classnames', JSON.stringify({
      inputWrapper: 'border-1 shadow-none',
    }))
  })

  it('should handle value prop with ISO string', () => {
    const mockDateValue = {
      toDate: vi.fn(() => new Date('2023-12-25')),
    }
    mockParseAbsolute.mockReturnValue(mockDateValue)
    
    render(<DatePicker value="2023-12-25T00:00:00.000Z" />)
    
    expect(mockParseAbsolute).toHaveBeenCalledWith('2023-12-25T00:00:00.000Z', 'UTC')
    const datePicker = screen.getByTestId('hero-datepicker')
    expect(datePicker).toHaveAttribute('data-value', mockDateValue.toString())
  })

  it('should handle undefined value', () => {
    render(<DatePicker />)
    
    const datePicker = screen.getByTestId('hero-datepicker')
    expect(datePicker).toHaveAttribute('data-value', '')
  })

  it('should handle onChange events', () => {
    const onChange = vi.fn()
    
    render(<DatePicker onChange={onChange} />)
    
    const datePicker = screen.getByTestId('hero-datepicker')
    fireEvent.change(datePicker, { target: { value: '2023-12-25' } })
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should mark field as touched on blur with csafPath', async () => {
    const user = userEvent.setup()
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
    
    render(<DatePicker csafPath="test.date" />)
    
    const datePicker = screen.getByTestId('hero-datepicker')
    await user.click(datePicker)
    fireEvent.blur(datePicker)
    
    expect(mockMarkFieldAsTouched).toHaveBeenCalledWith('test.date')
  })

  it('should display validation errors when field has errors and is touched', () => {
    const mockValidation = {
      messages: [{ message: 'Invalid date format', severity: 'error' }],
      errorMessages: [{ message: 'Invalid date format' }],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: true,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<DatePicker csafPath="test.date" />)
    
    const datePicker = screen.getByTestId('hero-datepicker')
    expect(datePicker).toHaveAttribute('data-error-message', 'Invalid date format')
    expect(datePicker).toHaveAttribute('data-is-invalid', 'true')
  })

  it('should display validation errors when field has errors and isTouched prop is true', () => {
    const mockValidation = {
      messages: [{ message: 'Date is required', severity: 'error' }],
      errorMessages: [{ message: 'Date is required' }],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: false,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<DatePicker csafPath="test.date" isTouched />)
    
    const datePicker = screen.getByTestId('hero-datepicker')
    expect(datePicker).toHaveAttribute('data-error-message', 'Date is required')
    expect(datePicker).toHaveAttribute('data-is-invalid', 'true')
  })

  it('should display validation errors when field has errors and has value', () => {
    const mockValidation = {
      messages: [{ message: 'Invalid date', severity: 'error' }],
      errorMessages: [{ message: 'Invalid date' }],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: false,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<DatePicker csafPath="test.date" value="2023-12-25T00:00:00.000Z" />)
    
    const datePicker = screen.getByTestId('hero-datepicker')
    expect(datePicker).toHaveAttribute('data-error-message', 'Invalid date')
    expect(datePicker).toHaveAttribute('data-is-invalid', 'true')
  })

  it('should not display validation errors when field has errors but no triggering conditions', () => {
    const mockValidation = {
      messages: [{ message: 'Date is required', severity: 'error' }],
      errorMessages: [{ message: 'Date is required' }],
      warningMessages: [],
      infoMessages: [],
      hasErrors: true,
      hasWarnings: false,
      hasInfos: false,
      isTouched: false,
      markFieldAsTouched: vi.fn(),
    }
    
    mockUseFieldValidation.mockReturnValue(mockValidation)
    
    render(<DatePicker csafPath="test.date" />)
    
    const datePicker = screen.getByTestId('hero-datepicker')
    expect(datePicker).toHaveAttribute('data-error-message', 'Date is required')
    expect(datePicker).toHaveAttribute('data-is-invalid', 'false')
  })

  it('should work without csafPath (no validation)', () => {
    const onChange = vi.fn()
    
    render(<DatePicker onChange={onChange} />)
    
    const datePicker = screen.getByTestId('hero-datepicker')
    fireEvent.change(datePicker, { target: { value: '2023-12-25' } })
    
    expect(onChange).toHaveBeenCalled()
    expect(datePicker).toHaveAttribute('data-error-message', '')
    expect(datePicker).toHaveAttribute('data-is-invalid', 'false')
  })

  describe('Snapshots', () => {
    it('should render default state', () => {
      const { container } = render(<DatePicker />)
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
      
      const { container } = render(<DatePicker csafPath="test.date" />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with value', () => {
      const { container } = render(<DatePicker value="2023-12-25T00:00:00.000Z" />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
