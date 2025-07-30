import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root = null
  rootMargin = ''
  thresholds = []
  takeRecords() {
    return []
  }
} as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

// Mock validation modules globally
vi.mock('@/utils/validation/useFieldValidation', () => ({
  useFieldValidation: vi.fn(() => ({
    messages: [],
    hasErrors: false,
    hasWarnings: false,
    hasInfos: false,
    errorMessages: [],
    warningMessages: [],
    infoMessages: [],
    isTouched: false,
    markFieldAsTouched: vi.fn()
  }))
}))

// Mock config store
vi.mock('@/utils/useConfigStore', () => ({
  useConfigStore: vi.fn(() => ({
    config: null
  })),
  default: vi.fn(() => ({
    config: null
  }))
}))

// Mock document store types
vi.mock('@/routes/document-information/types/tDocumentInformation', () => ({
  getDefaultDocumentInformation: vi.fn(() => ({}))
}))

// Mock debounce input hook
vi.mock('@/utils/useDebounceInput', () => ({
  useDebounceInput: vi.fn((options) => ({
    value: options?.value || '',
    isDebouncing: false,
    handleBlur: vi.fn(),
    handleChange: vi.fn(),
  }))
}))

// Mock download utility
vi.mock('@/utils/download', () => ({
  downloadJSON: vi.fn(),
  downloadFile: vi.fn(),
  download: vi.fn()
}))

// Mock csaf export helpers
vi.mock('@/utils/csafExport/helpers', () => ({
  getFilename: vi.fn((id) => `document-${id}`),
  generateCSAFDocument: vi.fn(),
  validateDocument: vi.fn()
}))

// Mock FontAwesome components
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: vi.fn(({ icon, ...props }) => {
    const { createElement } = require('react')
    return createElement('span', { 
      'data-testid': 'fa-icon',
      'data-icon': icon?.iconName || 'unknown',
      ...props 
    })
  }),
}))

// Mock HeroUI components with simplified DOM representations
vi.mock('@heroui/input', () => ({
  Input: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    // Filter out Hero UI specific props to avoid React warnings
    const { 
      variant, labelPlacement, errorMessage, isInvalid, classNames,
      placeholder, value, onChange, onBlur, ...domProps 
    } = props
    
    return createElement('input', {
      'data-testid': 'hero-input',
      'data-variant': variant,
      'data-labelplacement': labelPlacement,
      'data-errormessage': errorMessage || '',
      'data-isinvalid': String(isInvalid || false),
      'data-classnames': typeof classNames === 'object' ? JSON.stringify(classNames) : classNames,
      placeholder,
      value: value || '',
      onChange: (e) => {
        // Update the input value for testing
        e.target.value = e.target.value
        onChange?.(e)
      },
      onBlur,
      ...domProps
    })
  }),
  Textarea: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    // Filter out Hero UI specific props to avoid React warnings
    const { 
      variant, labelPlacement, errorMessage, isInvalid, classNames,
      placeholder, value, onChange, onBlur, ...domProps 
    } = props
    
    return createElement('textarea', {
      'data-testid': 'hero-textarea',
      'data-variant': variant,
      'data-labelplacement': labelPlacement,
      'data-errormessage': errorMessage || '',
      'data-isinvalid': String(isInvalid || false),
      'data-classnames': typeof classNames === 'object' ? JSON.stringify(classNames) : classNames,
      placeholder,
      defaultValue: value || '',
      onChange: (e) => {
        // Update the textarea value for testing
        e.target.value = e.target.value
        onChange?.(e)
      },
      onBlur,
      ...domProps
    })
  }),
}))

vi.mock('@heroui/select', () => ({
  Select: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    // Filter out Hero UI specific props to avoid React warnings
    const { 
      variant, labelPlacement, errorMessage, isInvalid, classNames,
      placeholder, onChange, ...domProps 
    } = props
    
    return createElement('select', {
      'data-testid': 'hero-select',
      'data-variant': variant,
      'data-labelplacement': labelPlacement,
      'data-errormessage': errorMessage || '',
      'data-isinvalid': String(isInvalid || false),
      'data-classnames': typeof classNames === 'object' ? JSON.stringify(classNames) : classNames,
      placeholder,
      onChange,
      ...domProps
    }, children)
  }),
}))

vi.mock('@heroui/date-picker', () => ({
  DatePicker: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    // Filter out Hero UI specific props to avoid React warnings
    const { 
      variant, labelPlacement, errorMessage, isInvalid, classNames,
      value, onChange, onBlur, ...domProps 
    } = props
    
    return createElement('input', {
      'data-testid': 'hero-datepicker',
      'data-variant': variant,
      'data-labelplacement': labelPlacement,
      'data-errormessage': errorMessage || '',
      'data-isinvalid': String(isInvalid || false),
      'data-classnames': typeof classNames === 'object' ? JSON.stringify(classNames) : classNames,
      value: value?.toString() || '',
      onChange: (e) => {
        const mockDateValue = {
          toDate: () => ({ toISOString: () => e.target.value })
        }
        onChange?.(mockDateValue)
      },
      onBlur,
      ...domProps
    })
  }),
}))

vi.mock('@heroui/button', () => ({
  Button: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    // Filter out Hero UI specific props to avoid React warnings
    const { 
      variant, size, color, isInvalid, isIconOnly, isDisabled, 
      className, onClick, onKeyDown, ...domProps 
    } = props
    
    return createElement('button', {
      'data-testid': 'hero-button',
      'data-variant': variant,
      'data-size': size,
      'data-color': color,
      'data-isinvalid': String(isInvalid || false),
      'data-isicononly': String(isIconOnly || false),
      'data-isdisabled': String(isDisabled || false),
      className,
      disabled: isDisabled,
      onClick,
      onKeyDown,
      ...domProps
    }, children)
  }),
}))

vi.mock('@heroui/react', () => ({
  Tooltip: vi.fn(({ children, content, isDisabled, showArrow, ...props }) => {
    const { createElement } = require('react')
    if (content && !isDisabled) {
      // Filter out Hero UI specific props to avoid React warnings
      const { ...domProps } = props
      return createElement('div', { 
        'data-testid': 'tooltip', 
        title: content,
        'data-showarrow': String(showArrow || false),
        'data-isdisabled': String(isDisabled || false),
        ...domProps 
      }, children)
    }
    return children
  }),
}))

vi.mock('@heroui/tooltip', () => ({
  Tooltip: vi.fn(({ children, content, isDisabled, showArrow, ...props }) => {
    const { createElement } = require('react')
    if (content && !isDisabled) {
      // Filter out Hero UI specific props to avoid React warnings
      const { ...domProps } = props
      return createElement('div', { 
        'data-testid': 'tooltip', 
        title: content,
        'data-showarrow': String(showArrow || false),
        'data-isdisabled': String(isDisabled || false),
        ...domProps 
      }, children)
    }
    return children
  }),
}))

// Mock date utilities
vi.mock('@internationalized/date', () => ({
  getLocalTimeZone: vi.fn(() => 'UTC'),
  parseAbsolute: vi.fn((dateString) => ({
    toDate: vi.fn(() => ({ toISOString: () => dateString }))
  }))
}))
