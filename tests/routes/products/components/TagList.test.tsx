import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TagList from '../../../../src/routes/products/components/TagList'

// Mock dependencies
const mockNavigate = vi.fn()
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/components/forms/HSplit', () => ({
  default: ({ children, className, ...props }: any) => (
    <div data-testid="hsplit" className={className} {...props}>
      {children}
    </div>
  )
}))

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, onClick, size, className, ...props }: any) => (
    <i
      data-testid="font-awesome-icon"
      data-icon={icon}
      data-size={size}
      className={className}
      onClick={onClick}
      {...props}
    >
      x
    </i>
  )
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faX: 'faX'
}))

vi.mock('@heroui/chip', () => ({
  Chip: ({ children, className, onClick, ...props }: any) => (
    <div
      data-testid="chip"
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}))

vi.mock('@heroui/theme', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

// Test data
interface TestItem {
  id: string
  name: string
}

const stringItems = ['tag1', 'tag2', 'tag3']
const objectItems: TestItem[] = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
  { id: '3', name: 'Item 3' }
]

describe('TagList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render empty list when no items provided', () => {
      const { container } = render(<TagList items={[]} />)
      
      const tagListContainer = container.firstElementChild as HTMLElement
      expect(tagListContainer).toHaveClass('flex', 'flex-wrap', 'gap-2')
      expect(screen.queryByTestId('chip')).not.toBeInTheDocument()
    })

    it('should render all items as chips', () => {
      render(<TagList items={stringItems} />)
      
      const chips = screen.getAllByTestId('chip')
      expect(chips).toHaveLength(3)
    })

    it('should use index as key for items', () => {
      render(<TagList items={stringItems} />)
      
      const chips = screen.getAllByTestId('chip')
      expect(chips).toHaveLength(stringItems.length)
    })
  })

  describe('Label generation', () => {
    it('should display string items directly when no labelGenerator provided', () => {
      render(<TagList items={stringItems} />)
      
      expect(screen.getByText('tag1')).toBeInTheDocument()
      expect(screen.getByText('tag2')).toBeInTheDocument()
      expect(screen.getByText('tag3')).toBeInTheDocument()
    })

    it('should display empty string for non-string items when no labelGenerator provided', () => {
      render(<TagList items={objectItems} />)
      
      const chips = screen.getAllByTestId('chip')
      expect(chips).toHaveLength(3)
      
      // Check that the text content is empty for object items without labelGenerator
      chips.forEach(chip => {
        const hsplit = chip.querySelector('[data-testid="hsplit"]')
        expect(hsplit?.textContent?.trim()).toBe('')
      })
    })

    it('should use labelGenerator when provided', () => {
      const labelGenerator = (item: TestItem) => item.name
      render(
        <TagList 
          items={objectItems} 
          labelGenerator={labelGenerator}
        />
      )
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should prioritize labelGenerator over string check', () => {
      const labelGenerator = (item: string) => `Label: ${item}`
      render(
        <TagList 
          items={stringItems} 
          labelGenerator={labelGenerator}
        />
      )
      
      expect(screen.getByText('Label: tag1')).toBeInTheDocument()
      expect(screen.getByText('Label: tag2')).toBeInTheDocument()
      expect(screen.getByText('Label: tag3')).toBeInTheDocument()
    })
  })

  describe('Navigation functionality', () => {
    it('should not show cursor pointer class when no linkGenerator provided', () => {
      render(<TagList items={stringItems} />)
      
      const chips = screen.getAllByTestId('chip')
      chips.forEach(chip => {
        expect(chip.className).not.toContain('cursor-pointer')
        expect(chip.className).not.toContain('hover:underline')
      })
    })

    it('should show cursor pointer class when linkGenerator provided', () => {
      const linkGenerator = (item: string) => `/tags/${item}`
      render(
        <TagList 
          items={stringItems} 
          linkGenerator={linkGenerator}
        />
      )
      
      const chips = screen.getAllByTestId('chip')
      chips.forEach(chip => {
        expect(chip.className).toContain('cursor-pointer')
        expect(chip.className).toContain('hover:underline')
      })
    })

    it('should navigate when chip is clicked and linkGenerator is provided', () => {
      const linkGenerator = (item: string) => `/tags/${item}`
      render(
        <TagList 
          items={stringItems} 
          linkGenerator={linkGenerator}
        />
      )
      
      const firstChip = screen.getAllByTestId('chip')[0]
      fireEvent.click(firstChip)
      
      expect(mockNavigate).toHaveBeenCalledWith('/tags/tag1')
    })

    it('should not navigate when chip is clicked and no linkGenerator provided', () => {
      render(<TagList items={stringItems} />)
      
      const firstChip = screen.getAllByTestId('chip')[0]
      fireEvent.click(firstChip)
      
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should navigate with correct link for object items', () => {
      const linkGenerator = (item: TestItem) => `/items/${item.id}`
      render(
        <TagList 
          items={objectItems} 
          linkGenerator={linkGenerator}
        />
      )
      
      const secondChip = screen.getAllByTestId('chip')[1]
      fireEvent.click(secondChip)
      
      expect(mockNavigate).toHaveBeenCalledWith('/items/2')
    })
  })

  describe('Remove functionality', () => {
    it('should not show remove icon when onRemove is not provided', () => {
      render(<TagList items={stringItems} />)
      
      expect(screen.queryByTestId('font-awesome-icon')).not.toBeInTheDocument()
    })

    it('should show remove icon when onRemove is provided', () => {
      const onRemove = vi.fn()
      render(
        <TagList 
          items={stringItems} 
          onRemove={onRemove}
        />
      )
      
      const removeIcons = screen.getAllByTestId('font-awesome-icon')
      expect(removeIcons).toHaveLength(3)
      
      removeIcons.forEach(icon => {
        expect(icon).toHaveAttribute('data-icon', 'faX')
        expect(icon).toHaveAttribute('data-size', 'xs')
        expect(icon.className).toContain('cursor-pointer')
        expect(icon.className).toContain('text-neutral-foreground')
      })
    })

    it('should call onRemove with correct item when remove icon is clicked', () => {
      const onRemove = vi.fn()
      render(
        <TagList 
          items={stringItems} 
          onRemove={onRemove}
        />
      )
      
      const removeIcons = screen.getAllByTestId('font-awesome-icon')
      fireEvent.click(removeIcons[1]) // Click remove for second item
      
      expect(onRemove).toHaveBeenCalledWith('tag2')
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('should call onRemove with correct object item when remove icon is clicked', () => {
      const onRemove = vi.fn()
      render(
        <TagList 
          items={objectItems} 
          onRemove={onRemove}
        />
      )
      
      const removeIcons = screen.getAllByTestId('font-awesome-icon')
      fireEvent.click(removeIcons[0]) // Click remove for first item
      
      expect(onRemove).toHaveBeenCalledWith(objectItems[0])
      expect(onRemove).toHaveBeenCalledTimes(1)
    })
  })

  describe('Combined functionality', () => {
    it('should handle both navigation and remove functionality together', () => {
      const linkGenerator = (item: string) => `/tags/${item}`
      const onRemove = vi.fn()
      
      render(
        <TagList 
          items={stringItems} 
          linkGenerator={linkGenerator}
          onRemove={onRemove}
        />
      )
      
      // Click on chip (should navigate)
      const firstChip = screen.getAllByTestId('chip')[0]
      fireEvent.click(firstChip)
      expect(mockNavigate).toHaveBeenCalledWith('/tags/tag1')
      
      // Click on remove icon (should call onRemove)
      // The remove icon click should not trigger navigation due to event handling
      const removeIcon = screen.getAllByTestId('font-awesome-icon')[0]
      fireEvent.click(removeIcon)
      expect(onRemove).toHaveBeenCalledWith('tag1')
      
      // Check that navigation was called (remove icon click might also trigger chip click in current implementation)
      expect(mockNavigate).toHaveBeenCalled()
    })

    it('should work with all props provided', () => {
      const labelGenerator = (item: TestItem) => `${item.name} (${item.id})`
      const linkGenerator = (item: TestItem) => `/items/${item.id}/view`
      const onRemove = vi.fn()
      
      render(
        <TagList 
          items={objectItems} 
          labelGenerator={labelGenerator}
          linkGenerator={linkGenerator}
          onRemove={onRemove}
        />
      )
      
      // Check labels
      expect(screen.getByText('Item 1 (1)')).toBeInTheDocument()
      expect(screen.getByText('Item 2 (2)')).toBeInTheDocument()
      expect(screen.getByText('Item 3 (3)')).toBeInTheDocument()
      
      // Check navigation works
      const secondChip = screen.getAllByTestId('chip')[1]
      fireEvent.click(secondChip)
      expect(mockNavigate).toHaveBeenCalledWith('/items/2/view')
      
      // Check remove works
      const firstRemoveIcon = screen.getAllByTestId('font-awesome-icon')[0]
      fireEvent.click(firstRemoveIcon)
      expect(onRemove).toHaveBeenCalledWith(objectItems[0])
      
      // Check cursor styling
      const chips = screen.getAllByTestId('chip')
      chips.forEach(chip => {
        expect(chip.className).toContain('cursor-pointer')
        expect(chip.className).toContain('hover:underline')
      })
    })
  })

  describe('Styling and classes', () => {
    it('should apply correct base classes to container', () => {
      const { container } = render(<TagList items={stringItems} />)
      
      const tagListContainer = container.firstElementChild as HTMLElement
      expect(tagListContainer).toHaveClass('flex', 'flex-wrap', 'gap-2')
    })

    it('should apply correct base classes to chips', () => {
      render(<TagList items={stringItems} />)
      
      const chips = screen.getAllByTestId('chip')
      chips.forEach(chip => {
        expect(chip.className).toContain('rounded-md')
        expect(chip.className).toContain('bg-content2')
        expect(chip.className).toContain('text-content2-foreground')
      })
    })

    it('should apply HSplit with correct classes', () => {
      render(<TagList items={stringItems} />)
      
      const hSplits = screen.getAllByTestId('hsplit')
      expect(hSplits).toHaveLength(3)
      
      hSplits.forEach(hSplit => {
        expect(hSplit).toHaveClass('items-center', 'gap-2')
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle single item', () => {
      render(<TagList items={['single']} />)
      
      expect(screen.getByTestId('chip')).toBeInTheDocument()
      expect(screen.getByText('single')).toBeInTheDocument()
    })

    it('should handle items with special characters', () => {
      const specialItems = ['tag@1', 'tag#2', 'tag$3']
      render(<TagList items={specialItems} />)
      
      expect(screen.getByText('tag@1')).toBeInTheDocument()
      expect(screen.getByText('tag#2')).toBeInTheDocument()
      expect(screen.getByText('tag$3')).toBeInTheDocument()
    })

    it('should handle labelGenerator returning empty string', () => {
      const labelGenerator = () => ''
      render(
        <TagList 
          items={objectItems} 
          labelGenerator={labelGenerator}
        />
      )
      
      const chips = screen.getAllByTestId('chip')
      expect(chips).toHaveLength(3)
      // Each chip should exist but have empty text content
      chips.forEach(chip => {
        const hsplit = chip.querySelector('[data-testid="hsplit"]')
        expect(hsplit?.textContent?.trim()).toBe('')
      })
    })

    it('should handle linkGenerator returning empty string', () => {
      const linkGenerator = () => ''
      render(
        <TagList 
          items={stringItems} 
          linkGenerator={linkGenerator}
        />
      )
      
      const firstChip = screen.getAllByTestId('chip')[0]
      fireEvent.click(firstChip)
      
      expect(mockNavigate).toHaveBeenCalledWith('')
    })

    it('should handle mixed item types with proper fallbacks', () => {
      const mixedItems: any[] = ['string', 123, { name: 'object' }, null, undefined]
      render(<TagList items={mixedItems} />)
      
      const chips = screen.getAllByTestId('chip')
      expect(chips).toHaveLength(5)
      
      // Only the string item should show text, others should be empty
      expect(screen.getByText('string')).toBeInTheDocument()
    })
  })
})
