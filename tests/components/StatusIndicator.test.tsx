import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import StatusIndicator from '../../src/components/StatusIndicator'

describe('StatusIndicator', () => {
  it('should render with neutral background when not visited', () => {
    const { container } = render(
      <StatusIndicator hasErrors={false} hasVisited={false} />
    )
    
    const indicator = container.firstChild as HTMLElement
    expect(indicator).toHaveClass('bg-neutral-300')
    expect(indicator).not.toHaveClass('bg-red-400', 'bg-green-500')
  })

  it('should render with neutral background when not visited even with errors', () => {
    const { container } = render(
      <StatusIndicator hasErrors={true} hasVisited={false} />
    )
    
    const indicator = container.firstChild as HTMLElement
    expect(indicator).toHaveClass('bg-neutral-300')
    expect(indicator).not.toHaveClass('bg-red-400', 'bg-green-500')
  })

  it('should render with red background when visited and has errors', () => {
    const { container } = render(
      <StatusIndicator hasErrors={true} hasVisited={true} />
    )
    
    const indicator = container.firstChild as HTMLElement
    expect(indicator).toHaveClass('bg-red-400')
    expect(indicator).not.toHaveClass('bg-neutral-300', 'bg-green-500')
  })

  it('should render with green background when visited and no errors', () => {
    const { container } = render(
      <StatusIndicator hasErrors={false} hasVisited={true} />
    )
    
    const indicator = container.firstChild as HTMLElement
    expect(indicator).toHaveClass('bg-green-500')
    expect(indicator).not.toHaveClass('bg-neutral-300', 'bg-red-400')
  })

  it('should always have base classes', () => {
    const { container } = render(
      <StatusIndicator hasErrors={false} hasVisited={false} />
    )
    
    const indicator = container.firstChild as HTMLElement
    expect(indicator).toHaveClass('size-2', 'rounded-full')
    expect(indicator.tagName).toBe('DIV')
  })
})
