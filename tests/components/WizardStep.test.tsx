import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WizardStep from '../../src/components/WizardStep'

// Mock React Router
const mockNavigate = vi.fn()
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.document': 'Document',
        'nav.productManagement.title': 'Product Management',
        'nav.vulnerabilities': 'Vulnerabilities',
        'nav.tracking': 'Tracking',
        'common.back': 'Back',
        'common.next': 'Next',
      }
      return translations[key] || key
    },
  }),
}))

// Mock HeroUI Button component
vi.mock('@heroui/button', () => ({
  Button: vi.fn(({ children, onPress, variant, color, className }: any) => (
    <button
      onClick={onPress}
      data-variant={variant}
      data-color={color}
      className={className}
    >
      {children}
    </button>
  )),
}))

// Mock ProgressBar component
vi.mock('../../src/components/ProgressBar', () => ({
  default: vi.fn(({ sections, progress }: any) => (
    <div data-testid="progress-bar" data-progress={progress}>
      {sections?.map((section: string, index: number) => (
        <span key={index} data-testid={`section-${index}`}>
          {section}
        </span>
      ))}
    </div>
  )),
}))

describe('WizardStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('should render with progress bar and content', () => {
    const { container } = render(
      <WizardStep title="Test Step">
        <div>Test content</div>
      </WizardStep>,
    )

    expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.getByText('Test Step')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render progress bar with correct sections', () => {
    render(
      <WizardStep title="Test" progress={2}>
        <div>Content</div>
      </WizardStep>,
    )

    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveAttribute('data-progress', '2')
    expect(screen.getByTestId('section-0')).toHaveTextContent('Document')
    expect(screen.getByTestId('section-1')).toHaveTextContent(
      'Product Management',
    )
    expect(screen.getByTestId('section-2')).toHaveTextContent('Vulnerabilities')
    expect(screen.getByTestId('section-3')).toHaveTextContent('Tracking')
  })

  it('should render children content inside wrapper', () => {
    render(
      <WizardStep title="Test">
        <div data-testid="child-content">Child content here</div>
      </WizardStep>,
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Child content here')).toBeInTheDocument()
  })

  it('should render children without wrapper when noContentWrapper is true', () => {
    render(
      <WizardStep title="Test" noContentWrapper>
        <div data-testid="unwrapped-content">Unwrapped content</div>
      </WizardStep>,
    )

    expect(screen.getByTestId('unwrapped-content')).toBeInTheDocument()
    expect(screen.getByText('Unwrapped content')).toBeInTheDocument()
  })

  it('should render title when provided', () => {
    render(
      <WizardStep title="Custom Title">
        <div>Content</div>
      </WizardStep>,
    )

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('should not render title element when title is empty', () => {
    render(
      <WizardStep title="" progress={1}>
        <div>Content without title</div>
      </WizardStep>,
    )

    expect(screen.getByText('Content without title')).toBeInTheDocument()
    // Check that no title heading element is rendered when title is empty
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('should render back button when onBack is provided', () => {
    const mockOnBack = vi.fn()
    render(
      <WizardStep title="Test" onBack={mockOnBack}>
        <div>Content</div>
      </WizardStep>,
    )

    const backButton = screen.getByText('Back')
    expect(backButton).toBeInTheDocument()

    fireEvent.click(backButton)
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('should render continue button when onContinue is provided', () => {
    const mockOnContinue = vi.fn()
    render(
      <WizardStep title="Test" onContinue={mockOnContinue}>
        <div>Content</div>
      </WizardStep>,
    )

    const continueButton = screen.getByText('Next')
    expect(continueButton).toBeInTheDocument()

    fireEvent.click(continueButton)
    expect(mockOnContinue).toHaveBeenCalledTimes(1)
  })

  it('should navigate when onBack is a string', () => {
    render(
      <WizardStep title="Test" onBack="/previous">
        <div>Content</div>
      </WizardStep>,
    )

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/previous')
  })

  it('should navigate when onContinue is a string', () => {
    render(
      <WizardStep title="Test" onContinue="/next">
        <div>Content</div>
      </WizardStep>,
    )

    const continueButton = screen.getByText('Next')
    fireEvent.click(continueButton)

    expect(mockNavigate).toHaveBeenCalledWith('/next')
  })

  it('should use default progress value when not provided', () => {
    render(
      <WizardStep title="Test">
        <div>Content</div>
      </WizardStep>,
    )

    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveAttribute('data-progress', '1')
  })
})
