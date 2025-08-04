import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseRelationships } from '../../../src/utils/csafImport/parseRelationships'
import { CSAFRelationship, TRelationship, getDefaultRelationship } from '../../../src/routes/products/types/tRelationship'
import { TProductTreeBranch } from '../../../src/routes/products/types/tProductTreeBranch'

// Mock the utils module
const mockGetParentPTB = vi.fn()
vi.mock('../../../src/utils/csafImport/utils', () => ({
  getParentPTB: (...args: any[]) => mockGetParentPTB(...args),
}))

// Mock uid to return predictable values
vi.mock('uid', () => ({
  uid: vi.fn(() => 'mock-uid-123'),
}))

// Mock console.error to test error logging
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('parseRelationships', () => {
  const mockPTB1: TProductTreeBranch = {
    id: 'ptb-1',
    name: 'Product 1',
    description: 'Mock Product 1 Description',
    category: 'product_name',
    subBranches: [],
  }

  const mockPTB2: TProductTreeBranch = {
    id: 'ptb-2',
    name: 'Product 2',
    description: 'Mock Product 2 Description',
    category: 'product_name',
    subBranches: [],
  }

  const mockSosPTBs: TProductTreeBranch[] = [mockPTB1, mockPTB2]

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy.mockClear()
  })

  describe('Basic Functionality', () => {
    it('should return empty array when no CSAF relationships provided', () => {
      const result = parseRelationships([], mockSosPTBs)
      expect(result).toEqual([])
    })

    it('should return empty array when no SOS PTBs provided', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Test Product',
            product_id: 'prod-1',
          },
        },
      ]

      mockGetParentPTB.mockReturnValue(undefined)

      const result = parseRelationships(csafRelationships, [])
      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to parse csaf relationship',
        csafRelationships[0]
      )
    })

    it('should parse a single relationship successfully', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Test Product',
            product_id: 'prod-1',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1) // For ref1
        .mockReturnValueOnce(mockPTB2) // For ref2

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'mock-uid-123',
        category: 'installed_on',
        productId1: 'ptb-1',
        productId2: 'ptb-2',
        name: 'Test Product',
        relationships: [
          {
            product1VersionId: 'ref1',
            product2VersionId: 'ref2',
            relationshipId: 'prod-1',
          },
        ],
      })
    })

    it('should parse multiple relationships with different categories', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Product A',
            product_id: 'prod-a',
          },
        },
        {
          category: 'installed_with',
          product_reference: 'ref3',
          relates_to_product_reference: 'ref4',
          full_product_name: {
            name: 'Product B',
            product_id: 'prod-b',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1) // For ref1
        .mockReturnValueOnce(mockPTB2) // For ref2
        .mockReturnValueOnce(mockPTB1) // For ref3
        .mockReturnValueOnce(mockPTB2) // For ref4

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(2)
      expect(result[0].category).toBe('installed_on')
      expect(result[1].category).toBe('installed_with')
    })
  })

  describe('Relationship Merging', () => {
    it('should merge relationships with same category and product IDs', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Product A',
            product_id: 'prod-a',
          },
        },
        {
          category: 'installed_on',
          product_reference: 'ref3',
          relates_to_product_reference: 'ref4',
          full_product_name: {
            name: 'Product B',
            product_id: 'prod-b',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1) // For ref1
        .mockReturnValueOnce(mockPTB2) // For ref2
        .mockReturnValueOnce(mockPTB1) // For ref3 (same parent as ref1)
        .mockReturnValueOnce(mockPTB2) // For ref4 (same parent as ref2)

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(1)
      expect(result[0].relationships).toHaveLength(2)
      expect(result[0].name).toBe('Product AProduct B')
    })

    it('should not merge relationships with different categories', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Product A',
            product_id: 'prod-a',
          },
        },
        {
          category: 'installed_with',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Product A',
            product_id: 'prod-a',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1) // For ref1
        .mockReturnValueOnce(mockPTB2) // For ref2
        .mockReturnValueOnce(mockPTB1) // For ref1 again
        .mockReturnValueOnce(mockPTB2) // For ref2 again

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(2)
      expect(result[0].category).toBe('installed_on')
      expect(result[1].category).toBe('installed_with')
    })

    it('should not merge relationships with different product IDs', () => {
      const mockPTB3: TProductTreeBranch = {
        id: 'ptb-3',
        name: 'Product 3',
        description: 'Mock Product 3 Description',
        category: 'product_name',
        subBranches: [],
      }

      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Product A',
            product_id: 'prod-a',
          },
        },
        {
          category: 'installed_on',
          product_reference: 'ref3',
          relates_to_product_reference: 'ref4',
          full_product_name: {
            name: 'Product B',
            product_id: 'prod-b',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1) // For ref1
        .mockReturnValueOnce(mockPTB2) // For ref2
        .mockReturnValueOnce(mockPTB3) // For ref3 (different parent)
        .mockReturnValueOnce(mockPTB2) // For ref4

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(2)
      expect(result[0].productId1).toBe('ptb-1')
      expect(result[1].productId1).toBe('ptb-3')
    })

    it('should not add duplicate relationship entries', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Product A',
            product_id: 'prod-a',
          },
        },
        {
          category: 'installed_on',
          product_reference: 'ref1', // Same references
          relates_to_product_reference: 'ref2', // Same references
          full_product_name: {
            name: 'Product A Duplicate',
            product_id: 'prod-a-dup',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1) // For ref1
        .mockReturnValueOnce(mockPTB2) // For ref2
        .mockReturnValueOnce(mockPTB1) // For ref1 again
        .mockReturnValueOnce(mockPTB2) // For ref2 again

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(1)
      expect(result[0].relationships).toHaveLength(1) // Should not duplicate
      expect(result[0].name).toBe('Product AProduct A Duplicate')
    })
  })

  describe('Name Handling', () => {
    it('should handle empty product name', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: '',
            product_id: 'prod-1',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1)
        .mockReturnValueOnce(mockPTB2)

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result[0].name).toBe('')
    })

    it('should not append duplicate names', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Unique Product',
            product_id: 'prod-a',
          },
        },
        {
          category: 'installed_on',
          product_reference: 'ref3',
          relates_to_product_reference: 'ref4',
          full_product_name: {
            name: 'Unique Product', // Same name
            product_id: 'prod-b',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1)
        .mockReturnValueOnce(mockPTB2)
        .mockReturnValueOnce(mockPTB1)
        .mockReturnValueOnce(mockPTB2)

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Unique Product') // Should not duplicate
    })

    it('should append different names', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Product One',
            product_id: 'prod-a',
          },
        },
        {
          category: 'installed_on',
          product_reference: 'ref3',
          relates_to_product_reference: 'ref4',
          full_product_name: {
            name: 'Product Two',
            product_id: 'prod-b',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1)
        .mockReturnValueOnce(mockPTB2)
        .mockReturnValueOnce(mockPTB1)
        .mockReturnValueOnce(mockPTB2)

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Product OneProduct Two')
    })
  })

  describe('Error Handling', () => {
    it('should skip relationships when parent1 is not found', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'invalid-ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Test Product',
            product_id: 'prod-1',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(undefined) // parent1 not found
        .mockReturnValueOnce(mockPTB2)   // parent2 found

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to parse csaf relationship',
        csafRelationships[0]
      )
    })

    it('should skip relationships when parent2 is not found', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'invalid-ref2',
          full_product_name: {
            name: 'Test Product',
            product_id: 'prod-1',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1)   // parent1 found
        .mockReturnValueOnce(undefined)  // parent2 not found

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to parse csaf relationship',
        csafRelationships[0]
      )
    })

    it('should skip relationships when both parents are not found', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'invalid-ref1',
          relates_to_product_reference: 'invalid-ref2',
          full_product_name: {
            name: 'Test Product',
            product_id: 'prod-1',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(undefined) // parent1 not found
        .mockReturnValueOnce(undefined) // parent2 not found

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to parse csaf relationship',
        csafRelationships[0]
      )
    })

    it('should continue processing after encountering invalid relationships', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'invalid-ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Invalid Product',
            product_id: 'invalid-prod',
          },
        },
        {
          category: 'installed_on',
          product_reference: 'ref3',
          relates_to_product_reference: 'ref4',
          full_product_name: {
            name: 'Valid Product',
            product_id: 'valid-prod',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(undefined) // parent1 not found for first relationship
        .mockReturnValueOnce(mockPTB2)  // parent2 found for first relationship
        .mockReturnValueOnce(mockPTB1)  // parent1 found for second relationship
        .mockReturnValueOnce(mockPTB2)  // parent2 found for second relationship

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Valid Product')
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle mixed valid and invalid relationships', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Valid Product 1',
            product_id: 'prod-1',
          },
        },
        {
          category: 'installed_with',
          product_reference: 'invalid-ref',
          relates_to_product_reference: 'ref3',
          full_product_name: {
            name: 'Invalid Product',
            product_id: 'invalid-prod',
          },
        },
        {
          category: 'optional_component_of',
          product_reference: 'ref4',
          relates_to_product_reference: 'ref5',
          full_product_name: {
            name: 'Valid Product 2',
            product_id: 'prod-2',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1)  // Valid for first relationship
        .mockReturnValueOnce(mockPTB2)  // Valid for first relationship
        .mockReturnValueOnce(undefined) // Invalid for second relationship
        .mockReturnValueOnce(mockPTB1)  // Doesn't matter, already invalid
        .mockReturnValueOnce(mockPTB2)  // Valid for third relationship
        .mockReturnValueOnce(mockPTB1)  // Valid for third relationship

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(2)
      expect(result[0].category).toBe('installed_on')
      expect(result[1].category).toBe('optional_component_of')
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })

    it('should handle all relationship categories', () => {
      const categories = [
        'default_component_of',
        'external_component_of', 
        'installed_on',
        'installed_with',
        'optional_component_of'
      ] as const

      const csafRelationships: CSAFRelationship[] = categories.map((category, index) => ({
        category,
        product_reference: `ref${index + 1}`,
        relates_to_product_reference: `ref${index + 10}`,
        full_product_name: {
          name: `Product ${category}`,
          product_id: `prod-${index + 1}`,
        },
      }))

      // Mock all calls to return valid parents
      categories.forEach(() => {
        mockGetParentPTB
          .mockReturnValueOnce(mockPTB1)
          .mockReturnValueOnce(mockPTB2)
      })

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(5)
      categories.forEach((category, index) => {
        expect(result[index].category).toBe(category)
        expect(result[index].name).toBe(`Product ${category}`)
      })
    })

    it('should handle relationships with undefined relationships array', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Test Product',
            product_id: 'prod-1',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1)
        .mockReturnValueOnce(mockPTB2)

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(1)
      // The function should handle gracefully even when relationships array might be undefined
      expect(result[0].relationships).toBeDefined()
      expect(result[0].relationships).toEqual([{
        product1VersionId: 'ref1',
        product2VersionId: 'ref2',
        relationshipId: 'prod-1',
      }])
    })

    it('should handle large number of relationships efficiently', () => {
      const numRelationships = 100
      const csafRelationships: CSAFRelationship[] = Array.from(
        { length: numRelationships },
        (_, index) => ({
          category: 'installed_on',
          product_reference: `ref${index}`,
          relates_to_product_reference: `ref${index + 1000}`,
          full_product_name: {
            name: `Product ${index}`,
            product_id: `prod-${index}`,
          },
        })
      )

      // Mock all calls to return valid parents alternating between mockPTB1 and mockPTB2
      for (let i = 0; i < numRelationships; i++) {
        mockGetParentPTB
          .mockReturnValueOnce(i % 2 === 0 ? mockPTB1 : mockPTB2)
          .mockReturnValueOnce(mockPTB2)
      }

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      // Should create two groups: ptb-1 -> ptb-2 and ptb-2 -> ptb-2
      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(2)
      
      // Verify total relationship entries match input
      const totalRelationshipEntries = result.reduce(
        (sum, rel) => sum + (rel.relationships?.length || 0),
        0
      )
      expect(totalRelationshipEntries).toBe(numRelationships)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null/undefined values gracefully', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: null as any,
            product_id: 'prod-1',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1)
        .mockReturnValueOnce(mockPTB2)

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('')
    })

    it('should handle getParentPTB returning PTB without id', () => {
      const ptbWithoutId = { ...mockPTB1, id: undefined } as any

      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: 'ref1',
          relates_to_product_reference: 'ref2',
          full_product_name: {
            name: 'Test Product',
            product_id: 'prod-1',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(ptbWithoutId)  // PTB without id
        .mockReturnValueOnce(mockPTB2)      // Valid PTB

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to parse csaf relationship',
        csafRelationships[0]
      )
    })

    it('should handle empty string product references', () => {
      const csafRelationships: CSAFRelationship[] = [
        {
          category: 'installed_on',
          product_reference: '',
          relates_to_product_reference: '',
          full_product_name: {
            name: 'Test Product',
            product_id: 'prod-1',
          },
        },
      ]

      mockGetParentPTB
        .mockReturnValueOnce(mockPTB1)
        .mockReturnValueOnce(mockPTB2)

      const result = parseRelationships(csafRelationships, mockSosPTBs)

      expect(result).toHaveLength(1)
      expect(result[0].relationships?.[0]).toEqual({
        product1VersionId: '',
        product2VersionId: '',
        relationshipId: 'prod-1',
      })
    })
  })
})
