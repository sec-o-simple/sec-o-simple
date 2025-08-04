import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseVulnerabilities } from '../../../src/utils/csafImport/parseVulnerabilities'
import { getDefaultVulnerability, TCwe, TVulnerability } from '../../../src/routes/vulnerabilities/types/tVulnerability'
import { getDefaultVulnerabilityScore, TVulnerabilityScore } from '../../../src/routes/vulnerabilities/types/tVulnerabilityScore'
import { TRemediation, useRemediationGenerator } from '../../../src/routes/vulnerabilities/types/tRemediation'
import { TVulnerabilityProduct } from '../../../src/routes/vulnerabilities/types/tVulnerabilityProduct'
import { TCSAFDocument } from '../../../src/utils/csafExport/csafExport'
import { TParsedNote } from '../../../src/utils/csafExport/parseNote'
import { DeepPartial } from '../../../src/utils/deepPartial'

// Mock dependencies
vi.mock('../../../src/routes/vulnerabilities/types/tVulnerability')
vi.mock('../../../src/routes/vulnerabilities/types/tVulnerabilityScore')
vi.mock('../../../src/routes/vulnerabilities/types/tRemediation')
vi.mock('../../../src/utils/csafImport/parseNote')
vi.mock('../../../src/utils/csafImport/parseVulnerabilityProducts')

const mockGetDefaultVulnerability = vi.mocked(getDefaultVulnerability)
const mockGetDefaultVulnerabilityScore = vi.mocked(getDefaultVulnerabilityScore)
const mockUseRemediationGenerator = vi.mocked(useRemediationGenerator)

// Import and mock the actual functions
import { parseNote } from '../../../src/utils/csafImport/parseNote'
import { parseVulnerabilityProducts } from '../../../src/utils/csafImport/parseVulnerabilityProducts'

const mockParseNote = vi.mocked(parseNote)
const mockParseVulnerabilityProducts = vi.mocked(parseVulnerabilityProducts)

describe('parseVulnerabilities', () => {
  const mockVulnerabilityProductGenerator = vi.fn()
  const mockRemediationGenerator: TRemediation = {
    id: 'default-remediation-id',
    category: 'mitigation',
    details: 'default-details',
    date: 'default-date',
    url: 'default-url',
    productIds: []
  }

  const mockDefaultVulnerability: TVulnerability = {
    id: 'default-vuln-id',
    cve: 'default-cve',
    cwe: undefined,
    title: 'default-title',
    notes: [],
    products: [],
    remediations: [],
    scores: []
  }

  const mockDefaultScore: TVulnerabilityScore = {
    id: 'default-score-id',
    cvssVersion: null,
    vectorString: 'default-vector',
    productIds: []
  }

  const mockDefaultRemediation: TRemediation = {
    id: 'default-remediation-id',
    category: 'mitigation',
    details: 'default-details',
    date: 'default-date',
    url: 'default-url',
    productIds: []
  }

  const mockVulnerabilityProduct: TVulnerabilityProduct = {
    id: 'mock-vp-id',
    productId: 'mock-product-id',
    status: 'known_affected'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockGetDefaultVulnerability.mockReturnValue({ ...mockDefaultVulnerability })
    mockGetDefaultVulnerabilityScore.mockReturnValue({ ...mockDefaultScore })
    mockUseRemediationGenerator.mockReturnValue({ ...mockDefaultRemediation })
    mockVulnerabilityProductGenerator.mockReturnValue({ ...mockVulnerabilityProduct })
    
    mockParseNote.mockImplementation((note: TParsedNote) => ({
      id: 'parsed-note-id',
      category: note.category,
      title: note.title,
      content: note.text
    }))
    
    mockParseVulnerabilityProducts.mockReturnValue([mockVulnerabilityProduct])
  })

  describe('Basic Functionality', () => {
    it('should return empty array when csafDocument has no vulnerabilities', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: undefined
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result).toEqual([])
      expect(mockGetDefaultVulnerability).not.toHaveBeenCalled()
    })

    it('should return empty array when vulnerabilities array is empty', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: []
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result).toEqual([])
      expect(mockGetDefaultVulnerability).not.toHaveBeenCalled()
    })

    it('should parse single vulnerability with minimal data', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            cve: undefined,
            cwe: undefined,
            title: undefined,
            notes: undefined,
            product_status: {},
            remediations: undefined,
            scores: undefined
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: mockDefaultVulnerability.id,
        cve: mockDefaultVulnerability.cve,
        cwe: undefined,
        title: mockDefaultVulnerability.title,
        notes: undefined,
        products: [mockVulnerabilityProduct],
        remediations: undefined,
        scores: undefined
      })
      expect(mockGetDefaultVulnerability).toHaveBeenCalledTimes(1)
      expect(mockParseVulnerabilityProducts).toHaveBeenCalledWith({}, mockVulnerabilityProductGenerator)
    })
  })

  describe('CVE and CWE Handling', () => {
    it('should use provided CVE when available', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            cve: 'CVE-2023-1234',
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].cve).toBe('CVE-2023-1234')
    })

    it('should use default CVE when not provided', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            cve: undefined,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].cve).toBe(mockDefaultVulnerability.cve)
    })

    it('should handle CWE as TCwe type', () => {
      const mockCwe: TCwe = { id: 'CWE-79', name: 'Cross-site Scripting' }
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            cwe: mockCwe,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].cwe).toEqual(mockCwe)
    })

    it('should handle undefined CWE', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            cwe: undefined,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].cwe).toBeUndefined()
    })
  })

  describe('Title Handling', () => {
    it('should use provided title when available', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            title: 'Custom Vulnerability Title',
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].title).toBe('Custom Vulnerability Title')
    })

    it('should use default title when not provided', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            title: undefined,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].title).toBe(mockDefaultVulnerability.title)
    })
  })

  describe('Notes Handling', () => {
    it('should parse notes when provided', () => {
      const mockNotes: TParsedNote[] = [
        { category: 'general', title: 'Note 1', text: 'Content 1' },
        { category: 'details', title: 'Note 2', text: 'Content 2' }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            notes: mockNotes,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(mockParseNote).toHaveBeenCalledTimes(2)
      expect(mockParseNote).toHaveBeenCalledWith(mockNotes[0])
      expect(mockParseNote).toHaveBeenCalledWith(mockNotes[1])
      expect(result[0].notes).toHaveLength(2)
    })

    it('should handle undefined notes', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            notes: undefined,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(mockParseNote).not.toHaveBeenCalled()
      expect(result[0].notes).toBeUndefined()
    })

    it('should handle empty notes array', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            notes: [],
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(mockParseNote).not.toHaveBeenCalled()
      expect(result[0].notes).toEqual([])
    })
  })

  describe('Products Handling', () => {
    it('should call parseVulnerabilityProducts with correct parameters', () => {
      const mockProductStatus = { known_affected: ['product-1'] }
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            product_status: mockProductStatus
          }
        ]
      }

      parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(mockParseVulnerabilityProducts).toHaveBeenCalledWith(
        mockProductStatus,
        mockVulnerabilityProductGenerator
      )
    })

    it('should use result from parseVulnerabilityProducts', () => {
      const mockProducts = [
        { id: 'vp-1', productId: 'product-1', status: 'known_affected' },
        { id: 'vp-2', productId: 'product-2', status: 'known_not_affected' }
      ]
      mockParseVulnerabilityProducts.mockReturnValue(mockProducts)

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].products).toEqual(mockProducts)
    })
  })

  describe('Remediations Handling', () => {
    it('should parse remediations when provided', () => {
      const mockRemediations = [
        {
          category: 'vendor_fix',
          details: 'Update to version 1.2.3',
          date: '2023-01-01',
          url: 'https://example.com/fix',
          product_ids: ['product-1']
        },
        {
          category: 'workaround',
          details: 'Disable feature X',
          date: '2023-01-02',
          url: 'https://example.com/workaround',
          product_ids: ['product-2']
        }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            remediations: mockRemediations,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].remediations).toHaveLength(2)
      expect(result[0].remediations[0]).toEqual({
        id: mockRemediationGenerator.id,
        category: 'vendor_fix',
        date: '2023-01-01',
        details: 'Update to version 1.2.3',
        url: 'https://example.com/fix',
        productIds: ['product-1']
      })
      expect(result[0].remediations[1]).toEqual({
        id: mockRemediationGenerator.id,
        category: 'workaround',
        date: '2023-01-02',
        details: 'Disable feature X',
        url: 'https://example.com/workaround',
        productIds: ['product-2']
      })
    })

    it('should use default values for missing remediation fields', () => {
      const mockRemediations = [
        {
          category: undefined,
          details: undefined,
          date: undefined,
          url: undefined,
          product_ids: ['product-1']
        }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            remediations: mockRemediations,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].remediations[0]).toEqual({
        id: mockRemediationGenerator.id,
        category: mockRemediationGenerator.category,
        date: mockRemediationGenerator.date,
        details: mockRemediationGenerator.details,
        url: mockRemediationGenerator.url,
        productIds: ['product-1']
      })
    })

    it('should handle undefined remediations', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            remediations: undefined,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].remediations).toBeUndefined()
    })

    it('should handle empty remediations array', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            remediations: [],
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].remediations).toEqual([])
    })
  })

  describe('Scores Handling', () => {
    it('should parse scores with cvss_v3 when provided', () => {
      const mockScores = [
        {
          products: ['product-1'],
          cvss_v3: {
            version: '3.1',
            vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'
          }
        }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            scores: mockScores,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].scores).toHaveLength(1)
      expect(result[0].scores[0]).toEqual({
        id: mockDefaultScore.id,
        productIds: ['product-1'],
        cvssVersion: '3.1',
        vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'
      })
    })

    it('should parse scores with cvss_v4 when provided', () => {
      const mockScores = [
        {
          products: ['product-1'],
          cvss_v4: {
            version: '4.0',
            vectorString: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N'
          }
        }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            scores: mockScores,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].scores[0]).toEqual({
        id: mockDefaultScore.id,
        productIds: ['product-1'],
        cvssVersion: '4.0',
        vectorString: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N'
      })
    })

    it('should default to cvss_v3 when no CVSS version key is found', () => {
      const mockScores = [
        {
          products: ['product-1'],
          someOtherField: 'value'
        }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            scores: mockScores,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].scores[0]).toEqual({
        id: mockDefaultScore.id,
        productIds: ['product-1'],
        cvssVersion: mockDefaultScore.cvssVersion,
        vectorString: mockDefaultScore.vectorString
      })
    })

    it('should use default values when CVSS info is undefined', () => {
      const mockScores = [
        {
          products: ['product-1'],
          cvss_v3: undefined
        }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            scores: mockScores,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].scores[0]).toEqual({
        id: mockDefaultScore.id,
        productIds: ['product-1'],
        cvssVersion: mockDefaultScore.cvssVersion,
        vectorString: mockDefaultScore.vectorString
      })
    })

    it('should handle undefined scores', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            scores: undefined,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].scores).toBeUndefined()
    })

    it('should handle empty scores array', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            scores: [],
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].scores).toEqual([])
    })

    it('should handle multiple scores', () => {
      const mockScores = [
        {
          products: ['product-1'],
          cvss_v3: {
            version: '3.1',
            vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'
          }
        },
        {
          products: ['product-2'],
          cvss_v4: {
            version: '4.0',
            vectorString: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N'
          }
        }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            scores: mockScores,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].scores).toHaveLength(2)
      expect(result[0].scores[0].cvssVersion).toBe('3.1')
      expect(result[0].scores[1].cvssVersion).toBe('4.0')
    })
  })

  describe('Complex Scenarios', () => {
    it('should parse vulnerability with all fields populated', () => {
      const mockCwe: TCwe = { id: 'CWE-79', name: 'Cross-site Scripting' }
      const mockNotes: TParsedNote[] = [
        { category: 'general', title: 'Note 1', text: 'Content 1' }
      ]
      const mockRemediations = [
        {
          category: 'vendor_fix',
          details: 'Update to version 1.2.3',
          date: '2023-01-01',
          url: 'https://example.com/fix',
          product_ids: ['product-1']
        }
      ]
      const mockScores = [
        {
          products: ['product-1'],
          cvss_v3: {
            version: '3.1',
            vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'
          }
        }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            cve: 'CVE-2023-1234',
            cwe: mockCwe,
            title: 'Sample Vulnerability',
            notes: mockNotes,
            product_status: { known_affected: ['product-1'] },
            remediations: mockRemediations,
            scores: mockScores
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: mockDefaultVulnerability.id,
        cve: 'CVE-2023-1234',
        cwe: mockCwe,
        title: 'Sample Vulnerability',
        notes: [expect.objectContaining({
          id: 'parsed-note-id',
          category: 'general',
          title: 'Note 1',
          content: 'Content 1'
        })],
        products: [mockVulnerabilityProduct],
        remediations: [expect.objectContaining({
          id: mockRemediationGenerator.id,
          category: 'vendor_fix',
          details: 'Update to version 1.2.3',
          date: '2023-01-01',
          url: 'https://example.com/fix',
          productIds: ['product-1']
        })],
        scores: [expect.objectContaining({
          id: mockDefaultScore.id,
          productIds: ['product-1'],
          cvssVersion: '3.1',
          vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'
        })]
      })
    })

    it('should parse multiple vulnerabilities', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            cve: 'CVE-2023-1111',
            title: 'Vulnerability 1',
            product_status: {}
          },
          {
            cve: 'CVE-2023-2222',
            title: 'Vulnerability 2',
            product_status: {}
          },
          {
            cve: 'CVE-2023-3333',
            title: 'Vulnerability 3',
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result).toHaveLength(3)
      expect(result[0].cve).toBe('CVE-2023-1111')
      expect(result[0].title).toBe('Vulnerability 1')
      expect(result[1].cve).toBe('CVE-2023-2222')
      expect(result[1].title).toBe('Vulnerability 2')
      expect(result[2].cve).toBe('CVE-2023-3333')
      expect(result[2].title).toBe('Vulnerability 3')
      expect(mockGetDefaultVulnerability).toHaveBeenCalledTimes(3)
    })

    it('should handle edge case with cvss key detection', () => {
      const mockScores = [
        {
          products: ['product-1'],
          cvss_v2: {
            version: '2.0',
            vectorString: 'AV:N/AC:L/Au:N/C:P/I:P/A:P'
          },
          cvss_v3: {
            version: '3.1',
            vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'
          }
        }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            scores: mockScores,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      // Should pick the first cvss_ key found (cvss_v2 in this case)
      expect(result[0].scores[0].cvssVersion).toBe('2.0')
      expect(result[0].scores[0].vectorString).toBe('AV:N/AC:L/Au:N/C:P/I:P/A:P')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle null CSAF document gracefully', () => {
      const csafDocument = null as any

      expect(() => parseVulnerabilities(
        csafDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )).toThrow()
    })

    it('should handle vulnerability with null values', () => {
      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            cve: null,
            cwe: null,
            title: null,
            notes: null,
            product_status: null,
            remediations: null,
            scores: null
          } as any
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result).toHaveLength(1)
      expect(result[0].cve).toBe(mockDefaultVulnerability.cve)
      expect(result[0].title).toBe(mockDefaultVulnerability.title)
    })

    it('should handle scores with missing version and vectorString', () => {
      const mockScores = [
        {
          products: ['product-1'],
          cvss_v3: {
            version: undefined,
            vectorString: undefined
          }
        }
      ]

      const csafDocument: DeepPartial<TCSAFDocument> = {
        vulnerabilities: [
          {
            scores: mockScores,
            product_status: {}
          }
        ]
      }

      const result = parseVulnerabilities(
        csafDocument as TCSAFDocument,
        mockVulnerabilityProductGenerator,
        mockRemediationGenerator
      )

      expect(result[0].scores[0]).toEqual({
        id: mockDefaultScore.id,
        productIds: ['product-1'],
        cvssVersion: mockDefaultScore.cvssVersion,
        vectorString: mockDefaultScore.vectorString
      })
    })
  })
})
