 import { describe, expect, it, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Unmock the store to test actual implementation
vi.unmock('../../src/utils/useDocumentStore')

import useDocumentStore from '../../src/utils/useDocumentStore'
import { getDefaultDocumentInformation } from '../../src/routes/document-information/types/tDocumentInformation'

describe('useDocumentStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useDocumentStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDocumentStore())
    
    expect(result.current.documentInformation).toEqual(getDefaultDocumentInformation())
    expect(result.current.products).toEqual([])
    expect(result.current.families).toEqual([])
    expect(result.current.relationships).toEqual([])
    expect(result.current.vulnerabilities).toEqual([])
    expect(result.current.importedCSAFDocument).toEqual({})
  })

  it('should update document information', () => {
    const { result } = renderHook(() => useDocumentStore())
    const newDocInfo = {
      ...getDefaultDocumentInformation(),
      title: 'Test Document',
    }

    act(() => {
      result.current.updateDocumentInformation(newDocInfo)
    })

    expect(result.current.documentInformation.title).toBe('Test Document')
  })

  it('should update products', () => {
    const { result } = renderHook(() => useDocumentStore())
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        description: 'A test product',
        type: 'software' as const,
        vendor: { id: '1', name: 'Test Vendor', description: '' },
        versions: [],
        relationships: [],
      },
    ]

    act(() => {
      result.current.updateProducts(mockProducts)
    })

    expect(result.current.products).toEqual(mockProducts)
  })

  it('should update families', () => {
    const { result } = renderHook(() => useDocumentStore())
    const mockFamilies = [
      {
        id: '1',
        name: 'Test Family',
        description: 'A test family',
        parent: undefined,
      },
    ]

    act(() => {
      result.current.updateFamilies(mockFamilies)
    })

    expect(result.current.families).toEqual(mockFamilies)
  })

  it('should update relationships', () => {
    const { result } = renderHook(() => useDocumentStore())
    const mockRelationships = [
      {
        id: '1',
        name: 'Test Relationship',
        sourceProductId: 'source-1',
        targetProductId: 'target-1',
        sourceVersionIds: [],
        targetVersionIds: [],
        category: 'default_component_of' as const,
      },
    ]

    act(() => {
      result.current.updateRelationships(mockRelationships)
    })

    expect(result.current.relationships).toEqual(mockRelationships)
  })

  it('should update vulnerabilities', () => {
    const { result } = renderHook(() => useDocumentStore())
    const mockVulnerabilities = [
      {
        id: '1',
        title: 'Test Vulnerability',
        cve: 'CVE-2024-0001',
        notes: [],
        products: [],
        remediations: [],
        scores: [],
        flags: [],
      },
    ]

    act(() => {
      result.current.updateVulnerabilities(mockVulnerabilities)
    })

    expect(result.current.vulnerabilities).toEqual(mockVulnerabilities)
  })

  it('should set imported CSAF document', () => {
    const { result } = renderHook(() => useDocumentStore())
    const mockDocument = {
      document: {
        title: 'Imported Document',
      },
    }

    act(() => {
      result.current.setImportedCSAFDocument(mockDocument)
    })

    expect(result.current.importedCSAFDocument).toEqual(mockDocument)
  })

  it('should merge imported CSAF document with existing data', () => {
    const { result } = renderHook(() => useDocumentStore())
    const firstUpdate = {
      document: {
        title: 'First Title',
      },
    }
    const secondUpdate = {
      document: {
        category: 'csaf_security_advisory',
      },
    }

    act(() => {
      result.current.setImportedCSAFDocument(firstUpdate)
    })

    act(() => {
      result.current.setImportedCSAFDocument(secondUpdate)
    })

    // The merge replaces properties at the same level, not deep merge
    expect(result.current.importedCSAFDocument).toEqual({
      document: {
        category: 'csaf_security_advisory',
      },
    })
  })

  it('should reset all data', () => {
    const { result } = renderHook(() => useDocumentStore())
    
    // First set some data
    act(() => {
      result.current.updateProducts([
        {
          id: '1',
          name: 'Test Product',
          description: 'Test',
          type: 'software',
          vendor: { id: '1', name: 'Test Vendor', description: '' },
          versions: [],
          relationships: [],
        },
      ])
      result.current.setImportedCSAFDocument({ 
        document: { 
          title: 'Test Import Data' 
        } 
      } as any)
    })

    // Verify data is set
    expect(result.current.products).toHaveLength(1)
    // Note: importedCSAFDocument might have other data merged in, so just check for our test data
    expect(result.current.importedCSAFDocument).toMatchObject({ 
      document: { 
        title: 'Test Import Data' 
      } 
    })

    // Reset
    act(() => {
      result.current.reset()
    })

    // Verify reset - only the main document data gets reset, not importedCSAFDocument
    expect(result.current.documentInformation).toEqual(getDefaultDocumentInformation())
    expect(result.current.products).toEqual([])
    expect(result.current.families).toEqual([])
    expect(result.current.relationships).toEqual([])
    expect(result.current.vulnerabilities).toEqual([])
    // importedCSAFDocument is not reset by the reset function
    expect(result.current.importedCSAFDocument).toMatchObject({ 
      document: { 
        title: 'Test Import Data' 
      } 
    })
  })

  it('should maintain state consistency across multiple updates', () => {
    const { result } = renderHook(() => useDocumentStore())
    
    act(() => {
      result.current.updateProducts([
        {
          id: '1',
          name: 'Product 1',
          description: 'First product',
          type: 'software',
          vendor: { id: '1', name: 'Vendor 1', description: '' },
          versions: [],
          relationships: [],
        },
      ])
    })

    act(() => {
      result.current.updateVulnerabilities([
        {
          id: '1',
          title: 'Vulnerability 1',
          cve: 'CVE-2024-0001',
          notes: [],
          products: [],
          remediations: [],
          scores: [],
          flags: [],
        },
      ])
    })

    expect(result.current.products).toHaveLength(1)
    expect(result.current.vulnerabilities).toHaveLength(1)
    expect(result.current.families).toHaveLength(0)
    expect(result.current.relationships).toHaveLength(0)
  })
})