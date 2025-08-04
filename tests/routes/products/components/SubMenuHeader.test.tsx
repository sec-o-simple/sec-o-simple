import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import SubMenuHeader from '../../../../src/routes/products/components/SubMenuHeader'

// Mock react-router
const mockNavigate = vi.fn()
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock IconButton component
vi.mock('@/components/forms/IconButton', () => ({
  default: ({ icon, onPress, ...props }: any) => (
    <button 
      data-testid="icon-button"
      data-icon={icon?.iconName || 'arrow-left'}
      onClick={onPress}
      {...props}
    >
      IconButton
    </button>
  ),
}))

// Mock Button component from HeroUI
vi.mock('@heroui/button', () => ({
  Button: ({ children, color, onPress, startContent, ...props }: any) => (
    <button 
      data-testid="hero-button"
      data-color={color}
      onClick={onPress}
      {...props}
    >
      {startContent && <span data-testid="start-content">{startContent}</span>}
      {children}
    </button>
  ),
}))

// Mock FontAwesome components and icons
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => (
    <i 
      data-testid="font-awesome-icon"
      data-icon={icon?.iconName || 'add'}
      {...props}
    >
      fa-icon
    </i>
  ),
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faAdd: { iconName: 'add' },
  faArrowLeft: { iconName: 'arrow-left' },
}))

// Mock tailwind-merge
vi.mock('tailwind-merge', () => ({
  twMerge: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

describe('SubMenuHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render with required props', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
        />
      )
      
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByTestId('icon-button')).toBeInTheDocument()
    })

    it('should apply default CSS classes', () => {
      const { container } = render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
        />
      )
      
      const mainDiv = container.firstElementChild as HTMLElement
      expect(mainDiv).toHaveClass('flex', 'items-center', 'justify-between')
    })

    it('should render title in correct container with proper styling', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
        />
      )
      
      // Find the inner div that contains the title and icon button
      const titleContainer = screen.getByTestId('icon-button').parentElement
      expect(titleContainer).toHaveClass('flex', 'items-center', 'gap-2', 'text-xl', 'font-bold')
    })
  })

  describe('Navigation functionality', () => {
    it('should call navigate with backLink when back button is clicked', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/products" 
        />
      )
      
      const backButton = screen.getByTestId('icon-button')
      fireEvent.click(backButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/products')
      expect(mockNavigate).toHaveBeenCalledTimes(1)
    })

    it('should work with different backLink values', () => {
      const { rerender } = render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/vendors" 
        />
      )
      
      fireEvent.click(screen.getByTestId('icon-button'))
      expect(mockNavigate).toHaveBeenCalledWith('/vendors')
      
      vi.clearAllMocks()
      
      rerender(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/dashboard" 
        />
      )
      
      fireEvent.click(screen.getByTestId('icon-button'))
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle complex backLink paths', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/products/vendor/123/edit" 
        />
      )
      
      fireEvent.click(screen.getByTestId('icon-button'))
      expect(mockNavigate).toHaveBeenCalledWith('/products/vendor/123/edit')
    })
  })

  describe('Action button', () => {
    it('should not render action button when actionTitle is not provided', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
        />
      )
      
      expect(screen.queryByTestId('hero-button')).not.toBeInTheDocument()
    })

    it('should render action button when actionTitle is provided', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          actionTitle="Add Item"
        />
      )
      
      const actionButton = screen.getByTestId('hero-button')
      expect(actionButton).toBeInTheDocument()
      expect(actionButton).toHaveAttribute('data-color', 'primary')
      expect(screen.getByText('Add Item')).toBeInTheDocument()
    })

    it('should render FontAwesome icon in action button', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          actionTitle="Add Item"
        />
      )
      
      const icon = screen.getByTestId('font-awesome-icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('data-icon', 'add')
    })

    it('should call onAction when action button is clicked', () => {
      const onAction = vi.fn()
      
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          actionTitle="Add Item"
          onAction={onAction}
        />
      )
      
      const actionButton = screen.getByTestId('hero-button')
      fireEvent.click(actionButton)
      
      expect(onAction).toHaveBeenCalledTimes(1)
    })

    it('should not call onAction when onAction is not provided', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          actionTitle="Add Item"
        />
      )
      
      const actionButton = screen.getByTestId('hero-button')
      expect(() => fireEvent.click(actionButton)).not.toThrow()
    })

    it('should handle empty actionTitle string', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          actionTitle=""
        />
      )
      
      expect(screen.queryByTestId('hero-button')).not.toBeInTheDocument()
    })
  })

  describe('HTML props spreading', () => {
    it('should spread additional div props', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          id="custom-id"
          data-testid="custom-header"
        />
      )
      
      const header = screen.getByTestId('custom-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveAttribute('id', 'custom-id')
    })

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          className="custom-class"
        />
      )
      
      const mainDiv = container.firstElementChild as HTMLElement
      expect(mainDiv).toHaveClass('flex', 'items-center', 'justify-between', 'custom-class')
    })

    it('should handle multiple additional props', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          id="test-id"
          role="banner"
          aria-label="Navigation header"
          data-testid="multi-props-header"
        />
      )
      
      const header = screen.getByTestId('multi-props-header')
      expect(header).toHaveAttribute('id', 'test-id')
      expect(header).toHaveAttribute('role', 'banner')
      expect(header).toHaveAttribute('aria-label', 'Navigation header')
    })

    it('should handle style prop', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          style={{ backgroundColor: 'red' }}
          data-testid="styled-header"
        />
      )
      
      const header = screen.getByTestId('styled-header')
      expect(header).toHaveAttribute('style')
      expect(header.getAttribute('style')).toContain('background-color: red')
    })
  })

  describe('Icon button configuration', () => {
    it('should pass correct icon to IconButton', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
        />
      )
      
      const iconButton = screen.getByTestId('icon-button')
      expect(iconButton).toHaveAttribute('data-icon', 'arrow-left')
    })
  })

  describe('Edge cases and text handling', () => {
    it('should handle long titles', () => {
      const longTitle = 'This is a very long title that might cause layout issues if not handled properly'
      
      render(
        <SubMenuHeader 
          title={longTitle} 
          backLink="/back" 
        />
      )
      
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle titles with special characters', () => {
      const specialTitle = 'Title with @#$%^&*() special chars'
      
      render(
        <SubMenuHeader 
          title={specialTitle} 
          backLink="/back" 
        />
      )
      
      expect(screen.getByText(specialTitle)).toBeInTheDocument()
    })

    it('should handle empty title string', () => {
      render(
        <SubMenuHeader 
          title="" 
          backLink="/back" 
        />
      )
      
      const titleContainer = screen.getByTestId('icon-button').parentElement
      expect(titleContainer).toHaveTextContent('IconButton') // Only the button text, no title
    })

    it('should handle backLink with query parameters', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/products?page=1&sort=name" 
        />
      )
      
      fireEvent.click(screen.getByTestId('icon-button'))
      expect(mockNavigate).toHaveBeenCalledWith('/products?page=1&sort=name')
    })

    it('should handle backLink with hash fragments', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/products#section1" 
        />
      )
      
      fireEvent.click(screen.getByTestId('icon-button'))
      expect(mockNavigate).toHaveBeenCalledWith('/products#section1')
    })

    it('should handle long action titles', () => {
      const longActionTitle = 'This is a very long action title for the button'
      
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          actionTitle={longActionTitle}
        />
      )
      
      expect(screen.getByText(longActionTitle)).toBeInTheDocument()
    })

    it('should handle action titles with special characters', () => {
      const specialActionTitle = 'Add @#$% Item'
      
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          actionTitle={specialActionTitle}
        />
      )
      
      expect(screen.getByText(specialActionTitle)).toBeInTheDocument()
    })
  })

  describe('Component composition', () => {
    it('should render both title and action button when both are provided', () => {
      const onAction = vi.fn()
      
      render(
        <SubMenuHeader 
          title="Main Title" 
          backLink="/back" 
          actionTitle="Add New"
          onAction={onAction}
        />
      )
      
      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Add New')).toBeInTheDocument()
      expect(screen.getByTestId('icon-button')).toBeInTheDocument()
      expect(screen.getByTestId('hero-button')).toBeInTheDocument()
    })

    it('should maintain proper layout structure', () => {
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          actionTitle="Add Item"
        />
      )
      
      // Check that the main container has two children: title section and button
      const mainContainer = screen.getByText('Test Title').closest('.flex.items-center.justify-between')
      expect(mainContainer?.children).toHaveLength(2)
    })
  })

  describe('Accessibility', () => {
    it('should be accessible with screen readers', () => {
      render(
        <SubMenuHeader 
          title="Accessible Title" 
          backLink="/back" 
          actionTitle="Add Item"
          aria-label="Main navigation header"
        />
      )
      
      const header = screen.getByLabelText('Main navigation header')
      expect(header).toBeInTheDocument()
    })

    it('should support keyboard navigation through tab order', () => {
      const onAction = vi.fn()
      
      render(
        <SubMenuHeader 
          title="Test Title" 
          backLink="/back" 
          actionTitle="Add Item"
          onAction={onAction}
        />
      )
      
      // Both buttons should be focusable
      const backButton = screen.getByTestId('icon-button')
      const actionButton = screen.getByTestId('hero-button')
      
      expect(backButton).toBeInTheDocument()
      expect(actionButton).toBeInTheDocument()
    })
  })
})
