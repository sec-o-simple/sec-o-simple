import { describe, expect, it } from 'vitest'
import { parseNote } from '../../../src/utils/csafImport/parseNote'
import type { TParsedNote } from '../../../src/utils/csafExport/parseNote'

describe('csafImport parseNote', () => {
  it('should transform TParsedNote to TNote correctly', () => {
    const parsedNote: TParsedNote = {
      category: 'description',
      text: 'This is a test note content',
      title: 'Test Note Title',
    }

    const result = parseNote(parsedNote)

    expect(result).toEqual({
      id: expect.any(String),
      category: 'description',
      title: 'Test Note Title',
      content: 'This is a test note content',
    })
    expect(result.id).toHaveLength(11) // uid() generates 11 character strings by default
  })

  it('should handle different note categories', () => {
    const categories = ['description', 'details', 'faq', 'general', 'legal_disclaimer', 'other', 'summary'] as const

    categories.forEach((category) => {
      const parsedNote: TParsedNote = {
        category,
        text: `Content for ${category}`,
        title: `Title for ${category}`,
      }

      const result = parseNote(parsedNote)

      expect(result.category).toBe(category)
      expect(result.content).toBe(`Content for ${category}`)
      expect(result.title).toBe(`Title for ${category}`)
      expect(result.id).toEqual(expect.any(String))
    })
  })

  it('should handle empty strings', () => {
    const parsedNote: TParsedNote = {
      category: 'other',
      text: '',
      title: '',
    }

    const result = parseNote(parsedNote)

    expect(result).toEqual({
      id: expect.any(String),
      category: 'other',
      title: '',
      content: '',
    })
  })

  it('should handle long content and titles', () => {
    const longContent = 'A'.repeat(1000)
    const longTitle = 'B'.repeat(500)

    const parsedNote: TParsedNote = {
      category: 'details',
      text: longContent,
      title: longTitle,
    }

    const result = parseNote(parsedNote)

    expect(result.category).toBe('details')
    expect(result.content).toBe(longContent)
    expect(result.title).toBe(longTitle)
    expect(result.id).toEqual(expect.any(String))
  })

  it('should generate unique IDs for different calls', () => {
    const parsedNote: TParsedNote = {
      category: 'summary',
      text: 'Test content',
      title: 'Test title',
    }

    const result1 = parseNote(parsedNote)
    const result2 = parseNote(parsedNote)

    expect(result1.id).not.toBe(result2.id)
    expect(result1.id).toEqual(expect.any(String))
    expect(result2.id).toEqual(expect.any(String))
  })

  it('should not modify the original parsedNote object', () => {
    const parsedNote: TParsedNote = {
      category: 'general',
      text: 'Original content',
      title: 'Original title',
    }

    const originalParsedNote = { ...parsedNote }
    parseNote(parsedNote)

    expect(parsedNote).toEqual(originalParsedNote)
  })

  it('should correctly map text field to content field', () => {
    const parsedNote: TParsedNote = {
      category: 'faq',
      text: 'This should become content',
      title: 'FAQ Title',
    }

    const result = parseNote(parsedNote)

    expect(result.content).toBe('This should become content')
    expect(result.title).toBe('FAQ Title')
    expect(result.category).toBe('faq')
  })
})