import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCSAFDocument,
  createCSAFExportFilename,
} from '../../../src/utils/csafExport/csafExport'
import type { TDocumentStore } from '../../../src/utils/useDocumentStore'

// Mock the current date to ensure consistent snapshots
vi.setSystemTime(new Date('2023-07-31T12:00:00.000Z'))

describe('csafExport', () => {
  beforeEach(() => {
    // The global setup.ts mocks the csafExport module but doesn't include createCSAFDocument
    // We need to unmock it to access the real function
    vi.unmock('@/utils/csafExport/csafExport')
  })
  const createMockDocumentStore = (): TDocumentStore =>
    ({
      sosDocumentType: 'Software',
      setSOSDocumentType: vi.fn(),
      documentInformation: {
        id: 'test-document-id',
        title: 'Test Security Advisory',
        lang: 'en',
        licenseExpression: 'MIT',
        status: 'final',
        revisionHistory: [
          {
            date: '2023-01-01T00:00:00.000Z',
            number: '1.0.0',
            summary: 'Initial release',
          },
          {
            date: '2023-02-01T00:00:00.000Z',
            number: '1.1.0',
            summary: 'Security update',
          },
        ],
        tlp: {
          label: 'white',
          url: 'https://example.com/tlp',
        },
        publisher: {
          category: 'vendor',
          contactDetails: 'security@example.com',
          issuingAuthority: 'Security Team',
          name: 'Test Publisher',
          namespace: 'https://example.com',
        },
        references: [
          {
            summary: 'Vendor Advisory',
            url: 'https://example.com/advisory',
            category: 'external',
          },
        ],
        acknowledgments: [
          {
            organization: 'Security Research Org',
            names: [{ name: 'Alice Security' }, { name: 'Bob Researcher' }],
            summary: 'Discovered the vulnerability',
            url: 'https://example.com/researchers',
          },
        ],
        notes: [
          {
            id: 'note1',
            category: 'description',
            content: 'This is a test security advisory',
            title: 'Description',
          },
        ],
      },
      products: {
        'vendor-1': {
          id: 'vendor-1',
          category: 'vendor',
          name: 'Test Vendor',
          description: 'A test vendor for security testing',
          subBranches: [
            {
              id: 'product-1',
              category: 'product_name',
              name: 'Test Application',
              description: 'A sample test application for security testing',
              subBranches: [
                {
                  id: 'version-1',
                  category: 'product_version',
                  name: '1.0.0',
                  description: 'Version 1.0.0 of the test application',
                  subBranches: [],
                  type: 'Software',
                },
                {
                  id: 'version-2',
                  category: 'product_version',
                  name: '2.0.0',
                  description: 'Version 2.0.0 of the test application',
                  subBranches: [],
                  type: 'Software',
                },
              ],
              type: 'Software',
            },
          ],
        },
      },
      relationships: [
        {
          id: 'rel-1',
          category: 'default_component_of',
          productId1: 'product-1',
          productId2: 'linux-os',
          relationships: [
            {
              product1VersionId: 'version-1',
              product2VersionId: 'linux-v1',
              relationshipId: 'rel-1',
            },
          ],
          name: 'Test Application v1.0.0 on Linux',
        },
      ],
      vulnerabilities: [
        {
          id: 'vuln-1',
          cve: 'CVE-2023-12345',
          title: 'Cross-site Scripting Vulnerability',
          cwe: {
            id: 'CWE-79',
            name: 'Improper Neutralization of Input During Web Page Generation',
          },
          notes: [
            {
              id: 'vuln-note-1',
              category: 'description',
              content:
                'A cross-site scripting vulnerability exists in the application',
              title: 'Vulnerability Description',
            },
          ],
          products: [
            {
              id: 'vuln-product-1',
              status: 'known_affected',
              versions: [{ id: 'version-1', name: '1.0.0' }],
            },
            {
              id: 'vuln-product-2',
              status: 'fixed',
              versions: [{ id: 'version-2', name: '2.0.0' }],
            },
          ],
          flags: [],
          remediations: [
            {
              category: 'mitigation',
              date: '2023-02-15T00:00:00.000Z',
              details: 'Update to version 2.0.0 or later',
              url: 'https://example.com/update-guide',
              productIds: ['version-1'],
            },
          ],
          scores: [
            {
              id: 'score-1',
              cvssVersion: '3.1',
              vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
              productIds: ['version-1'],
            },
            {
              id: 'score-2',
              cvssVersion: '4.0',
              vectorString:
                'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:R/VC:L/VI:L/VA:N/SC:L/SI:L/SA:N',
              productIds: ['version-1'],
            },
          ],
        },
      ],
      families: [],
      importedCSAFDocument: {},
      setImportedCSAFDocument: vi.fn(),
      updateDocumentInformation: vi.fn(),
      updateProducts: vi.fn(),
      updateFamilies: vi.fn(),
      updateRelationships: vi.fn(),
      updateVulnerabilities: vi.fn(),
      reset: vi.fn(),
    }) as any

  // Mock helper functions
  const mockGetFullProductName = (versionId: string): string => {
    // Find the version in mock data and construct full product name
    const mockStore = createMockDocumentStore()
    const productBranches = Object.values(mockStore.products)
    for (const vendor of productBranches) {
      if (vendor && typeof vendor === 'object' && 'subBranches' in vendor) {
        for (const product of vendor.subBranches || []) {
          if (
            product &&
            typeof product === 'object' &&
            'subBranches' in product
          ) {
            for (const version of product.subBranches || []) {
              if (
                version &&
                typeof version === 'object' &&
                'id' in version &&
                version.id === versionId
              ) {
                return `${vendor.name} ${product.name} ${version.name}`
              }
            }
          }
        }
      }
    }
    return versionId // fallback to ID if not found
  }

  const mockGetRelationshipFullProductName = (
    sourceVersionId: string,
    targetVersionId: string,
    category: string,
  ): string => {
    const sourceName = mockGetFullProductName(sourceVersionId)
    const targetName = mockGetFullProductName(targetVersionId)
    const categoryFormatted = category.replaceAll('_', ' ').toLowerCase()
    return `${sourceName} ${categoryFormatted} ${targetName}`
  }

  it('should create a CSAF document with complete data', () => {
    const mockStore = createMockDocumentStore()
    const mockConfig = {
      template: {},
      productDatabase: { enabled: false },
    }

    const result = createCSAFDocument(
      mockStore,
      mockGetFullProductName,
      mockGetRelationshipFullProductName,
      mockConfig,
    )

    expect(result).toMatchSnapshot()
  })

  it('should create a CSAF document with minimal data', () => {
    const minimalStore = createMockDocumentStore()

    // Override with minimal data
    minimalStore.documentInformation = {
      ...minimalStore.documentInformation,
      revisionHistory: [],
      references: [],
      acknowledgments: [],
      notes: [],
      tlp: undefined,
    }
    minimalStore.products = {} as any
    minimalStore.relationships = []
    minimalStore.vulnerabilities = []

    const result = createCSAFDocument(
      minimalStore,
      mockGetFullProductName,
      mockGetRelationshipFullProductName,
      {
        template: {},
        productDatabase: { enabled: false },
      },
    )

    expect(result).toMatchSnapshot()
  })

  it('should handle vulnerabilities without optional fields', () => {
    const storeWithBasicVuln = createMockDocumentStore()

    storeWithBasicVuln.vulnerabilities = [
      {
        id: 'basic-vuln',
        cve: undefined,
        title: 'Basic Vulnerability',
        cwe: undefined,
        notes: [],
        products: [],
        flags: [],
        remediations: undefined,
        scores: [],
      },
    ]

    const result = createCSAFDocument(
      storeWithBasicVuln,
      mockGetFullProductName,
      mockGetRelationshipFullProductName,
      {
        template: {},
        productDatabase: { enabled: false },
      },
    )

    expect(result).toMatchSnapshot()
  })

  it('should export user vulnerability references and CVSS v4 references', () => {
    const mockStore = createMockDocumentStore()
    mockStore.vulnerabilities[0].references = [
      {
        id: 'vuln-ref-1',
        summary: 'Vendor Security Advisory',
        url: 'https://example.com/vuln-advisory',
        category: 'self',
      },
    ]

    const result = createCSAFDocument(
      mockStore,
      mockGetFullProductName,
      mockGetRelationshipFullProductName,
      {
        template: {},
        productDatabase: { enabled: false },
      },
    )

    expect(result.vulnerabilities[0].references).toEqual([
      {
        summary: 'Vendor Security Advisory',
        url: 'https://example.com/vuln-advisory',
        category: 'self',
      },
    ])
  })

  it('should deduplicate vulnerability references when they match generated CVSS v4 references', () => {
    const mockStore = createMockDocumentStore()
    mockStore.vulnerabilities[0].references = [
      {
        id: 'vuln-ref-1',
        summary: 'CVSS v4.0 Score',
        url: 'https://www.first.org/cvss/calculator/4-0#CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:R/VC:L/VI:L/VA:N/SC:L/SI:L/SA:N',
        category: 'external',
      },
    ]

    const result = createCSAFDocument(
      mockStore,
      mockGetFullProductName,
      mockGetRelationshipFullProductName,
      {
        template: {},
        productDatabase: { enabled: false },
      },
    )

    expect(result.vulnerabilities[0].references).toHaveLength(1)
  })

  it('should export document license expression', () => {
    const mockStore = createMockDocumentStore()

    const result = createCSAFDocument(
      mockStore,
      mockGetFullProductName,
      mockGetRelationshipFullProductName,
      {
        template: {},
        productDatabase: { enabled: false },
      },
    )

    expect(result.document.license_expression).toBe('MIT')
  })

  it('applies known affected products to remediations and scores when enabled', () => {
    const mockStore = createMockDocumentStore()
    mockStore.vulnerabilities[0].products = [
      {
        id: 'vuln-product-1',
        productId: 'version-1',
        status: 'known_affected',
      },
      {
        id: 'vuln-product-2',
        productId: 'version-2',
        status: 'fixed',
      },
    ] as any

    mockStore.vulnerabilities[0].remediations = [
      {
        category: 'mitigation',
        details: 'Update to latest version',
        productIds: [],
        applyAllKnownAffectedProducts: true,
      },
    ] as any

    mockStore.vulnerabilities[0].scores = [
      {
        id: 'score-1',
        cvssVersion: '3.1',
        vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
        productIds: [],
        applyAllKnownAffectedProducts: true,
      },
    ] as any

    const result = createCSAFDocument(
      mockStore,
      mockGetFullProductName,
      mockGetRelationshipFullProductName,
      {
        template: {},
        productDatabase: { enabled: false },
      },
    )

    expect(result.vulnerabilities[0].remediations?.[0].product_ids).toEqual([
      'version-1',
    ])
    expect(result.vulnerabilities[0].metrics?.[0].products).toEqual([
      'version-1',
    ])
  })

  describe('createCSAFExportFilename', () => {
    it('converts tracking id to lowercase and keeps valid characters', () => {
      expect(createCSAFExportFilename('ESA-2023-B-001', true)).toBe(
        'esa-2023-b-001.json',
      )
    })

    it('replaces invalid character sequences with single underscores', () => {
      expect(createCSAFExportFilename('2022_#01-A', true)).toBe('2022_01-a.json')
      expect(createCSAFExportFilename('ESA##+2023-A*', true)).toBe(
        'esa_2023-a_.json',
      )
    })

    it('appends invalid suffix when document is invalid', () => {
      expect(createCSAFExportFilename('ESA-2023-B-001', false)).toBe(
        'esa-2023-b-001_invalid.json',
      )
    })
  })
})
