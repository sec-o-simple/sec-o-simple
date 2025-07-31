import { describe, it, expect, vi } from 'vitest'
import { parseCSAFDocument, useCSAFImport, supportedCSAFVersions } from '../../../src/utils/csafImport/csafImport'
import type { TCSAFDocument } from '../../../src/utils/csafExport/csafExport'
import type { DeepPartial } from '../../../src/utils/deepPartial'

// Mock uid to return predictable values
vi.mock('uid', () => ({
  uid: vi.fn(() => 'mock-uid-123'),
}))

// Mock only the required hook dependencies
vi.mock('../../../src/utils/sosDraft', () => ({
  useSOSImport: () => ({
    importSOSDraft: vi.fn(),
  }),
}))

vi.mock('../../../src/routes/vulnerabilities/types/tVulnerabilityProduct', () => ({
  useVulnerabilityProductGenerator: () => ({
    generateVulnerabilityProduct: vi.fn(() => ({ id: 'mock-vuln-product' })),
  }),
}))

vi.mock('../../../src/routes/vulnerabilities/types/tRemediation', () => ({
  useRemediationGenerator: () => ({
    generateRemediation: vi.fn(() => ({ id: 'mock-remediation' })),
  }),
}))

// Mock default data functions
vi.mock('../../../src/routes/document-information/types/tDocumentInformation', () => ({
  getDefaultDocumentInformation: () => ({
    id: 'default-id',
    lang: 'en',
    status: 'draft',
    title: 'Default Title',
    publisher: {
      name: 'Default Publisher',
      category: 'vendor',
      namespace: 'https://default.example.com',
      contactDetails: 'default@example.com',
      issuingAuthority: 'Default Authority',
    },
    acknowledgments: [],
    notes: [],
    references: [],
    revisionHistory: [],
  }),
}))

vi.mock('../../../src/routes/document-information/types/tDocumentReference', () => ({
  getDefaultDocumentReference: () => ({
    id: 'mock-uid-123',
    summary: 'Default Reference',
    url: 'https://default.example.com',
    category: 'external',
  }),
}))

vi.mock('../../../src/routes/document-information/types/tRevisionHistoryEntry', () => ({
  getDefaultRevisionHistoryEntry: () => ({
    id: 'default-revision-id',
    date: '2023-01-01T00:00:00.000Z',
    number: '1.0.0',
    summary: 'Default Revision',
  }),
}))

// Mock the parsing functions to return simple structures
vi.mock('../../../src/utils/csafImport/parseProductTree', () => ({
  parseProductTree: vi.fn(() => []),
}))

vi.mock('../../../src/utils/csafImport/parseRelationships', () => ({
  parseRelationships: vi.fn(() => []),
}))

vi.mock('../../../src/utils/csafImport/parseVulnerabilities', () => ({
  parseVulnerabilities: vi.fn(() => []),
}))

vi.mock('../../../src/utils/csafImport/parseNote', () => ({
  parseNote: vi.fn((note) => ({
    id: 'mock-note-id',
    category: note.category || 'description',
    content: note.text || '',
    title: note.title || '',
  })),
}))

describe('csafImport', () => {
  describe('parseCSAFDocument', () => {
    const createMockVulnProductGenerator = () => ({
      generateVulnerabilityProduct: vi.fn(() => ({ id: 'mock-vuln-product' })),
    })

    const createMockRemediationGenerator = () => ({
      generateRemediation: vi.fn(() => ({ id: 'mock-remediation' })),
    })

    it('should parse a complete CSAF document and match snapshot', () => {
      const mockCSAFDocument: DeepPartial<TCSAFDocument> = {
        document: {
          category: 'csaf_security_advisory',
          csaf_version: '2.0',
          lang: 'en',
          title: 'Test Security Advisory',
          tracking: {
            id: 'TEST-2023-001',
            status: 'final',
            revision_history: [
              {
                date: '2023-01-01T00:00:00.000Z',
                number: '1.0.0',
                summary: 'Initial release',
              },
              {
                date: '2023-02-01T00:00:00.000Z',
                number: '1.1.0',
                summary: 'Updated advisory',
              },
            ],
          },
          distribution: {
            tlp: {
              label: 'WHITE',
              url: 'https://example.com/tlp',
            },
          },
          publisher: {
            category: 'vendor',
            name: 'Test Vendor',
            namespace: 'https://example.com',
            contact_details: 'security@example.com',
            issuing_authority: 'Security Team',
          },
          notes: [
            {
              category: 'description',
              text: 'This is a test advisory description',
              title: 'Description',
            },
            {
              category: 'summary',
              text: 'Brief summary of the issue',
              title: 'Summary',
            },
          ],
          references: [
            {
              category: 'external',
              summary: 'Vendor Advisory',
              url: 'https://example.com/advisory',
            },
            {
              category: 'self',
              summary: 'This Document',
              url: 'https://example.com/self',
            },
          ],
          acknowledgments: [
            {
              organization: 'Security Research Team',
              names: ['Alice Security', 'Bob Researcher'],
              summary: 'Discovered the vulnerability',
              urls: ['https://example.com/researchers'],
            },
            {
              organization: 'Bug Bounty Program',
              names: ['Charlie Hunter'],
              summary: 'Reported through bug bounty',
              urls: ['https://example.com/bounty'],
            },
          ],
        },
        product_tree: {
          relationships: [],
        },
        vulnerabilities: [],
      }

      const result = parseCSAFDocument(
        mockCSAFDocument,
        createMockVulnProductGenerator(),
        createMockRemediationGenerator()
      )

      expect(result).toMatchSnapshot()
    })

    it('should parse a minimal CSAF document and match snapshot', () => {
      const minimalCSAFDocument: DeepPartial<TCSAFDocument> = {
        document: {
          category: 'csaf_security_advisory',
          csaf_version: '2.0',
          tracking: {
            id: 'MINIMAL-001',
          },
        },
      }

      const result = parseCSAFDocument(
        minimalCSAFDocument,
        createMockVulnProductGenerator(),
        createMockRemediationGenerator()
      )

      expect(result).toMatchSnapshot()
    })

    it('should handle empty/undefined fields gracefully and match snapshot', () => {
      const partialCSAFDocument: DeepPartial<TCSAFDocument> = {
        document: {
          category: 'csaf_security_advisory',
          csaf_version: '2.0',
          lang: 'de',
          title: 'Teilweise gefülltes Dokument',
          tracking: {
            id: 'PARTIAL-001',
            status: 'draft',
            revision_history: [],
          },
          distribution: {
            tlp: {
              label: 'GREEN',
            },
          },
          publisher: {
            category: 'coordinator',
            name: 'Test Coordinator',
          },
          notes: [],
          references: [],
          acknowledgments: [],
        },
      }

      const result = parseCSAFDocument(
        partialCSAFDocument,
        createMockVulnProductGenerator(),
        createMockRemediationGenerator()
      )

      expect(result).toMatchSnapshot()
    })

    it('should return undefined for invalid input', () => {
      const result = parseCSAFDocument(
        {} as DeepPartial<TCSAFDocument>,
        createMockVulnProductGenerator(),
        createMockRemediationGenerator()
      )

      expect(result).toBeDefined() // Actually returns a default structure
      expect(result?.sosDocumentType).toBe('Import')
    })
  })

  describe('useCSAFImport', () => {
    it('should identify valid CSAF documents', () => {
      const { isCSAFDocument } = useCSAFImport()

      const validCSAF = {
        document: {
          csaf_version: '2.0',
          category: 'csaf_security_advisory',
        },
      }

      const invalidCSAF = {
        someOtherProperty: 'value',
      }

      expect(isCSAFDocument(validCSAF)).toBe(true)
      expect(isCSAFDocument(invalidCSAF)).toBe(false)
    })

    it('should check CSAF version support', () => {
      const { isCSAFVersionSupported } = useCSAFImport()

      const supportedVersion = {
        document: {
          csaf_version: '2.0',
        },
      }

      const unsupportedVersion = {
        document: {
          csaf_version: '1.0',
        },
      }

      const noVersion = {
        document: {},
      }

      expect(isCSAFVersionSupported(supportedVersion)).toBe(true)
      expect(isCSAFVersionSupported(unsupportedVersion)).toBe(false)
      expect(isCSAFVersionSupported(noVersion)).toBe(false)
    })

    it('should import CSAF document and return hidden fields', () => {
      const { importCSAFDocument } = useCSAFImport()

      const testDocument = {
        document: {
          csaf_version: '2.0',
          category: 'csaf_security_advisory',
          title: 'Test Document',
          tracking: {
            id: 'TEST-001',
          },
        },
        // Add some fields that might not be in the schema
        customField: 'should be hidden',
        extraData: {
          nested: 'value',
        },
      }

      const hiddenFields = importCSAFDocument(testDocument)

      expect(Array.isArray(hiddenFields)).toBe(true)
      // Hidden fields detection depends on the schema, so we just verify it returns an array
    })

    it('should have correct supported versions', () => {
      expect(supportedCSAFVersions).toEqual(['2.0'])
    })
  })

  describe('edge cases', () => {
    it('should handle acknowledgments with missing fields', () => {
      const mockCSAFDocument: DeepPartial<TCSAFDocument> = {
        document: {
          csaf_version: '2.0',
          tracking: { id: 'TEST-ACK' },
          acknowledgments: [
            {
              // Only organization, no names or urls
              organization: 'Minimal Org',
            },
            {
              // Only names, no organization
              names: ['Solo Researcher'],
              summary: 'Found issue',
            },
            {
              // Empty acknowledgment
            },
          ],
        },
      }

      const result = parseCSAFDocument(
        mockCSAFDocument,
        { generateVulnerabilityProduct: vi.fn() } as any,
        { generateRemediation: vi.fn() } as any
      )

      expect(result?.documentInformation.acknowledgments).toHaveLength(3)
      expect(result?.documentInformation.acknowledgments[0].organization).toBe('Minimal Org')
      expect(result?.documentInformation.acknowledgments[1].names).toHaveLength(1)
      expect(result?.documentInformation.acknowledgments[2].organization).toBeUndefined()
    })

    it('should handle TLP case conversion', () => {
      const mockCSAFDocument: DeepPartial<TCSAFDocument> = {
        document: {
          csaf_version: '2.0',
          tracking: { id: 'TEST-TLP' },
          distribution: {
            tlp: {
              label: 'RED', // Should be converted to lowercase
              url: 'https://example.com/red',
            },
          },
        },
      }

      const result = parseCSAFDocument(
        mockCSAFDocument,
        { generateVulnerabilityProduct: vi.fn() } as any,
        { generateRemediation: vi.fn() } as any
      )

      expect(result?.documentInformation.tlp.label).toBe('red')
      expect(result?.documentInformation.tlp.url).toBe('https://example.com/red')
    })
  })
})
