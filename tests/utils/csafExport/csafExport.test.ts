import { describe, it, expect, vi } from 'vitest'
import { createCSAFDocument } from '../../../src/utils/csafExport/csafExport'
import type { TDocumentStore } from '../../../src/utils/useDocumentStore'

// Mock the current date to ensure consistent snapshots
vi.setSystemTime(new Date('2023-07-31T12:00:00.000Z'))

describe('csafExport', () => {
  const createMockDocumentStore = (): TDocumentStore => ({
    sosDocumentType: 'Software',
    setSOSDocumentType: vi.fn(),
    documentInformation: {
      id: 'test-document-id',
      title: 'Test Security Advisory',
      lang: 'en',
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
        product1VersionIds: ['version-1'],
        product2VersionIds: ['linux-v1'],
        name: 'Test Application v1.0.0 on Linux',
      },
    ],
    vulnerabilities: {
      'vuln-1': {
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
            content: 'A cross-site scripting vulnerability exists in the application',
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
            vectorString: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:R/VC:L/VI:L/VA:N/SC:L/SI:L/SA:N',
            productIds: ['version-1'],
          },
        ],
      },
    },
    importedCSAFDocument: {},
    setImportedCSAFDocument: vi.fn(),
    updateDocumentInformation: vi.fn(),
    updateProducts: vi.fn(),
    updateRelationships: vi.fn(),
    updateVulnerabilities: vi.fn(),
    reset: vi.fn(),
  } as any)

  it('should create a CSAF document with complete data', () => {
    const mockStore = createMockDocumentStore()
    const mockConfig = { 
      template: {},
      productDatabase: { enabled: false }
    }
    
    const result = createCSAFDocument(mockStore, mockConfig)
    
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
    minimalStore.vulnerabilities = {} as any
    
    const result = createCSAFDocument(minimalStore, { 
      template: {},
      productDatabase: { enabled: false }
    })
    
    expect(result).toMatchSnapshot()
  })

  it('should handle vulnerabilities without optional fields', () => {
    const storeWithBasicVuln = createMockDocumentStore()
    
    storeWithBasicVuln.vulnerabilities = {
      'basic-vuln': {
        id: 'basic-vuln',
        cve: undefined,
        title: 'Basic Vulnerability',
        cwe: undefined,
        notes: [],
        products: [],
        remediations: undefined,
        scores: [],
      },
    } as any
    
    const result = createCSAFDocument(storeWithBasicVuln, { 
      template: {},
      productDatabase: { enabled: false }
    })
    
    expect(result).toMatchSnapshot()
  })
})
