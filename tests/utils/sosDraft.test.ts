import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getFilename } from '../../src/utils/csafExport/helpers'
import { download } from '../../src/utils/download'
import { useSOSExport, useSOSImport } from '../../src/utils/sosDraft'

// Mock dependencies
vi.mock('../../src/utils/download', () => ({
  download: vi.fn(),
}))

vi.mock('../../src/utils/csafExport/helpers', () => ({
  getFilename: vi.fn((id) => `document-${id}`),
}))

const mockDownload = vi.mocked(download)
const mockGetFilename = vi.mocked(getFilename)

const mockDocumentStore = {
  sosDocumentType: 'Software',
  documentInformation: {
    id: 'test-doc-123',
    title: 'Test Document',
  },
  products: [],
  families: [],
  relationships: [],
  vulnerabilities: [],
  setSOSDocumentType: vi.fn(),
  updateDocumentInformation: vi.fn(),
  updateProducts: vi.fn(),
  updateFamilies: vi.fn(),
  updateRelationships: vi.fn(),
  updateVulnerabilities: vi.fn(),
}

vi.mock('../../src/utils/useDocumentStore', () => ({
  default: vi.fn((selector) => {
    if (typeof selector === 'function') {
      return selector(mockDocumentStore)
    }
    return mockDocumentStore
  }),
  sosDocumentTypes: [
    'Import',
    'Software',
    'HardwareSoftware',
    'HardwareFirmware',
    'VexSoftware',
    'VexHardwareSoftware',
    'VexHardwareFirmware',
    'VexSbom',
  ],
}))

describe('sosDraft utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSOSExport', () => {
    it('should export SOS document with correct filename and content', () => {
      const { result } = renderHook(() => useSOSExport())

      act(() => {
        result.current.exportSOSDocument()
      })

      // Verify that getFilename was called with the correct document ID
      expect(mockGetFilename).toHaveBeenCalledWith('test-doc-123')

      // Verify that download was called with the correct filename and content
      expect(mockDownload).toHaveBeenCalledWith(
        'document-test-doc-123.sos.json',
        JSON.stringify(mockDocumentStore, null, 2),
      )
    })

    it('should format JSON with proper indentation', () => {
      const { result } = renderHook(() => useSOSExport())

      act(() => {
        result.current.exportSOSDocument()
      })

      // Verify that the JSON is formatted with 2-space indentation
      const [, jsonContent] = mockDownload.mock.calls[0]
      expect(jsonContent).toContain('  ') // Should have proper indentation
      expect(jsonContent).toBe(JSON.stringify(mockDocumentStore, null, 2))
    })
  })

  describe('useSOSImport', () => {
    let importHook: ReturnType<typeof useSOSImport>

    beforeEach(() => {
      const { result } = renderHook(() => useSOSImport())
      importHook = result.current
    })

    describe('isSOSDraft', () => {
      it('should return true for valid SOS draft', () => {
        const validDraft = {
          sosDocumentType: 'Software',
          documentInformation: { id: 'test' },
          products: [],
          families: [],
          relationships: {},
          vulnerabilities: {},
        }

        expect(importHook.isSOSDraft(validDraft)).toBe(true)
      })

      it('should return false for invalid sosDocumentType', () => {
        const invalidDraft = {
          sosDocumentType: 'Invalid Type',
          documentInformation: { id: 'test' },
          products: [],
          families: [],
          relationships: {},
          vulnerabilities: {},
        }

        expect(importHook.isSOSDraft(invalidDraft)).toBe(false)
      })

      it('should return false for missing sosDocumentType', () => {
        const invalidDraft = {
          documentInformation: { id: 'test' },
          products: [],
          families: [],
          relationships: {},
          vulnerabilities: {},
        }

        expect(importHook.isSOSDraft(invalidDraft)).toBe(false)
      })

      it('should return false for missing documentInformation', () => {
        const invalidDraft = {
          sosDocumentType: 'Software',
          products: [],
          families: [],
          relationships: {},
          vulnerabilities: {},
        }

        expect(importHook.isSOSDraft(invalidDraft)).toBe(false)
      })

      it('should return false for invalid products type', () => {
        const invalidDraft = {
          sosDocumentType: 'Software',
          documentInformation: { id: 'test' },
          products: 'not an array',
          families: [],
          relationships: {},
          vulnerabilities: {},
        }

        expect(importHook.isSOSDraft(invalidDraft)).toBe(false)
      })

      it('should return false for missing relationships', () => {
        const invalidDraft = {
          sosDocumentType: 'Software',
          documentInformation: { id: 'test' },
          products: [],
          families: [],
          vulnerabilities: {},
        }

        expect(importHook.isSOSDraft(invalidDraft)).toBe(false)
      })

      it('should return false for missing vulnerabilities', () => {
        const invalidDraft = {
          sosDocumentType: 'Software',
          documentInformation: { id: 'test' },
          products: [],
          families: [],
          relationships: {},
        }

        expect(importHook.isSOSDraft(invalidDraft)).toBe(false)
      })
    })

    describe('importSOSDocument', () => {
      it('should import valid SOS document and return true', () => {
        const validDraft = {
          sosDocumentType: 'VexSoftware',
          documentInformation: { id: 'imported-doc', title: 'Imported' },
          products: [{ id: 'product1' }],
          families: [{ id: 'family1' }],
          relationships: [{ id: 'rel1' }],
          vulnerabilities: [{ id: 'vuln1' }],
        }

        const result = importHook.importSOSDocument(validDraft)

        expect(result).toBe(true)
        expect(mockDocumentStore.setSOSDocumentType).toHaveBeenCalledWith(
          'VexSoftware',
        )
        expect(
          mockDocumentStore.updateDocumentInformation,
        ).toHaveBeenCalledWith(validDraft.documentInformation)
        expect(mockDocumentStore.updateProducts).toHaveBeenCalledWith(
          validDraft.products,
        )
        expect(mockDocumentStore.updateFamilies).toHaveBeenCalledWith(
          validDraft.families,
        )
        expect(mockDocumentStore.updateRelationships).toHaveBeenCalledWith(
          validDraft.relationships,
        )
        expect(mockDocumentStore.updateVulnerabilities).toHaveBeenCalledWith(
          validDraft.vulnerabilities,
        )
      })

      it('should not import invalid SOS document and return false', () => {
        const invalidDraft = {
          sosDocumentType: 'Invalid Type',
          documentInformation: { id: 'test' },
          products: [],
          families: [],
          relationships: {},
          vulnerabilities: {},
        }

        const result = importHook.importSOSDocument(invalidDraft)

        expect(result).toBe(false)
        expect(mockDocumentStore.setSOSDocumentType).not.toHaveBeenCalled()
        expect(
          mockDocumentStore.updateDocumentInformation,
        ).not.toHaveBeenCalled()
        expect(mockDocumentStore.updateProducts).not.toHaveBeenCalled()
        expect(mockDocumentStore.updateFamilies).not.toHaveBeenCalled()
        expect(mockDocumentStore.updateRelationships).not.toHaveBeenCalled()
        expect(mockDocumentStore.updateVulnerabilities).not.toHaveBeenCalled()
      })
    })

    describe('importSOSDraft', () => {
      it('should directly import SOS draft data', () => {
        const draft = {
          sosDocumentType: 'HardwareSoftware' as const,
          documentInformation: { id: 'direct-import', title: 'Direct' },
          products: [{ id: 'prod1' }, { id: 'prod2' }],
          families: [{ id: 'fam1' }],
          relationships: [{ id: 'rel1' }],
          vulnerabilities: [{ id: 'vuln1' }, { id: 'vuln2' }],
        }

        importHook.importSOSDraft(draft)

        expect(mockDocumentStore.setSOSDocumentType).toHaveBeenCalledWith(
          'HardwareSoftware',
        )
        expect(
          mockDocumentStore.updateDocumentInformation,
        ).toHaveBeenCalledWith(draft.documentInformation)
        expect(mockDocumentStore.updateProducts).toHaveBeenCalledWith(
          draft.products,
        )
        expect(mockDocumentStore.updateFamilies).toHaveBeenCalledWith(
          draft.families,
        )
        expect(mockDocumentStore.updateRelationships).toHaveBeenCalledWith(
          draft.relationships,
        )
        expect(mockDocumentStore.updateVulnerabilities).toHaveBeenCalledWith(
          draft.vulnerabilities,
        )
      })
    })

    describe('edge cases', () => {
      it('should handle empty arrays and objects', () => {
        const validDraft = {
          sosDocumentType: 'Import',
          documentInformation: {},
          products: [],
          families: [],
          relationships: {},
          vulnerabilities: {},
        }

        expect(importHook.isSOSDraft(validDraft)).toBe(true)
        expect(importHook.importSOSDocument(validDraft)).toBe(true)
      })

      it('should handle null and undefined properties correctly', () => {
        // In JavaScript, typeof null === 'object', so null is actually valid for the documentInformation check
        const draftWithNull = {
          sosDocumentType: 'Import',
          documentInformation: null,
          products: [],
          families: [],
          relationships: {},
          vulnerabilities: {},
        }

        // The implementation accepts null as it passes typeof === 'object' check
        expect(importHook.isSOSDraft(draftWithNull)).toBe(true)

        // Test with completely missing property (undefined)
        const draftMissingProperty = {
          sosDocumentType: 'Import',
          // documentInformation is missing
          products: [],
          families: [],
          relationships: {},
          vulnerabilities: {},
        }

        expect(importHook.isSOSDraft(draftMissingProperty)).toBe(false)
      })

      it('should validate all sosDocumentTypes', () => {
        const validTypes = [
          'Import',
          'Software',
          'HardwareSoftware',
          'HardwareFirmware',
          'VexSoftware',
          'VexHardwareSoftware',
          'VexHardwareFirmware',
          'VexSbom',
        ]

        validTypes.forEach((type) => {
          const draft = {
            sosDocumentType: type,
            documentInformation: {},
            products: [],
            families: [],
            relationships: {},
            vulnerabilities: {},
          }

          expect(importHook.isSOSDraft(draft)).toBe(true)
        })
      })
    })
  })
})
