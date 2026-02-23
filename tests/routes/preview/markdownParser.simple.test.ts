import { describe, it, expect } from 'vitest'
import { parseMarkdown } from '../../../src/routes/preview/markdownParser'

describe('parseMarkdown', () => {
  it('should handle basic document input', () => {
    const document = {
      document: {
        notes: [{ text: 'Simple text' }],
      },
    }

    const result = parseMarkdown(document)
    expect(result).toBeDefined()
    expect(result.document).toBeDefined()
    expect(result.document.notes).toBeDefined()
    expect(Array.isArray(result.document.notes)).toBe(true)
  })

  it('should handle empty input', () => {
    const result = parseMarkdown({})
    expect(result).toEqual({})
  })

  it('should handle null input', () => {
    const result = parseMarkdown(null as any)
    expect(result).toBeNull()
  })

  it('should handle undefined input', () => {
    const result = parseMarkdown(undefined as any)
    expect(result).toBeUndefined()
  })

  it('should process vulnerability data', () => {
    const document = {
      vulnerabilities: [
        {
          notes: [{ text: 'Vulnerability note' }],
        },
      ],
    }

    const result = parseMarkdown(document)
    expect(result).toBeDefined()
    expect(result.vulnerabilities).toBeDefined()
    expect(Array.isArray(result.vulnerabilities)).toBe(true)
  })

  it('should handle documents without markdown fields', () => {
    const document = {
      document: {
        title: 'Simple Title',
        publisher: { name: 'Publisher Name' },
      },
    }

    const result = parseMarkdown(document)
    expect(result).toEqual(document)
  })

  it('should process nested structures', () => {
    const document = {
      document: {
        acknowledgments: [{ summary: 'Thanks to security team' }],
        distribution: {
          text: 'Distribution information',
        },
      },
    }

    const result = parseMarkdown(document)
    expect(result).toBeDefined()
    expect(result.document).toBeDefined()
    expect(result.document.acknowledgments).toBeDefined()
    expect(result.document.distribution).toBeDefined()
  })

  it('should preserve non-markdown data', () => {
    const document = {
      document: {
        notes: [{ text: 'Text content', id: 123, active: true }],
      },
    }

    const result = parseMarkdown(document)
    expect(result.document.notes[0].id).toBe(123)
    expect(result.document.notes[0].active).toBe(true)
  })
})
