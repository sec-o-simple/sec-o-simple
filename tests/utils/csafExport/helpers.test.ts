import { describe, expect, it, vi } from 'vitest'

// Unmock the helpers to test the actual implementation
vi.unmock('../../../src/utils/csafExport/helpers')

import { getFilename } from '../../../src/utils/csafExport/helpers'

describe('getFilename', () => {
  it('should convert simple tracking ID to lowercase filename', () => {
    const result = getFilename('SIMPLE-ID')
    expect(result).toBe('simple-id')
  })

  it('should replace special characters with underscores', () => {
    const result = getFilename('ID-with@special#characters%')
    expect(result).toBe('id-with_special_characters_')
  })

  it('should preserve valid characters (lowercase, digits, +, -)', () => {
    const result = getFilename('valid-id+123')
    expect(result).toBe('valid-id+123')
  })

  it('should handle empty string', () => {
    const result = getFilename('')
    expect(result).toBe('')
  })

  it('should handle spaces', () => {
    const result = getFilename('ID with spaces')
    expect(result).toBe('id_with_spaces')
  })

  it('should handle multiple consecutive special characters', () => {
    const result = getFilename('ID!!!@@@###')
    expect(result).toBe('id_')
  })

  it('should preserve numbers and valid characters', () => {
    const result = getFilename('ID-2024-001')
    expect(result).toBe('id-2024-001')
  })

  it('should handle dots and slashes', () => {
    const result = getFilename('ID.with.dots/and/slashes')
    expect(result).toBe('id_with_dots_and_slashes')
  })

  it('should handle mixed case alphanumeric with valid characters', () => {
    const result = getFilename('MyApp-v1.2+build-123')
    expect(result).toBe('myapp-v1_2+build-123')
  })

  it('should handle unicode characters by replacing them', () => {
    const result = getFilename('ID-with-ünïcödë')
    expect(result).toBe('id-with-_n_c_d_')
  })
})
