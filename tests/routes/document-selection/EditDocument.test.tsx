import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { HashRouter } from 'react-router'
import EditDocument from '../../../src/routes/document-selection/EditDocument'

// Mock external dependencies  
vi.mock('@heroui/react', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Modal: ({ children, isOpen, ...props }: any) => isOpen ? <div {...props}>{children}</div> : null,
  ModalContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ModalHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ModalBody: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ModalFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  useDisclosure: () => ({
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
    onOpenChange: vi.fn()
  })
}))

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => <span data-testid="icon">{typeof icon === 'string' ? icon : 'icon'}</span>
}))

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  HashRouter: ({ children }: any) => <div>{children}</div>
}))

vi.mock('../../../src/utils/useDocumentStore', () => ({
  default: () => ({
    resetDocument: vi.fn(),
    setDocument: vi.fn()
  })
}))

vi.mock('../../../src/utils/useDatabaseClient', () => ({
  default: () => ({
    setDocument: vi.fn()
  })
}))

vi.mock('../../../src/utils/csafImport/parseCSAFDocument', () => ({
  default: vi.fn()
}))

vi.mock('../../../src/utils/csafImport/useCSAFImport', () => ({
  default: () => ({
    importDocument: vi.fn(),
    hasHiddenFields: false
  })
}))

vi.mock('../../../src/utils/sosDraft', () => ({
  isDraftDocument: vi.fn(),
  useSOSImport: () => ({
    isSOSDraft: vi.fn(),
    importSOSDocument: vi.fn()
  })
}))

describe('EditDocument', () => {
  const renderComponent = () => {
    return render(
      <HashRouter>
        <EditDocument />
      </HashRouter>
    )
  }

  it('should render correctly', () => {
    const { container } = renderComponent()
    expect(container).toMatchSnapshot()
  })
})
