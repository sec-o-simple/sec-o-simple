import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProgressBar from '../../src/components/ProgressBar'

describe('ProgressBar', () => {
  const sections = ['Section 1', 'Section 2', 'Section 3', 'Section 4']

  it('should render progress bar with all sections', () => {
    const { container } = render(
      <ProgressBar sections={sections} progress={2} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render with no progress', () => {
    const { container } = render(
      <ProgressBar sections={sections} progress={0} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render with full progress', () => {
    const { container } = render(
      <ProgressBar sections={sections} progress={4} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render with partial progress', () => {
    const { container } = render(
      <ProgressBar sections={sections} progress={2.5} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render with single section', () => {
    const { container } = render(
      <ProgressBar sections={['Only Section']} progress={1} />
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should highlight active sections', () => {
    const { container } = render(
      <ProgressBar sections={sections} progress={2} />
    )
    
    // Check the rendered structure - numbers are in circles with classes
    const circles = container.querySelectorAll('.size-8')
    expect(circles).toHaveLength(4)
    
    // First two circles should be active (progress = 2)
    expect(circles[0]).toHaveClass('border-primary', 'bg-primary', 'text-primary-foreground')
    expect(circles[1]).toHaveClass('border-primary', 'bg-primary', 'text-primary-foreground')
    
    // Last two circles should not be active
    expect(circles[2]).not.toHaveClass('border-primary')
    expect(circles[2]).not.toHaveClass('bg-primary')
    expect(circles[3]).not.toHaveClass('border-primary')
    expect(circles[3]).not.toHaveClass('bg-primary')
  })

  it('should render correct number of progress lines', () => {
    const { container } = render(
      <ProgressBar sections={sections} progress={2} />
    )
    
    // Should have 3 progress lines (sections.length - 1)
    const progressLineContainers = container.querySelectorAll('.bg-content3')
    expect(progressLineContainers).toHaveLength(3)
    
    // Each should have a progress bar inside
    const progressBars = container.querySelectorAll('.bg-primary[style*="width"]')
    expect(progressBars).toHaveLength(3)
  })

  it('should handle empty sections array', () => {
    const { container } = render(
      <ProgressBar sections={[]} progress={0} />
    )
    
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should handle negative progress', () => {
    const { container } = render(
      <ProgressBar sections={sections} progress={-1} />
    )
    
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should handle progress greater than sections length', () => {
    const { container } = render(
      <ProgressBar sections={sections} progress={10} />
    )
    
    expect(container.firstChild).toMatchSnapshot()
  })

  describe('ProgressBarItem behavior', () => {
    it('should show correct numbers for each section', () => {
      const { getAllByText } = render(
        <ProgressBar sections={sections} progress={2} />
      )
      
      expect(getAllByText('1')).toHaveLength(1)
      expect(getAllByText('2')).toHaveLength(1)
      expect(getAllByText('3')).toHaveLength(1)
      expect(getAllByText('4')).toHaveLength(1)
    })

    it('should display section titles', () => {
      const { getByText } = render(
        <ProgressBar sections={sections} progress={2} />
      )
      
      sections.forEach(section => {
        expect(getByText(section)).toBeInTheDocument()
      })
    })
  })

  describe('ProgressLine behavior', () => {
    it('should calculate progress line width correctly', () => {
      const { container } = render(
        <ProgressBar sections={sections} progress={2} />
      )
      
      // Find progress bars with specific widths
      const progressBars = container.querySelectorAll('.bg-primary[style*="width"]')
      expect(progressBars).toHaveLength(3)
      
      // First line: Math.max(0, (2 - 0 - 1) * 100) = 100%
      expect(progressBars[0]).toHaveStyle('width: 100%')
      
      // Second line: Math.max(0, (2 - 1 - 1) * 100) = 0%
      expect(progressBars[1]).toHaveStyle('width: 0%')
      
      // Third line: Math.max(0, (2 - 2 - 1) * 100) = 0%
      expect(progressBars[2]).toHaveStyle('width: 0%')
    })

    it('should handle partial progress correctly', () => {
      const { container } = render(
        <ProgressBar sections={['A', 'B', 'C']} progress={1.5} />
      )
      
      const progressBars = container.querySelectorAll('.bg-primary[style*="width"]')
      expect(progressBars).toHaveLength(2)
      
      // First line: Math.max(0, (1.5 - 0 - 1) * 100) = 50%
      expect(progressBars[0]).toHaveStyle('width: 50%')
      
      // Second line: Math.max(0, (1.5 - 1 - 1) * 100) = 0%
      expect(progressBars[1]).toHaveStyle('width: 0%')
    })

    it('should handle progress over 100% on a line', () => {
      const { container } = render(
        <ProgressBar sections={['A', 'B']} progress={2.5} />
      )
      
      const progressBars = container.querySelectorAll('.bg-primary[style*="width"]')
      expect(progressBars).toHaveLength(1)
      
      // First line: Math.max(0, (2.5 - 0 - 1) * 100) = 150%
      const firstLineWidth = progressBars[0].getAttribute('style')
      expect(firstLineWidth).toContain('width: 150%')
    })
  })
})
