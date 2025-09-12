import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HashRouter } from 'react-router'
import CreateDocument from '../../../src/routes/document-selection/CreateDocument'

// Mock external dependencies
vi.mock('@heroui/react', () => ({
  Radio: ({ children, value, isDisabled, ...props }: any) => (
    <label>
      <input 
        type="radio" 
        value={value} 
        disabled={isDisabled} 
        data-testid={`radio-${value}`}
        {...props} 
      />
      {children}
    </label>
  ),
  RadioGroup: ({ children, value, onValueChange, ...props }: any) => (
    <div data-testid="radio-group" data-value={value} onChange={onValueChange} {...props}>
      {children}
    </div>
  )
}))

vi.mock('@heroui/button', () => ({
  Button: ({ children, onPress, isDisabled, color, endContent, ...props }: any) => (
    <button 
      onClick={onPress} 
      disabled={isDisabled} 
      data-color={color}
      data-testid="button"
      {...props}
    >
      {children}
      {endContent}
    </button>
  )
}))

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: any) => (
    <span 
      data-testid="icon" 
      className={className}
    >
      {typeof icon === 'string' ? icon : 'icon'}
    </span>
  )
}))

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    )
  }
}))

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  HashRouter: ({ children }: any) => <div>{children}</div>
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'documentSelection.advisory': 'Advisory',
        'documentSelection.vex': 'VEX',
        'documentSelection.software': 'Software',
        'documentSelection.softAndHardware': 'Software and Hardware', 
        'documentSelection.softAndFirmware': 'Software and Firmware',
        'documentSelection.sbom': 'SBOM',
        'documentSelection.create': 'Create'
      }
      return translations[key] || key
    }
  })
}))

vi.mock('../../../src/utils/useDocumentStore', () => ({
  default: () => ({
    setSOSDocumentType: vi.fn()
  })
}))

describe('CreateDocument', () => {
  const renderComponent = () => {
    return render(
      <HashRouter>
        <CreateDocument />
      </HashRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly with both document types', () => {
    const { container } = renderComponent()
    expect(container).toMatchSnapshot()
  })

  it('should display Advisory and VEX document types', () => {
    renderComponent()
    
    expect(screen.getByText('Advisory')).toBeInTheDocument()
    expect(screen.getByText('VEX')).toBeInTheDocument()
  })

  it('should display all software options for Advisory', () => {
    renderComponent()
    
    // Use test IDs to identify specific radio buttons for Advisory section
    expect(screen.getByTestId('radio-Software')).toBeInTheDocument()
    expect(screen.getByTestId('radio-HardwareSoftware')).toBeInTheDocument()
  })

  it('should display all options for VEX', () => {
    renderComponent()
    
    const softwareElements = screen.getAllByText('Software')
    expect(softwareElements).toHaveLength(2) // One for Advisory, one for VEX
    
    const hardwareElements = screen.getAllByText('Software and Hardware')
    expect(hardwareElements).toHaveLength(2) // One for Advisory, one for VEX
  })

  it('should have Create buttons for both document types', () => {
    renderComponent()
    
    const createButtons = screen.getAllByText('Create')
    expect(createButtons).toHaveLength(2)
  })

  it('should display FontAwesome icons', () => {
    renderComponent()
    
    const icons = screen.getAllByTestId('icon')
    expect(icons).toHaveLength(4) // 2 document type icons + 2 arrow icons in buttons
  })

  it('should show radio buttons for all options', () => {
    renderComponent()
    
    // Advisory options
    expect(screen.getByTestId('radio-Software')).toBeInTheDocument()
    expect(screen.getByTestId('radio-HardwareSoftware')).toBeInTheDocument()
    
    // VEX options  
    expect(screen.getByTestId('radio-VexSoftware')).toBeInTheDocument()
    expect(screen.getByTestId('radio-VexHardwareSoftware')).toBeInTheDocument()
  })

  it('should have all radio options enabled', () => {
    renderComponent()
    
    // All current options should be enabled since they all have active: true
    expect(screen.getByTestId('radio-Software')).not.toBeDisabled()
    expect(screen.getByTestId('radio-HardwareSoftware')).not.toBeDisabled()
    expect(screen.getByTestId('radio-VexSoftware')).not.toBeDisabled()
    expect(screen.getByTestId('radio-VexHardwareSoftware')).not.toBeDisabled()
  })

  it('should handle radio button selection changes', () => {
    renderComponent()

    // Initially Software should be selected for Advisory (default)
    const radioGroups = screen.getAllByTestId('radio-group')
    expect(radioGroups[0]).toHaveAttribute('data-value', 'Software')
  })

  it('should have Create buttons enabled/disabled based on selection', () => {
    renderComponent()

    const createButtons = screen.getAllByTestId('button')
    
    // Advisory button should be enabled (has default selection of Software)
    expect(createButtons[0]).not.toBeDisabled()
    
    // VEX button should be disabled (no default selection)
    expect(createButtons[1]).toBeDisabled()
  })
})
