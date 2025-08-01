import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import General from '../../../src/routes/document-information/General'

// Test with General import to check if the issue is with our import
describe('General Test - With Import', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })
})
