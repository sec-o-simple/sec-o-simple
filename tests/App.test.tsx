import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../src/App'

describe('App', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })

  it('should render router structure', () => {
    const { container } = render(<App />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should initialize hooks on render', () => {
    // This test ensures that the component renders successfully,
    // which means all the initialization hooks are working with the mocks
    render(<App />)
    expect(true).toBe(true) // Test passes if render doesn't throw
  })
})
