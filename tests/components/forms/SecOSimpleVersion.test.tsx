import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import SecOSimpleVersion from '../../../src/components/forms/SecOSimpleVersion'

// Mock the package.json import
vi.mock('@/../package.json', () => ({
  default: {
    version: '1.0.0-test'
  }
}))

describe('SecOSimpleVersion', () => {
  it('should render without crashing', () => {
    render(<SecOSimpleVersion />)
    
    expect(screen.getByText(/Version/)).toBeInTheDocument()
  })

  it('should display the version from package.json', () => {
    render(<SecOSimpleVersion />)
    
    expect(screen.getByText('1.0.0-test')).toBeInTheDocument()
  })

  it('should have correct structure and styling', () => {
    render(<SecOSimpleVersion />)
    
    const paragraph = screen.getByText(/Version/).closest('p')
    expect(paragraph).toHaveClass('text-center', 'text-sm', 'text-neutral-400')
  })

  it('should have version text in semibold span', () => {
    render(<SecOSimpleVersion />)
    
    const versionSpan = screen.getByText('1.0.0-test')
    expect(versionSpan.tagName).toBe('SPAN')
    expect(versionSpan).toHaveClass('font-semibold')
  })

  it('should render complete version text', () => {
    render(<SecOSimpleVersion />)
    
    const paragraph = screen.getByText(/Version/).closest('p')
    expect(paragraph?.textContent).toMatch(/Version\s+1\.0\.0-test/)
  })
})
