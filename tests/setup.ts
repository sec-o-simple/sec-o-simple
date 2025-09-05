import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock the global version constant used by vite-plugin-version-mark
Object.defineProperty(globalThis, '__SEC_O_SIMPLE_VERSION__', {
  value: '1.0.0-test',
  writable: true,
  configurable: true,
})

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
    markFieldAsTouched: vi.fn(),
  })),
}))

vi.mock('@/utils/validation/usePathValidation', () => ({
  usePathValidation: vi.fn(() => ({
    isActive: vi.fn(() => false),
    hasErrors: false,
    hasWarnings: false,
    hasInfos: false,
  })),
}))

vi.mock('@/utils/validation/useValidationStore', () => {
  const mockStore = vi.fn(() => ({
    validationResults: {},
    setValidationResults: vi.fn(),
    reset: vi.fn(),
    isValid: true,
    messages: [],
    isValidating: false,
  }))
  return {
    default: mockStore,
    useValidationStore: mockStore,
  }
})

// Mock config store
vi.mock('@/utils/useConfigStore', () => ({
  useConfigStore: vi.fn(() => ({
    config: null,
  })),
  useConfigInitializer: vi.fn(),
  default: vi.fn(() => ({
    config: null,
  })),
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key) => key),
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  })),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}))

// Mock document store types
vi.mock('@/routes/document-information/types/tDocumentInformation', () => ({
  getDefaultDocumentInformation: vi.fn(() => ({})),
}))

// Mock debounce input hook
vi.mock('@/utils/useDebounceInput', () => ({
  useDebounceInput: vi.fn((options) => ({
    value: options?.value || '',
    isDebouncing: false,
    handleBlur: vi.fn(),
    handleChange: vi.fn(),
  })),
}))

// Mock template utility
vi.mock('@/utils/template', () => ({
  useTemplateInitializer: vi.fn(() => ({
    initializeTemplateData: vi.fn(),
  })),
  useTemplate: vi.fn(() => ({
    getTemplateValue: vi.fn(),
    getTemplateData: vi.fn(),
  })),
  checkReadOnly: vi.fn(() => false),
}))

// Mock document store
vi.mock('@/utils/useDocumentStore', () => {
  const mockStore = vi.fn(() => ({
    documentInformation: {},
    products: [],
    families: [],
    relationships: [],
    vulnerabilities: [],
    updateDocumentInformation: vi.fn(),
    updateProducts: vi.fn(),
    updateFamilies: vi.fn(),
    updateRelationships: vi.fn(),
    updateVulnerabilities: vi.fn(),
    reset: vi.fn(),
  }))
  return {
    default: mockStore,
    useDocumentStore: mockStore,
  }
})

// Mock CSAF export
vi.mock('@/utils/csafExport/csafExport', () => ({
  useCSAFExport: vi.fn(() => ({
    exportCSAFDocument: vi.fn(),
    isExporting: false,
  })),
}))

// Mock Product Tree Branch utilities
vi.mock('@/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: vi.fn(() => ({
    getRelationshipFullProductName: vi.fn(() => 'Mock Product Name'),
    getFullProductName: vi.fn(() => 'Mock Full Product Name'),
  })),
}))

// Mock React Router navigation
vi.mock('react-router', () => ({
  HashRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({
    children,
    element,
  }: {
    children?: React.ReactNode
    element?: React.ReactNode
  }) => element || children,
  Navigate: () => null,
  Outlet: () => null,
  NavLink: ({ children, ...props }: any) => {
    const { createElement } = require('react')
    return createElement('a', props, children)
  },
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/' })),
}))

// Mock download utility
vi.mock('@/utils/download', () => ({
  downloadJSON: vi.fn(),
  downloadFile: vi.fn(),
  download: vi.fn(),
}))

// Mock csaf export helpers
vi.mock('@/utils/csafExport/helpers', () => ({
  getFilename: vi.fn((id) => `document-${id}`),
  generateCSAFDocument: vi.fn(),
  validateDocument: vi.fn(),
}))

// Mock FontAwesome components
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: vi.fn(({ icon, ...props }) => {
    const { createElement } = require('react')
    return createElement('span', {
      'data-testid': 'fa-icon',
      'data-icon': icon?.iconName || 'unknown',
      ...props,
    })
  }),
}))

// Mock HeroUI components with simplified DOM representations
vi.mock('@heroui/input', () => ({
  Input: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    // Filter out Hero UI specific props to avoid React warnings
    const {
      variant,
      labelPlacement,
      errorMessage,
      isInvalid,
      classNames,
      placeholder,
      value,
      onChange,
      onBlur,
      ...domProps
    } = props

    return createElement('input', {
      'data-testid': 'hero-input',
      'data-variant': variant,
      'data-labelplacement': labelPlacement,
      'data-errormessage': errorMessage || '',
      'data-isinvalid': String(isInvalid || false),
      'data-classnames':
        typeof classNames === 'object'
          ? JSON.stringify(classNames)
          : classNames,
      placeholder,
      value: value || '',
      onChange: (e) => {
        // Update the input value for testing
        e.target.value = e.target.value
        onChange?.(e)
      },
      onBlur,
      ...domProps,
    })
  }),
  Textarea: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    // Filter out Hero UI specific props to avoid React warnings
    const {
      variant,
      labelPlacement,
      errorMessage,
      isInvalid,
      classNames,
      placeholder,
      value,
      onChange,
      onBlur,
      ...domProps
    } = props

    return createElement('textarea', {
      'data-testid': 'hero-textarea',
      'data-variant': variant,
      'data-labelplacement': labelPlacement,
      'data-errormessage': errorMessage || '',
      'data-isinvalid': String(isInvalid || false),
      'data-classnames':
        typeof classNames === 'object'
          ? JSON.stringify(classNames)
          : classNames,
      placeholder,
      defaultValue: value || '',
      onChange: (e) => {
        // Update the textarea value for testing
        e.target.value = e.target.value
        onChange?.(e)
      },
      onBlur,
      ...domProps,
    })
  }),
}))

vi.mock('@heroui/select', () => ({
  Select: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    // Filter out Hero UI specific props to avoid React warnings
    const {
      variant,
      labelPlacement,
      errorMessage,
      isInvalid,
      classNames,
      placeholder,
      onChange,
      ...domProps
    } = props

    return createElement(
      'select',
      {
        'data-testid': 'hero-select',
        'data-variant': variant,
        'data-labelplacement': labelPlacement,
        'data-errormessage': errorMessage || '',
        'data-isinvalid': String(isInvalid || false),
        'data-classnames':
          typeof classNames === 'object'
            ? JSON.stringify(classNames)
            : classNames,
        placeholder,
        onChange,
        ...domProps,
      },
      children,
    )
  }),
}))

vi.mock('@heroui/date-picker', () => ({
  DatePicker: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    // Filter out Hero UI specific props to avoid React warnings
    const {
      variant,
      labelPlacement,
      errorMessage,
      isInvalid,
      classNames,
      value,
      onChange,
      onBlur,
      ...domProps
    } = props

    return createElement('input', {
      'data-testid': 'hero-datepicker',
      'data-variant': variant,
      'data-labelplacement': labelPlacement,
      'data-errormessage': errorMessage || '',
      'data-isinvalid': String(isInvalid || false),
      'data-classnames':
        typeof classNames === 'object'
          ? JSON.stringify(classNames)
          : classNames,
      value: value?.toString() || '',
      onChange: (e) => {
        const mockDateValue = {
          toDate: () => ({ toISOString: () => e.target.value }),
        }
        onChange?.(mockDateValue)
      },
      onBlur,
      ...domProps,
    })
  }),
}))

vi.mock('@heroui/button', () => ({
  Button: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    // Filter out Hero UI specific props to avoid React warnings
    const {
      variant,
      size,
      color,
      isInvalid,
      isIconOnly,
      isDisabled,
      className,
      onClick,
      onKeyDown,
      ...domProps
    } = props

    return createElement(
      'button',
      {
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
        ...domProps,
      },
      children,
    )
  }),
}))

vi.mock('@heroui/react', () => ({
  Tooltip: vi.fn(({ children, content, isDisabled, showArrow, ...props }) => {
    const { createElement } = require('react')
    if (content && !isDisabled) {
      // Filter out Hero UI specific props to avoid React warnings
      const { ...domProps } = props
      return createElement(
        'div',
        {
          'data-testid': 'tooltip',
          title: content,
          'data-showarrow': String(showArrow || false),
          'data-isdisabled': String(isDisabled || false),
          ...domProps,
        },
        children,
      )
    }
    return children
  }),
  ToastProvider: vi.fn(() => {
    const { createElement } = require('react')
    return createElement('div', {
      'data-testid': 'toast-provider',
    })
  }),
  Modal: vi.fn(({ children, isOpen, ...props }) => {
    const { createElement } = require('react')
    if (!isOpen) return null
    return createElement(
      'div',
      {
        'data-testid': 'modal',
        ...props,
      },
      children,
    )
  }),
  ModalContent: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    return createElement(
      'div',
      {
        'data-testid': 'modal-content',
        ...props,
      },
      children,
    )
  }),
  ModalHeader: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    return createElement(
      'div',
      {
        'data-testid': 'modal-header',
        ...props,
      },
      children,
    )
  }),
  ModalBody: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    return createElement(
      'div',
      {
        'data-testid': 'modal-body',
        ...props,
      },
      children,
    )
  }),
  ModalFooter: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    return createElement(
      'div',
      {
        'data-testid': 'modal-footer',
        ...props,
      },
      children,
    )
  }),
  Table: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    return createElement(
      'table',
      {
        'data-testid': 'table',
        ...props,
      },
      children,
    )
  }),
  TableHeader: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    return createElement(
      'thead',
      {
        'data-testid': 'table-header',
        ...props,
      },
      children,
    )
  }),
  TableBody: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    return createElement(
      'tbody',
      {
        'data-testid': 'table-body',
        ...props,
      },
      children,
    )
  }),
  TableRow: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    return createElement(
      'tr',
      {
        'data-testid': 'table-row',
        ...props,
      },
      children,
    )
  }),
  TableColumn: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    return createElement(
      'th',
      {
        'data-testid': 'table-column',
        'data-width': props.width,
        ...props,
      },
      children,
    )
  }),
  TableCell: vi.fn(({ children, ...props }) => {
    const { createElement } = require('react')
    return createElement(
      'td',
      {
        'data-testid': 'table-cell',
        ...props,
      },
      children,
    )
  }),
  useDisclosure: vi.fn(() => ({
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
  })),
}))

vi.mock('@heroui/tooltip', () => ({
  Tooltip: vi.fn(({ children, content, isDisabled, showArrow, ...props }) => {
    const { createElement } = require('react')
    if (content && !isDisabled) {
      // Filter out Hero UI specific props to avoid React warnings
      const { ...domProps } = props
      return createElement(
        'div',
        {
          'data-testid': 'tooltip',
          title: content,
          'data-showarrow': String(showArrow || false),
          'data-isdisabled': String(isDisabled || false),
          ...domProps,
        },
        children,
      )
    }
    return children
  }),
}))

// Mock date utilities
vi.mock('@internationalized/date', () => ({
  getLocalTimeZone: vi.fn(() => 'UTC'),
  parseAbsolute: vi.fn((dateString) => ({
    toDate: vi.fn(() => ({ toISOString: () => dateString })),
  })),
}))
