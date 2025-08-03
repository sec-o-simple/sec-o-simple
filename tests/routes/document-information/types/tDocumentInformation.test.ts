import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  getDefaultDocumentInformation, 
  getDocumentInformationTemplateKeys 
} from '@/routes/document-information/types/tDocumentInformation'

// Mock i18next for translation
vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'document.general.revisionHistory.initialRevision': 'Initial revision'
      }
      return translations[key] || key
    })
  }
}))

// Override the global mock from setup.ts specifically for this file
vi.unmock('@/routes/document-information/types/tDocumentInformation')

describe('tDocumentInformation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDefaultDocumentInformation', () => {
    it('should return a document information object with required properties', () => {
      const result = getDefaultDocumentInformation()

      // Check that all required properties exist
      expect(result).toHaveProperty('title')
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('lang')
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('publisher')
      expect(result).toHaveProperty('revisionHistory')
      expect(result).toHaveProperty('acknowledgments')
      expect(result).toHaveProperty('notes')
      expect(result).toHaveProperty('references')
      // Note: tlp is optional, so we don't require it to be present
    })

    it('should initialize empty arrays for acknowledgments, notes, and references', () => {
      const result = getDefaultDocumentInformation()

      expect(Array.isArray(result.acknowledgments)).toBe(true)
      expect(result.acknowledgments).toHaveLength(0)
      
      expect(Array.isArray(result.notes)).toBe(true)
      expect(result.notes).toHaveLength(0)
      
      expect(Array.isArray(result.references)).toBe(true)
      expect(result.references).toHaveLength(0)
    })

    it('should create revision history with initial entry', () => {
      const result = getDefaultDocumentInformation()

      expect(Array.isArray(result.revisionHistory)).toBe(true)
      expect(result.revisionHistory).toHaveLength(1)

      const initialRevision = result.revisionHistory[0]
      expect(initialRevision).toHaveProperty('id')
      expect(initialRevision).toHaveProperty('date')
      expect(initialRevision).toHaveProperty('number')
      expect(initialRevision).toHaveProperty('summary')

      expect(initialRevision.number).toBe('1')
      expect(typeof initialRevision.id).toBe('string')
      expect(initialRevision.id).toBeTruthy() // Should not be empty
      expect(typeof initialRevision.date).toBe('string')
      expect(initialRevision.date).toBeTruthy() // Should not be empty
      expect(typeof initialRevision.summary).toBe('string')
      // Note: summary could be empty string if translation fails, so we don't require it to be truthy
    })

    it('should have a publisher object with required properties', () => {
      const result = getDefaultDocumentInformation()

      expect(result.publisher).toHaveProperty('name')
      expect(result.publisher).toHaveProperty('category')
      expect(result.publisher).toHaveProperty('namespace')
      expect(result.publisher).toHaveProperty('contactDetails')
    })

    it('should have TLP object with label and url when present', () => {
      const result = getDefaultDocumentInformation()

      // TLP is optional, so check if it exists before testing its properties
      if (result.tlp) {
        expect(result.tlp).toHaveProperty('label')
        expect(result.tlp).toHaveProperty('url')
      } else {
        // If TLP is not present, that's also valid according to the type definition
        expect(result.tlp).toBeUndefined()
      }
    })

    it('should create consistent objects across multiple calls', () => {
      const doc1 = getDefaultDocumentInformation()
      const doc2 = getDefaultDocumentInformation()

      // Should have the same structure
      expect(typeof doc1.title).toBe(typeof doc2.title)
      expect(typeof doc1.id).toBe(typeof doc2.id)
      expect(typeof doc1.lang).toBe(typeof doc2.lang)
      expect(doc1.acknowledgments.length).toBe(doc2.acknowledgments.length)
      expect(doc1.notes.length).toBe(doc2.notes.length)
      expect(doc1.references.length).toBe(doc2.references.length)
      expect(doc1.revisionHistory.length).toBe(doc2.revisionHistory.length)
    })

    it('should have a valid date in initial revision', () => {
      const result = getDefaultDocumentInformation()
      const initialRevision = result.revisionHistory[0]
      
      // Check that the date is a valid ISO string
      expect(() => new Date(initialRevision.date)).not.toThrow()
      const parsedDate = new Date(initialRevision.date)
      expect(parsedDate.toISOString()).toBe(initialRevision.date)
    })
  })

  describe('getDocumentInformationTemplateKeys', () => {
    it('should return template keys object with required properties', () => {
      const result = getDocumentInformationTemplateKeys()

      expect(result).toHaveProperty('notes')
      expect(result).toHaveProperty('publisher')
      expect(result).toHaveProperty('references')
      expect(result).toHaveProperty('revisionHistory')
      expect(result).toHaveProperty('acknowledgments')
    })

    it('should contain correct template key values', () => {
      const result = getDocumentInformationTemplateKeys()

      expect(result.notes).toBe('document-information.notes')
      expect(result.references).toBe('document-information.references')
      expect(result.revisionHistory).toBe('document-information.revision-history')
      expect(result.acknowledgments).toBe('document-information.acknowledgments')
    })

    it('should include general document information template keys', () => {
      const result = getDocumentInformationTemplateKeys()

      // Should include properties from general document information
      expect(result).toHaveProperty('title')
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('lang')
      expect(result).toHaveProperty('status')
      // tlp might be optional in template keys too
      if (result.tlp) {
        expect(result.tlp).toBeTypeOf('object')
      }
    })

    it('should include publisher template keys as nested object', () => {
      const result = getDocumentInformationTemplateKeys()

      expect(result.publisher).toBeTypeOf('object')
      expect(result.publisher).toHaveProperty('name')
      expect(result.publisher).toHaveProperty('category')
      expect(result.publisher).toHaveProperty('namespace')
      expect(result.publisher).toHaveProperty('contactDetails')
    })

    it('should return consistent results across multiple calls', () => {
      const keys1 = getDocumentInformationTemplateKeys()
      const keys2 = getDocumentInformationTemplateKeys()

      expect(keys1).toEqual(keys2)
    })
  })

  describe('Type Integration', () => {
    it('should work with TypeScript type system', () => {
      const defaultDoc = getDefaultDocumentInformation()
      const templateKeys = getDocumentInformationTemplateKeys()

      // Test that the functions return objects that match their expected types
      expect(typeof defaultDoc).toBe('object')
      expect(typeof templateKeys).toBe('object')

      // Test that required properties exist and have correct types
      expect(typeof defaultDoc.title).toBe('string')
      expect(typeof defaultDoc.id).toBe('string')
      expect(typeof defaultDoc.lang).toBe('string')
      expect(Array.isArray(defaultDoc.acknowledgments)).toBe(true)
      expect(Array.isArray(defaultDoc.notes)).toBe(true)
      expect(Array.isArray(defaultDoc.references)).toBe(true)
      expect(Array.isArray(defaultDoc.revisionHistory)).toBe(true)
    })
  })

  describe('Function Behavior', () => {
    it('should not throw errors when called', () => {
      expect(() => getDefaultDocumentInformation()).not.toThrow()
      expect(() => getDocumentInformationTemplateKeys()).not.toThrow()
    })

    it('should return valid objects every time', () => {
      for (let i = 0; i < 5; i++) {
        const doc = getDefaultDocumentInformation()
        const keys = getDocumentInformationTemplateKeys()

        expect(doc).toBeTruthy()
        expect(keys).toBeTruthy()
        expect(typeof doc).toBe('object')
        expect(typeof keys).toBe('object')
      }
    })
  })
})
