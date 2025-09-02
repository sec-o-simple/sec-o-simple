import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import InfoCard from '../../../../src/routes/products/components/InfoCard'

// Mock dependencies
vi.mock('@/components/forms/HSplit', () => ({
  default: ({ children, ...props }: any) => (
    <div data-testid="hsplit" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/forms/VSplit', () => ({
  default: ({ children, ...props }: any) => (
    <div data-testid="vsplit" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/forms/IconButton', () => ({
  default: ({ icon, onPress, ...props }: any) => (
    <button
      data-testid={`icon-button-${icon.iconName || 'unknown'}`}
      onClick={onPress}
      {...props}
    >
      {icon.iconName || 'icon'}
    </button>
  ),
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faEdit: { iconName: 'edit' },
  faTrash: { iconName: 'trash' },
}))

vi.mock('@heroui/react', () => ({
  cn: (...classes: any[]) => {
    // Filter out objects and non-string values, then join valid classes
    return classes
      .filter(
        (cls) =>
          typeof cls === 'string' || (typeof cls === 'object' && cls !== null),
      )
      .map((cls) => {
        if (typeof cls === 'string') return cls
        if (typeof cls === 'object' && cls !== null) {
          // Handle conditional classes object like { 'hover:underline': linkTo }
          return Object.entries(cls)
            .filter(([, condition]) => condition)
            .map(([className]) => className)
            .join(' ')
        }
        return ''
      })
      .filter(Boolean)
      .join(' ')
  },
}))

// Helper to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}

describe('InfoCard', () => {
  describe('Basic Functionality', () => {
    it('should render with minimal props', () => {
      renderWithRouter(<InfoCard title="Test Title" />)

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      // Since VSplit is mocked to render as div with data-testid="vsplit" only when no other testid is provided
      expect(screen.getByTestId('vsplit')).toBeInTheDocument()
      expect(screen.getByTestId('hsplit')).toBeInTheDocument()
    })

    it('should render title and description', () => {
      renderWithRouter(
        <InfoCard title="Card Title" description="Card description" />,
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card description')).toBeInTheDocument()
    })

    it('should render children content', () => {
      renderWithRouter(
        <InfoCard title="Test Title">
          <div>Child content</div>
        </InfoCard>,
      )

      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('should pass through HTML div props', () => {
      renderWithRouter(
        <InfoCard
          title="Test Title"
          id="test-id"
          className="test-class"
          data-testid="info-card"
        />,
      )

      const container = screen.getByTestId('info-card')
      expect(container).toHaveAttribute('id', 'test-id')
      expect(container).toHaveAttribute(
        'class',
        expect.stringContaining('test-class'),
      )
      expect(container).toHaveAttribute('data-testid', 'info-card')
    })
  })

  describe('Variant Handling', () => {
    it('should render plain variant by default', () => {
      renderWithRouter(<InfoCard title="Test Title" />)

      // Should not have the boxed wrapper
      expect(
        screen.queryByText('Test Title')?.closest('.rounded-lg'),
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('vsplit')).toBeInTheDocument()
    })

    it('should render plain variant when explicitly specified', () => {
      renderWithRouter(<InfoCard title="Test Title" variant="plain" />)

      expect(
        screen.queryByText('Test Title')?.closest('.rounded-lg'),
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('vsplit')).toBeInTheDocument()
    })

    it('should render boxed variant', () => {
      renderWithRouter(<InfoCard title="Test Title" variant="boxed" />)

      const boxedContainer = screen
        .getByText('Test Title')
        .closest('.rounded-lg')
      expect(boxedContainer).toBeInTheDocument()
      expect(boxedContainer).toHaveClass(
        'border',
        'bg-content1',
        'px-4',
        'py-2',
      )
    })

    it('should pass props to inner InfoCard in boxed variant', () => {
      const onEdit = vi.fn()
      renderWithRouter(
        <InfoCard
          title="Boxed Title"
          variant="boxed"
          description="Boxed description"
          onEdit={onEdit}
        />,
      )

      expect(screen.getByText('Boxed Title')).toBeInTheDocument()
      expect(screen.getByText('Boxed description')).toBeInTheDocument()
      expect(screen.getByTestId('icon-button-edit')).toBeInTheDocument()
    })
  })

  describe('Content Areas', () => {
    it('should render startContent', () => {
      renderWithRouter(
        <InfoCard
          title="Test Title"
          startContent={<span data-testid="start-content">Start</span>}
        />,
      )

      expect(screen.getByTestId('start-content')).toBeInTheDocument()
      expect(screen.getByText('Start')).toBeInTheDocument()
    })

    it('should render endContent', () => {
      renderWithRouter(
        <InfoCard
          title="Test Title"
          endContent={<span data-testid="end-content">End</span>}
        />,
      )

      expect(screen.getByTestId('end-content')).toBeInTheDocument()
      expect(screen.getByText('End')).toBeInTheDocument()
    })

    it('should render both startContent and endContent', () => {
      renderWithRouter(
        <InfoCard
          title="Test Title"
          startContent={<span data-testid="start-content">Start</span>}
          endContent={<span data-testid="end-content">End</span>}
        />,
      )

      expect(screen.getByTestId('start-content')).toBeInTheDocument()
      expect(screen.getByTestId('end-content')).toBeInTheDocument()
    })
  })

  describe('Link Functionality', () => {
    it('should render title as plain text when no linkTo prop', () => {
      renderWithRouter(<InfoCard title="Plain Title" />)

      const titleElement = screen.getByText('Plain Title')
      expect(titleElement.tagName).not.toBe('A')
      expect(titleElement.closest('a')).not.toBeInTheDocument()
    })

    it('should render title as link when linkTo prop is provided', () => {
      renderWithRouter(<InfoCard title="Linked Title" linkTo="/test-path" />)

      const linkElement = screen.getByRole('link', { name: 'Linked Title' })
      expect(linkElement).toBeInTheDocument()
      expect(linkElement).toHaveAttribute('href', '/test-path')
    })

    it('should apply hover:underline class when linkTo is provided', () => {
      renderWithRouter(<InfoCard title="Linked Title" linkTo="/test-path" />)

      const titleContainer = screen
        .getByText('Linked Title')
        .closest('.font-bold')
      expect(titleContainer).toHaveClass('hover:underline')
    })

    it('should not apply hover:underline class when no linkTo', () => {
      renderWithRouter(<InfoCard title="Plain Title" />)

      const titleContainer = screen
        .getByText('Plain Title')
        .closest('.font-bold')
      expect(titleContainer).not.toHaveClass('hover:underline')
    })
  })

  describe('Action Buttons', () => {
    it('should not render edit button when onEdit is not provided', () => {
      renderWithRouter(<InfoCard title="Test Title" />)

      expect(screen.queryByTestId('icon-button-edit')).not.toBeInTheDocument()
    })

    it('should render edit button when onEdit is provided', () => {
      const onEdit = vi.fn()
      renderWithRouter(<InfoCard title="Test Title" onEdit={onEdit} />)

      expect(screen.getByTestId('icon-button-edit')).toBeInTheDocument()
    })

    it('should call onEdit when edit button is clicked', () => {
      const onEdit = vi.fn()
      renderWithRouter(<InfoCard title="Test Title" onEdit={onEdit} />)

      fireEvent.click(screen.getByTestId('icon-button-edit'))
      expect(onEdit).toHaveBeenCalledTimes(1)
    })

    it('should not render delete button when onDelete is not provided', () => {
      renderWithRouter(<InfoCard title="Test Title" />)

      expect(screen.queryByTestId('icon-button-trash')).not.toBeInTheDocument()
    })

    it('should render delete button when onDelete is provided', () => {
      const onDelete = vi.fn()
      renderWithRouter(<InfoCard title="Test Title" onDelete={onDelete} />)

      expect(screen.getByTestId('icon-button-trash')).toBeInTheDocument()
    })

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = vi.fn()
      renderWithRouter(<InfoCard title="Test Title" onDelete={onDelete} />)

      fireEvent.click(screen.getByTestId('icon-button-trash'))
      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('should render both edit and delete buttons', () => {
      const onEdit = vi.fn()
      const onDelete = vi.fn()
      renderWithRouter(
        <InfoCard title="Test Title" onEdit={onEdit} onDelete={onDelete} />,
      )

      expect(screen.getByTestId('icon-button-edit')).toBeInTheDocument()
      expect(screen.getByTestId('icon-button-trash')).toBeInTheDocument()
    })

    it('should call respective functions when both buttons are clicked', () => {
      const onEdit = vi.fn()
      const onDelete = vi.fn()
      renderWithRouter(
        <InfoCard title="Test Title" onEdit={onEdit} onDelete={onDelete} />,
      )

      fireEvent.click(screen.getByTestId('icon-button-edit'))
      fireEvent.click(screen.getByTestId('icon-button-trash'))

      expect(onEdit).toHaveBeenCalledTimes(1)
      expect(onDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe('Complex Scenarios', () => {
    it('should render all props together in plain variant', () => {
      const onEdit = vi.fn()
      const onDelete = vi.fn()

      renderWithRouter(
        <InfoCard
          title="Complex Title"
          description="Complex description"
          variant="plain"
          linkTo="/complex-path"
          startContent={<span data-testid="start">Start</span>}
          endContent={<span data-testid="end">End</span>}
          onEdit={onEdit}
          onDelete={onDelete}
          className="custom-class"
          data-testid="complex-card"
        >
          <div data-testid="complex-children">Complex children</div>
        </InfoCard>,
      )

      // Verify all elements are present
      expect(screen.getByText('Complex Title')).toBeInTheDocument()
      expect(screen.getByText('Complex description')).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Complex Title' }),
      ).toHaveAttribute('href', '/complex-path')
      expect(screen.getByTestId('start')).toBeInTheDocument()
      expect(screen.getByTestId('end')).toBeInTheDocument()
      expect(screen.getByTestId('icon-button-edit')).toBeInTheDocument()
      expect(screen.getByTestId('icon-button-trash')).toBeInTheDocument()
      expect(screen.getByTestId('complex-children')).toBeInTheDocument()

      // Verify the custom props are applied
      const container = screen.getByTestId('complex-card')
      expect(container).toHaveAttribute(
        'class',
        expect.stringContaining('custom-class'),
      )
      expect(container).toHaveAttribute('data-testid', 'complex-card')
    })

    it('should render all props together in boxed variant', () => {
      const onEdit = vi.fn()
      const onDelete = vi.fn()

      renderWithRouter(
        <InfoCard
          title="Boxed Complex Title"
          description="Boxed complex description"
          variant="boxed"
          linkTo="/boxed-path"
          startContent={<span data-testid="boxed-start">Start</span>}
          endContent={<span data-testid="boxed-end">End</span>}
          onEdit={onEdit}
          onDelete={onDelete}
        >
          <div data-testid="boxed-children">Boxed children</div>
        </InfoCard>,
      )

      // Verify boxed container
      const boxedContainer = screen
        .getByText('Boxed Complex Title')
        .closest('.rounded-lg')
      expect(boxedContainer).toBeInTheDocument()

      // Verify all inner elements are present
      expect(screen.getByText('Boxed Complex Title')).toBeInTheDocument()
      expect(screen.getByText('Boxed complex description')).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Boxed Complex Title' }),
      ).toHaveAttribute('href', '/boxed-path')
      expect(screen.getByTestId('boxed-start')).toBeInTheDocument()
      expect(screen.getByTestId('boxed-end')).toBeInTheDocument()
      expect(screen.getByTestId('icon-button-edit')).toBeInTheDocument()
      expect(screen.getByTestId('icon-button-trash')).toBeInTheDocument()
      expect(screen.getByTestId('boxed-children')).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      renderWithRouter(
        <InfoCard title="Multi Children Title">
          <div data-testid="child-1">First child</div>
          <span data-testid="child-2">Second child</span>
          <p data-testid="child-3">Third child</p>
        </InfoCard>,
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      renderWithRouter(<InfoCard title="" />)

      // Should still render the structure
      expect(screen.getByTestId('vsplit')).toBeInTheDocument()
      expect(screen.getByTestId('hsplit')).toBeInTheDocument()
    })

    it('should handle empty description', () => {
      renderWithRouter(<InfoCard title="Title" description="" />)

      expect(screen.getByText('Title')).toBeInTheDocument()
      // Empty description should still render but be empty
      const descriptionElement = document.querySelector(
        '.text-neutral-foreground',
      )
      expect(descriptionElement).toBeInTheDocument()
    })

    it('should handle undefined description', () => {
      renderWithRouter(<InfoCard title="Title" description={undefined} />)

      expect(screen.getByText('Title')).toBeInTheDocument()
      const descriptionElement = document.querySelector(
        '.text-neutral-foreground',
      )
      expect(descriptionElement).toBeInTheDocument()
    })

    it('should handle empty linkTo string', () => {
      renderWithRouter(<InfoCard title="Title" linkTo="" />)

      const titleElement = screen.getByText('Title')
      // The title should be inside a div with font-bold class
      const titleContainer = titleElement.closest('.font-bold')
      expect(titleContainer).toBeInTheDocument()
      expect(titleContainer).toHaveClass('font-bold')

      // Empty string is falsy, so hover:underline should NOT be applied
      expect(titleContainer).not.toHaveClass('hover:underline')

      // Empty string is falsy, so NO Link element should be rendered
      expect(titleElement.closest('a')).toBeNull()
    })

    it('should work without router context for non-link elements', () => {
      // Test without MemoryRouter to ensure it doesn't break
      render(<InfoCard title="No Router Title" />)

      expect(screen.getByText('No Router Title')).toBeInTheDocument()
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should apply correct CSS classes to title container', () => {
      renderWithRouter(<InfoCard title="Styled Title" />)

      const titleContainer = screen
        .getByText('Styled Title')
        .closest('.font-bold')
      expect(titleContainer).toHaveClass('font-bold')
    })

    it('should apply correct CSS classes to title container with link', () => {
      renderWithRouter(<InfoCard title="Linked Styled Title" linkTo="/path" />)

      const titleContainer = screen
        .getByText('Linked Styled Title')
        .closest('.font-bold')
      expect(titleContainer).toHaveClass('font-bold', 'hover:underline')
    })

    it('should apply correct CSS classes to description', () => {
      renderWithRouter(
        <InfoCard title="Title" description="Styled description" />,
      )

      const descriptionElement = screen.getByText('Styled description')
      expect(descriptionElement).toHaveClass('text-neutral-foreground')
    })

    it('should apply correct CSS classes to content areas', () => {
      renderWithRouter(<InfoCard title="Title" />)

      const leftContentArea = document.querySelector('.flex.items-center.gap-2')
      const rightContentArea =
        leftContentArea?.parentElement?.querySelector('div:last-child')

      expect(leftContentArea).toHaveClass('flex', 'items-center', 'gap-2')
      expect(rightContentArea).toBeInTheDocument()
    })

    it('should apply correct CSS classes to HSplit container', () => {
      renderWithRouter(<InfoCard title="Title" />)

      const hsplit = screen.getByTestId('hsplit')
      expect(hsplit).toHaveClass('flex', 'items-center', 'justify-between')
    })
  })
})
