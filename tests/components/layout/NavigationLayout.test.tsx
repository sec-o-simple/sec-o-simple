import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NavigationLayout from '../../../src/components/layout/NavigationLayout'

// Mock React Router
vi.mock('react-router', () => ({
  NavLink: vi.fn(({ children, to, className }: any) => (
    <a href={to} className={className} data-testid="nav-link">
      {children}
    </a>
  )),
  Outlet: vi.fn(() => <div data-testid="router-outlet">Outlet content</div>),
  useLocation: vi.fn(() => ({
    pathname: '/document-information/general',
  })),
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock validation hooks
vi.mock('../../../src/utils/validation/usePathValidation', () => ({
  usePathValidation: vi.fn(() => ({
    hasErrors: false,
  })),
}))

// Mock components
vi.mock('../../../src/components/forms/LanguageSwitcher', () => ({
  LanguageSwitcher: vi.fn(() => (
    <div data-testid="language-switcher">Language Switcher</div>
  )),
}))

vi.mock('../../../src/components/forms/SecOSimpleVersion', () => ({
  default: vi.fn(() => <div data-testid="version">Version info</div>),
}))

vi.mock('../../../src/components/StatusIndicator', () => ({
  default: vi.fn(({ hasErrors }: any) => (
    <div data-testid="status-indicator" data-has-errors={hasErrors}>
      Status indicator
    </div>
  )),
}))

describe('NavigationLayout', () => {
  it('should render without crashing', () => {
    render(<NavigationLayout />)

    expect(screen.getByTestId('router-outlet')).toBeInTheDocument()
  })

  it('should render language switcher', () => {
    render(<NavigationLayout />)

    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
  })

  it('should render version info', () => {
    render(<NavigationLayout />)

    expect(screen.getByTestId('version')).toBeInTheDocument()
  })

  it('should render navigation sections', () => {
    render(<NavigationLayout />)

    // Check for navigation text (using actual translation keys from the component)
    expect(screen.getByText('nav.documentInfo')).toBeInTheDocument()
    expect(screen.getByText('nav.productManagement.title')).toBeInTheDocument()
    expect(screen.getByText('nav.vulnerabilities')).toBeInTheDocument()
    expect(screen.getByText('nav.tracking')).toBeInTheDocument()
  })

  it('should render status indicators', () => {
    render(<NavigationLayout />)

    const statusIndicators = screen.getAllByTestId('status-indicator')
    expect(statusIndicators).toHaveLength(8) // One for each navigation item that has validation
  })

  it('should render navigation links', () => {
    render(<NavigationLayout />)

    const navLinks = screen.getAllByTestId('nav-link')
    expect(navLinks.length).toBeGreaterThan(0)
  })

  it('should render router outlet for main content', () => {
    render(<NavigationLayout />)

    expect(screen.getByTestId('router-outlet')).toBeInTheDocument()
    expect(screen.getByText('Outlet content')).toBeInTheDocument()
  })
})
