import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { LanguageSwitcher } from '../../../src/components/forms/LanguageSwitcher'

// Mock react-i18next
const mockChangeLanguage = vi.fn()
const mockI18n = {
  language: 'en',
  changeLanguage: mockChangeLanguage,
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}))

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  ButtonGroup: vi.fn(({ children }: any) => <div data-testid="button-group">{children}</div>),
  Button: vi.fn(({ children, onPress, color, size }: any) => (
    <button 
      onClick={onPress}
      data-testid="language-button"
      data-color={color}
      data-size={size}
    >
      {children}
    </button>
  )),
}))

// Mock localStorage
const mockSetItem = vi.fn()
Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: mockSetItem,
  },
  writable: true,
})

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockI18n.language = 'en'
  })

  it('should render without crashing', () => {
    render(<LanguageSwitcher />)
    
    expect(screen.getByTestId('button-group')).toBeInTheDocument()
  })

  it('should render both language buttons', () => {
    render(<LanguageSwitcher />)
    
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('DE')).toBeInTheDocument()
  })

  it('should highlight current language button', () => {
    mockI18n.language = 'en'
    render(<LanguageSwitcher />)
    
    const buttons = screen.getAllByTestId('language-button')
    const enButton = buttons.find(button => button.textContent === 'EN')
    const deButton = buttons.find(button => button.textContent === 'DE')
    
    expect(enButton).toHaveAttribute('data-color', 'primary')
    expect(deButton).toHaveAttribute('data-color', 'secondary')
  })

  it('should highlight German when German is selected', () => {
    mockI18n.language = 'de'
    render(<LanguageSwitcher />)
    
    const buttons = screen.getAllByTestId('language-button')
    const enButton = buttons.find(button => button.textContent === 'EN')
    const deButton = buttons.find(button => button.textContent === 'DE')
    
    expect(enButton).toHaveAttribute('data-color', 'secondary')
    expect(deButton).toHaveAttribute('data-color', 'primary')
  })

  it('should call changeLanguage when English button is clicked', () => {
    render(<LanguageSwitcher />)
    
    const enButton = screen.getByText('EN')
    fireEvent.click(enButton)
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('en')
    expect(mockSetItem).toHaveBeenCalledWith('i18nextLng', 'en')
  })

  it('should call changeLanguage when German button is clicked', () => {
    render(<LanguageSwitcher />)
    
    const deButton = screen.getByText('DE')
    fireEvent.click(deButton)
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('de')
    expect(mockSetItem).toHaveBeenCalledWith('i18nextLng', 'de')
  })

  it('should have correct button size', () => {
    render(<LanguageSwitcher />)
    
    const buttons = screen.getAllByTestId('language-button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('data-size', 'sm')
    })
  })
})
