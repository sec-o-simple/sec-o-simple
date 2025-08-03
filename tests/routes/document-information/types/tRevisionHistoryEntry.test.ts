import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getDefaultRevisionHistoryEntry,
  TRevisionHistoryEntry,
} from '../../../../src/routes/document-information/types/tRevisionHistoryEntry'

describe('tRevisionHistoryEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDefaultRevisionHistoryEntry', () => {
    it('should return a revision history entry object with all required properties', () => {
      const result = getDefaultRevisionHistoryEntry()

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('date')
      expect(result).toHaveProperty('number')
      expect(result).toHaveProperty('summary')
    })

    it('should return proper types for all properties', () => {
      const result = getDefaultRevisionHistoryEntry()

      expect(typeof result.id).toBe('string')
      expect(typeof result.date).toBe('string')
      expect(typeof result.number).toBe('string')
      expect(typeof result.summary).toBe('string')
    })

    it('should generate a unique ID for each entry', () => {
      const entry1 = getDefaultRevisionHistoryEntry()
      const entry2 = getDefaultRevisionHistoryEntry()

      expect(entry1.id).toBeTruthy()
      expect(entry2.id).toBeTruthy()
      expect(entry1.id).not.toBe(entry2.id)
    })

    it('should set date to current ISO string', () => {
      const beforeCall = new Date().toISOString()
      const result = getDefaultRevisionHistoryEntry()
      const afterCall = new Date().toISOString()

      // Verify it's a valid ISO date string
      expect(() => new Date(result.date)).not.toThrow()
      const resultDate = new Date(result.date)
      expect(resultDate.toISOString()).toBe(result.date)

      // Verify the date is approximately the current time (within a few seconds)
      const resultTime = resultDate.getTime()
      const beforeTime = new Date(beforeCall).getTime()
      const afterTime = new Date(afterCall).getTime()
      
      expect(resultTime).toBeGreaterThanOrEqual(beforeTime - 1000) // Allow 1 second before due to timing
      expect(resultTime).toBeLessThanOrEqual(afterTime + 1000) // Allow 1 second after due to timing
    })

    it('should initialize number and summary as empty strings', () => {
      const result = getDefaultRevisionHistoryEntry()

      expect(result.number).toBe('')
      expect(result.summary).toBe('')
    })

    it('should create consistent objects across multiple calls', () => {
      const entry1 = getDefaultRevisionHistoryEntry()
      const entry2 = getDefaultRevisionHistoryEntry()

      // Should have same structure but different IDs and potentially different dates
      expect(typeof entry1.id).toBe(typeof entry2.id)
      expect(typeof entry1.date).toBe(typeof entry2.date)
      expect(typeof entry1.number).toBe(typeof entry2.number)
      expect(typeof entry1.summary).toBe(typeof entry2.summary)

      expect(entry1.number).toBe(entry2.number)
      expect(entry1.summary).toBe(entry2.summary)
    })

    it('should not throw errors when called', () => {
      expect(() => getDefaultRevisionHistoryEntry()).not.toThrow()
    })

    it('should return a valid TRevisionHistoryEntry object', () => {
      const result = getDefaultRevisionHistoryEntry()

      // Test that the object conforms to the expected type structure
      const expectedProperties = ['id', 'date', 'number', 'summary']
      expectedProperties.forEach(prop => {
        expect(result).toHaveProperty(prop)
      })

      // Ensure no unexpected properties
      const actualProperties = Object.keys(result)
      expect(actualProperties.sort()).toEqual(expectedProperties.sort())
    })

    it('should generate entries that can be used in revision history arrays', () => {
      const entry1 = getDefaultRevisionHistoryEntry()
      const entry2 = getDefaultRevisionHistoryEntry()
      const entry3 = getDefaultRevisionHistoryEntry()

      const revisionHistory: TRevisionHistoryEntry[] = [entry1, entry2, entry3]

      expect(revisionHistory).toHaveLength(3)
      expect(revisionHistory.every(entry => 
        typeof entry.id === 'string' &&
        typeof entry.date === 'string' &&
        typeof entry.number === 'string' &&
        typeof entry.summary === 'string'
      )).toBe(true)

      // Verify all IDs are unique
      const ids = revisionHistory.map(entry => entry.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(revisionHistory.length)
    })

    it('should generate valid dates that can be parsed', () => {
      const result = getDefaultRevisionHistoryEntry()
      
      const parsedDate = new Date(result.date)
      expect(parsedDate).toBeInstanceOf(Date)
      expect(parsedDate.toString()).not.toBe('Invalid Date')
      
      // Should be a valid ISO string format
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('TRevisionHistoryEntry type', () => {
    it('should have the correct type structure', () => {
      const entry = getDefaultRevisionHistoryEntry()

      // Test that TypeScript types are working correctly
      const typedEntry: TRevisionHistoryEntry = entry
      expect(typedEntry).toBe(entry)

      // Test that all properties exist and are strings
      expect(typeof typedEntry.id).toBe('string')
      expect(typeof typedEntry.date).toBe('string')
      expect(typeof typedEntry.number).toBe('string')
      expect(typeof typedEntry.summary).toBe('string')
    })
  })
})
