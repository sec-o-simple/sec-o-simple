import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock getDocumentInformationTemplateKeys and getDefaultDocumentInformation for document information
vi.mock(
  '../../../src/routes/document-information/types/tDocumentInformation',
  async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...(actual as any),
      getDocumentInformationTemplateKeys: () => ({}),
      getDefaultDocumentInformation: () => ({}),
    }
  },
)

// Mock template module
vi.mock('../../../src/utils/template', () => ({
  useTemplateInitializer: vi.fn(() => ({
    initializeTemplateData: vi.fn(),
  })),
  useTemplate: vi.fn(() => ({
    getTemplateValue: vi.fn(),
  })),
}))

vi.unmock('../../../src/components/layout/TopBarLayout')

import TopBarLayout from '../../../src/components/layout/TopBarLayout'

// Mock React Router
vi.mock('react-router', () => ({
  Outlet: vi.fn(() => <div data-testid="router-outlet">Outlet content</div>),
  useNavigate: vi.fn(() => vi.fn()),
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock stores
vi.mock('../../../src/utils/useDocumentStore', () => ({
  default: vi.fn(() => ({
    reset: vi.fn(),
  })),
}))

vi.mock('../../../src/utils/validation/useValidationStore', () => ({
  default: vi.fn(() => ({
    isValid: true,
    messages: [],
    isValidating: false,
    reset: vi.fn(),
  })),
}))

// Mock CSAF export hook
vi.mock('../../../src/utils/csafExport/csafExport', () => ({
  useCSAFExport: vi.fn(() => ({
    exportCSAFDocument: vi.fn(),
  })),
}))

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  ToastProvider: vi.fn(() => (
    <div data-testid="toast-provider">Toast Provider</div>
  )),
  Button: vi.fn(
    ({ children, onPress, isDisabled, color, variant, className }: any) => (
      <button
        onClick={onPress}
        disabled={isDisabled}
        className={className}
        data-testid="hero-button"
        data-color={color}
        data-variant={variant}
        data-isdisabled={isDisabled}
        data-isicononly={false}
        data-isinvalid={false}
      >
        {children}
      </button>
    ),
  ),
  Tooltip: vi.fn(({ children, content, isDisabled }: any) => (
    <div
      data-testid="tooltip"
      data-content={content}
      data-disabled={isDisabled}
    >
      {children}
    </div>
  )),
  Modal: vi.fn(({ children, isOpen }: any) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
  ),
  ModalContent: vi.fn(({ children }: any) => (
    <div data-testid="modal-content">{children}</div>
  )),
  ModalHeader: vi.fn(({ children }: any) => (
    <div data-testid="modal-header">{children}</div>
  )),
  ModalBody: vi.fn(({ children }: any) => (
    <div data-testid="modal-body">{children}</div>
  )),
  ModalFooter: vi.fn(({ children }: any) => (
    <div data-testid="modal-footer">{children}</div>
  )),
  Table: vi.fn(({ children }: any) => (
    <table data-testid="table">{children}</table>
  )),
  TableHeader: vi.fn(({ children }: any) => (
    <thead data-testid="table-header">{children}</thead>
  )),
  TableBody: vi.fn(({ children }: any) => (
    <tbody data-testid="table-body">{children}</tbody>
  )),
  TableColumn: vi.fn(({ children }: any) => (
    <th data-testid="table-column">{children}</th>
  )),
  TableRow: vi.fn(({ children }: any) => (
    <tr data-testid="table-row">{children}</tr>
  )),
  TableCell: vi.fn(({ children }: any) => (
    <td data-testid="table-cell">{children}</td>
  )),
  useDisclosure: vi.fn(() => ({
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
  })),
}))

// Mock ConfirmButton
vi.mock('../../../src/components/forms/ConfirmButton', () => ({
  default: vi.fn(
    ({ children, onConfirm, className, color, fullWidth }: any) => (
      <button
        onClick={onConfirm}
        className={className}
        data-testid="confirm-button"
        data-color={color}
        data-full-width={fullWidth}
      >
        {children}
      </button>
    ),
  ),
}))

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: vi.fn(({ icon }: any) => (
    <span data-testid="font-awesome-icon" data-icon={icon?.iconName}>
      Icon
    </span>
  )),
}))

describe('TopBarLayout', () => {
  it('should render without crashing', () => {
    render(<TopBarLayout />)

    expect(screen.getByTestId('router-outlet')).toBeInTheDocument()
  })

  it('should render the app title', () => {
    render(<TopBarLayout />)

    expect(screen.getByText('Sec-o-simple')).toBeInTheDocument()
  })

  it('should render new document button', () => {
    render(<TopBarLayout />)

    const confirmButtons = screen.getAllByTestId('confirm-button')
    expect(confirmButtons.length).toBeGreaterThan(0)
  })

  it('should render action buttons', () => {
    render(<TopBarLayout />)

    // Check for HeroUI buttons
    const heroButtons = screen.getAllByTestId('hero-button')
    expect(heroButtons.length).toBeGreaterThan(0)

    // Check for confirm buttons
    const confirmButtons = screen.getAllByTestId('confirm-button')
    expect(confirmButtons.length).toBeGreaterThan(0)
  })

  it('should render toast provider', () => {
    render(<TopBarLayout />)

    expect(screen.getByTestId('toast-provider')).toBeInTheDocument()
  })

  it('should render router outlet', () => {
    render(<TopBarLayout />)

    expect(screen.getByTestId('router-outlet')).toBeInTheDocument()
    expect(screen.getByText('Outlet content')).toBeInTheDocument()
  })

  it('should render validation error component', () => {
    render(<TopBarLayout />)

    // Check for validation error button component exists (use flexible text matching for multiple matches)
    const validationElements = screen.getAllByText((_, element) => {
      return element?.textContent?.includes('validation.error') || false
    })
    expect(validationElements.length).toBeGreaterThan(0)
  })
})
