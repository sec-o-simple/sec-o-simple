import { describe, expect, it } from 'vitest'
import { parseNote } from '../../../src/utils/csafExport/parseNote'
import type { TNote } from '../../../src/routes/shared/NotesList'

describe('parseNote', () => {
  it('should transform TNote to TParsedNote correctly', () => {
    const note: TNote = {
      id: 'test-note-1',
      category: 'description',
      content: 'This is a test note content',
      title: 'Test Note Title',
    }

    const result = parseNote(note)

    expect(result).toEqual({
      category: 'description',
      text: 'This is a test note content',
      title: 'Test Note Title',
    })
  })

  it('should handle different note categories', () => {
    const categories = ['description', 'details', 'faq', 'general', 'legal_disclaimer', 'other', 'summary'] as const

    categories.forEach((category) => {
      const note: TNote = {
        id: `test-${category}`,
        category,
        content: `Content for ${category}`,
        title: `Title for ${category}`,
      }

      const result = parseNote(note)

      expect(result.category).toBe(category)
      expect(result.text).toBe(`Content for ${category}`)
      expect(result.title).toBe(`Title for ${category}`)
    })
  })

  it('should handle empty strings', () => {
    const note: TNote = {
      id: 'empty-note',
      category: 'other',
      content: '',
      title: '',
    }

    const result = parseNote(note)

    expect(result).toEqual({
      category: 'other',
      text: '',
      title: '',
    })
  })

  it('should handle long content and titles', () => {
    const longContent = 'A'.repeat(1000)
    const longTitle = 'B'.repeat(500)

    const note: TNote = {
      id: 'long-note',
      category: 'details',
      content: longContent,
      title: longTitle,
    }

    const result = parseNote(note)

    expect(result.category).toBe('details')
    expect(result.text).toBe(longContent)
    expect(result.title).toBe(longTitle)
  })

  it('should not modify the original note object', () => {
    const note: TNote = {
      id: 'immutable-test',
      category: 'summary',
      content: 'Original content',
      title: 'Original title',
    }

    const originalNote = { ...note }
    parseNote(note)

    expect(note).toEqual(originalNote)
  })
})
