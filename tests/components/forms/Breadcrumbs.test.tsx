import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import Breadcrumbs from '../../../src/components/forms/Breadcrumbs'

// Mock HeroUI Breadcrumbs component
vi.mock('@heroui/react', () => ({
  Breadcrumbs: vi.fn(({ children, maxItems, radius, variant, classNames, ...props }: any) => (
    <nav 
      data-testid="hero-breadcrumbs" 
      data-max-items={maxItems}
      data-radius={radius}
      data-variant={variant}
      data-classnames={classNames ? JSON.stringify(classNames) : ''}
      {...props}
    >
      {children}
    </nav>
  )),
}))

describe('Breadcrumbs', () => {
  it('should render with children', () => {
    render(
      <Breadcrumbs>
        <span>Home</span>
        <span>Category</span>
        <span>Product</span>
      </Breadcrumbs>
    )
    
    const breadcrumbs = screen.getByTestId('hero-breadcrumbs')
    expect(breadcrumbs).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
  })

  it('should apply default props', () => {
    render(
      <Breadcrumbs>
        <span>Home</span>
      </Breadcrumbs>
    )
    
    const breadcrumbs = screen.getByTestId('hero-breadcrumbs')
    expect(breadcrumbs).toHaveAttribute('data-max-items', '10')
    expect(breadcrumbs).toHaveAttribute('data-radius', 'lg')
    expect(breadcrumbs).toHaveAttribute('data-variant', 'solid')
  })

  it('should apply custom classNames', () => {
    render(
      <Breadcrumbs>
        <span>Home</span>
      </Breadcrumbs>
    )
    
    const breadcrumbs = screen.getByTestId('hero-breadcrumbs')
    expect(breadcrumbs).toHaveAttribute('data-classnames', JSON.stringify({
      list: 'bg-white border-1 border-default-200',
    }))
  })

  it('should render single breadcrumb item', () => {
    render(
      <Breadcrumbs>
        <span>Home</span>
      </Breadcrumbs>
    )
    
    const breadcrumbs = screen.getByTestId('hero-breadcrumbs')
    expect(breadcrumbs).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('should render multiple breadcrumb items', () => {
    render(
      <Breadcrumbs>
        <span>Home</span>
        <span>Products</span>
        <span>Category</span>
        <span>Subcategory</span>
        <span>Item</span>
      </Breadcrumbs>
    )
    
    const breadcrumbs = screen.getByTestId('hero-breadcrumbs')
    expect(breadcrumbs).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Subcategory')).toBeInTheDocument()
    expect(screen.getByText('Item')).toBeInTheDocument()
  })
})
