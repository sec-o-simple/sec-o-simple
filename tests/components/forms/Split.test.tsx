import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import VSplit from '../../../src/components/forms/VSplit'
import HSplit from '../../../src/components/forms/HSplit'

describe('Split Components', () => {
  describe('VSplit', () => {
    it('should render children with vertical flex layout', () => {
      const { container } = render(
        <VSplit>
          <div>Child 1</div>
          <div>Child 2</div>
        </VSplit>
      )
      
      const splitDiv = container.firstChild as HTMLElement
      expect(splitDiv).toHaveClass('flex', 'flex-col', 'gap-4')
      expect(splitDiv.children).toHaveLength(2)
      expect(splitDiv.children[0]).toHaveTextContent('Child 1')
      expect(splitDiv.children[1]).toHaveTextContent('Child 2')
    })

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <VSplit className="custom-class">
          <div>Content</div>
        </VSplit>
      )
      
      const splitDiv = container.firstChild as HTMLElement
      expect(splitDiv).toHaveClass('flex', 'flex-col', 'gap-4', 'custom-class')
    })

    it('should override default classes when custom className conflicts', () => {
      const { container } = render(
        <VSplit className="gap-8">
          <div>Content</div>
        </VSplit>
      )
      
      const splitDiv = container.firstChild as HTMLElement
      expect(splitDiv).toHaveClass('flex', 'flex-col', 'gap-8')
      expect(splitDiv).not.toHaveClass('gap-4')
    })

    it('should pass through HTML props', () => {
      const { container } = render(
        <VSplit id="test-id" data-testid="vsplit">
          <div>Content</div>
        </VSplit>
      )
      
      const splitDiv = container.firstChild as HTMLElement
      expect(splitDiv).toHaveAttribute('id', 'test-id')
      expect(splitDiv).toHaveAttribute('data-testid', 'vsplit')
    })

    it('should render with single child', () => {
      const { container } = render(
        <VSplit>
          <span>Single child</span>
        </VSplit>
      )
      
      const splitDiv = container.firstChild as HTMLElement
      expect(splitDiv.children).toHaveLength(1)
      expect(splitDiv.children[0]).toHaveTextContent('Single child')
    })
  })

  describe('HSplit', () => {
    it('should render children with horizontal flex layout', () => {
      const { container } = render(
        <HSplit>
          <div>Child 1</div>
          <div>Child 2</div>
        </HSplit>
      )
      
      const splitDiv = container.firstChild as HTMLElement
      expect(splitDiv).toHaveClass('flex', 'gap-4')
      expect(splitDiv).not.toHaveClass('flex-col')
      expect(splitDiv.children).toHaveLength(2)
      expect(splitDiv.children[0]).toHaveTextContent('Child 1')
      expect(splitDiv.children[1]).toHaveTextContent('Child 2')
    })

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <HSplit className="justify-center">
          <div>Content</div>
        </HSplit>
      )
      
      const splitDiv = container.firstChild as HTMLElement
      expect(splitDiv).toHaveClass('flex', 'gap-4', 'justify-center')
    })

    it('should override default classes when custom className conflicts', () => {
      const { container } = render(
        <HSplit className="gap-2">
          <div>Content</div>
        </HSplit>
      )
      
      const splitDiv = container.firstChild as HTMLElement
      expect(splitDiv).toHaveClass('flex', 'gap-2')
      expect(splitDiv).not.toHaveClass('gap-4')
    })

    it('should pass through HTML props', () => {
      const { container } = render(
        <HSplit role="group" aria-label="Split container">
          <div>Content</div>
        </HSplit>
      )
      
      const splitDiv = container.firstChild as HTMLElement
      expect(splitDiv).toHaveAttribute('role', 'group')
      expect(splitDiv).toHaveAttribute('aria-label', 'Split container')
    })

    it('should handle multiple children correctly', () => {
      const { container } = render(
        <HSplit>
          <button>Button 1</button>
          <button>Button 2</button>
          <button>Button 3</button>
        </HSplit>
      )
      
      const splitDiv = container.firstChild as HTMLElement
      expect(splitDiv.children).toHaveLength(3)
      expect(splitDiv.children[0]).toHaveTextContent('Button 1')
      expect(splitDiv.children[1]).toHaveTextContent('Button 2')
      expect(splitDiv.children[2]).toHaveTextContent('Button 3')
    })
  })
})
