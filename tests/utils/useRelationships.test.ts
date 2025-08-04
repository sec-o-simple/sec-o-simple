import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRelationships } from '../../src/utils/useRelationships'
import { TRelationship, relationshipCategories } from '../../src/routes/products/types/tRelationship'

// Mock the document store
vi.mock('../../src/utils/useDocumentStore')

import useDocumentStore from '../../src/utils/useDocumentStore'

describe('useRelationships', () => {
  let mockGlobalRelationships: TRelationship[]
  let mockUpdateRelationships: Mock

  const createMockRelationship = (overrides: Partial<TRelationship> = {}): TRelationship => ({
    id: 'rel-1',
    category: 'installed_on',
    productId1: 'product-1',
    productId2: 'product-2',
    name: 'Test Relationship',
    relationships: [
      {
        product1VersionId: 'version-1',
        product2VersionId: 'version-2',
        relationshipId: 'rel-id-1',
      },
    ],
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()

    mockGlobalRelationships = []
    mockUpdateRelationships = vi.fn()

    // Mock the document store
    ;(useDocumentStore as unknown as Mock).mockImplementation((selector) => {
      const mockState = {
        relationships: mockGlobalRelationships,
        updateRelationships: mockUpdateRelationships,
        // Add other store properties that might be needed
        sosDocumentType: 'Software',
        setSOSDocumentType: vi.fn(),
        documentInformation: {},
        products: [],
        vulnerabilities: [],
        importedCSAFDocument: {},
        setImportedCSAFDocument: vi.fn(),
        updateDocumentInformation: vi.fn(),
        updateProducts: vi.fn(),
        updateVulnerabilities: vi.fn(),
        reset: vi.fn(),
      }
      return selector(mockState)
    })
  })

  describe('getRelationshipsBySourceVersion', () => {
    it('should return relationships that contain the source version ID', () => {
      const relationship1 = createMockRelationship({
        id: 'rel-1',
        relationships: [
          {
            product1VersionId: 'source-version-1',
            product2VersionId: 'target-version-1',
            relationshipId: 'rel-id-1',
          },
        ],
      })

      const relationship2 = createMockRelationship({
        id: 'rel-2',
        relationships: [
          {
            product1VersionId: 'source-version-2',
            product2VersionId: 'target-version-2',
            relationshipId: 'rel-id-2',
          },
        ],
      })

      const relationship3 = createMockRelationship({
        id: 'rel-3',
        relationships: [
          {
            product1VersionId: 'different-source',
            product2VersionId: 'target-version-3',
            relationshipId: 'rel-id-3',
          },
        ],
      })

      mockGlobalRelationships = [relationship1, relationship2, relationship3]

      const { result } = renderHook(() => useRelationships())

      const foundRelationships = result.current.getRelationshipsBySourceVersion('source-version-1')

      expect(foundRelationships).toHaveLength(1)
      expect(foundRelationships[0]).toEqual(relationship1)
    })

    it('should return empty array when no relationships match source version', () => {
      const relationship = createMockRelationship({
        relationships: [
          {
            product1VersionId: 'different-source',
            product2VersionId: 'target-version',
            relationshipId: 'rel-id',
          },
        ],
      })

      mockGlobalRelationships = [relationship]

      const { result } = renderHook(() => useRelationships())

      const foundRelationships = result.current.getRelationshipsBySourceVersion('non-existent-source')

      expect(foundRelationships).toHaveLength(0)
      expect(foundRelationships).toEqual([])
    })

    it('should handle relationships with no relationships array', () => {
      const relationship = createMockRelationship({
        relationships: undefined,
      })

      mockGlobalRelationships = [relationship]

      const { result } = renderHook(() => useRelationships())

      const foundRelationships = result.current.getRelationshipsBySourceVersion('source-version-1')

      expect(foundRelationships).toHaveLength(0)
    })

    it('should handle relationships with empty relationships array', () => {
      const relationship = createMockRelationship({
        relationships: [],
      })

      mockGlobalRelationships = [relationship]

      const { result } = renderHook(() => useRelationships())

      const foundRelationships = result.current.getRelationshipsBySourceVersion('source-version-1')

      expect(foundRelationships).toHaveLength(0)
    })

    it('should return multiple relationships matching the same source version', () => {
      const relationship1 = createMockRelationship({
        id: 'rel-1',
        relationships: [
          {
            product1VersionId: 'source-version-1',
            product2VersionId: 'target-version-1',
            relationshipId: 'rel-id-1',
          },
        ],
      })

      const relationship2 = createMockRelationship({
        id: 'rel-2',
        relationships: [
          {
            product1VersionId: 'source-version-1',
            product2VersionId: 'target-version-2',
            relationshipId: 'rel-id-2',
          },
        ],
      })

      mockGlobalRelationships = [relationship1, relationship2]

      const { result } = renderHook(() => useRelationships())

      const foundRelationships = result.current.getRelationshipsBySourceVersion('source-version-1')

      expect(foundRelationships).toHaveLength(2)
      expect(foundRelationships).toContain(relationship1)
      expect(foundRelationships).toContain(relationship2)
    })
  })

  describe('getRelationshipsByTargetVersion', () => {
    it('should return relationships that contain the target version ID', () => {
      const relationship1 = createMockRelationship({
        id: 'rel-1',
        relationships: [
          {
            product1VersionId: 'source-version-1',
            product2VersionId: 'target-version-1',
            relationshipId: 'rel-id-1',
          },
        ],
      })

      const relationship2 = createMockRelationship({
        id: 'rel-2',
        relationships: [
          {
            product1VersionId: 'source-version-2',
            product2VersionId: 'target-version-2',
            relationshipId: 'rel-id-2',
          },
        ],
      })

      mockGlobalRelationships = [relationship1, relationship2]

      const { result } = renderHook(() => useRelationships())

      const foundRelationships = result.current.getRelationshipsByTargetVersion('target-version-1')

      expect(foundRelationships).toHaveLength(1)
      expect(foundRelationships[0]).toEqual(relationship1)
    })

    it('should return empty array when no relationships match target version', () => {
      const relationship = createMockRelationship({
        relationships: [
          {
            product1VersionId: 'source-version',
            product2VersionId: 'different-target',
            relationshipId: 'rel-id',
          },
        ],
      })

      mockGlobalRelationships = [relationship]

      const { result } = renderHook(() => useRelationships())

      const foundRelationships = result.current.getRelationshipsByTargetVersion('non-existent-target')

      expect(foundRelationships).toHaveLength(0)
    })

    it('should handle relationships with no relationships array', () => {
      const relationship = createMockRelationship({
        relationships: undefined,
      })

      mockGlobalRelationships = [relationship]

      const { result } = renderHook(() => useRelationships())

      const foundRelationships = result.current.getRelationshipsByTargetVersion('target-version-1')

      expect(foundRelationships).toHaveLength(0)
    })

    it('should return multiple relationships matching the same target version', () => {
      const relationship1 = createMockRelationship({
        id: 'rel-1',
        relationships: [
          {
            product1VersionId: 'source-version-1',
            product2VersionId: 'target-version-1',
            relationshipId: 'rel-id-1',
          },
        ],
      })

      const relationship2 = createMockRelationship({
        id: 'rel-2',
        relationships: [
          {
            product1VersionId: 'source-version-2',
            product2VersionId: 'target-version-1',
            relationshipId: 'rel-id-2',
          },
        ],
      })

      mockGlobalRelationships = [relationship1, relationship2]

      const { result } = renderHook(() => useRelationships())

      const foundRelationships = result.current.getRelationshipsByTargetVersion('target-version-1')

      expect(foundRelationships).toHaveLength(2)
      expect(foundRelationships).toContain(relationship1)
      expect(foundRelationships).toContain(relationship2)
    })
  })

  describe('sortRelationshipsByCategory', () => {
    it('should categorize relationships by their category using global relationships', () => {
      const relationship1 = createMockRelationship({
        id: 'rel-1',
        category: 'installed_on',
      })

      const relationship2 = createMockRelationship({
        id: 'rel-2',
        category: 'default_component_of',
      })

      const relationship3 = createMockRelationship({
        id: 'rel-3',
        category: 'installed_on',
      })

      mockGlobalRelationships = [relationship1, relationship2, relationship3]

      const { result } = renderHook(() => useRelationships())

      const categorized = result.current.sortRelationshipsByCategory()

      expect(categorized).toHaveProperty('installed_on')
      expect(categorized).toHaveProperty('default_component_of')
      expect(categorized).toHaveProperty('external_component_of')
      expect(categorized).toHaveProperty('installed_with')
      expect(categorized).toHaveProperty('optional_component_of')

      expect(categorized.installed_on).toHaveLength(2)
      expect(categorized.installed_on).toContain(relationship1)
      expect(categorized.installed_on).toContain(relationship3)

      expect(categorized.default_component_of).toHaveLength(1)
      expect(categorized.default_component_of).toContain(relationship2)

      expect(categorized.external_component_of).toHaveLength(0)
      expect(categorized.installed_with).toHaveLength(0)
      expect(categorized.optional_component_of).toHaveLength(0)
    })

    it('should categorize provided relationships instead of global relationships', () => {
      const globalRelationship = createMockRelationship({
        id: 'global-rel',
        category: 'installed_on',
      })

      const providedRelationship = createMockRelationship({
        id: 'provided-rel',
        category: 'default_component_of',
      })

      mockGlobalRelationships = [globalRelationship]

      const { result } = renderHook(() => useRelationships())

      const categorized = result.current.sortRelationshipsByCategory([providedRelationship])

      expect(categorized.default_component_of).toHaveLength(1)
      expect(categorized.default_component_of).toContain(providedRelationship)
      expect(categorized.installed_on).toHaveLength(0)
    })

    it('should handle empty relationships array', () => {
      const { result } = renderHook(() => useRelationships())

      const categorized = result.current.sortRelationshipsByCategory([])

      relationshipCategories.forEach((category) => {
        expect(categorized[category]).toHaveLength(0)
      })
    })

    it('should create empty arrays for all categories when no relationships exist', () => {
      mockGlobalRelationships = []

      const { result } = renderHook(() => useRelationships())

      const categorized = result.current.sortRelationshipsByCategory()

      relationshipCategories.forEach((category) => {
        expect(categorized).toHaveProperty(category)
        expect(categorized[category]).toEqual([])
      })
    })

    it('should handle all relationship categories', () => {
      const relationships = relationshipCategories.map((category, index) =>
        createMockRelationship({
          id: `rel-${index}`,
          category,
        })
      )

      mockGlobalRelationships = relationships

      const { result } = renderHook(() => useRelationships())

      const categorized = result.current.sortRelationshipsByCategory()

      relationshipCategories.forEach((category, index) => {
        expect(categorized[category]).toHaveLength(1)
        expect(categorized[category][0]).toEqual(relationships[index])
      })
    })
  })

  describe('addOrUpdateRelationship', () => {
    it('should add new relationship when it does not exist', () => {
      const newRelationship = createMockRelationship({
        id: 'new-rel',
      })

      mockGlobalRelationships = []

      const { result } = renderHook(() => useRelationships())

      act(() => {
        result.current.addOrUpdateRelationship(newRelationship)
      })

      expect(mockUpdateRelationships).toHaveBeenCalledWith([newRelationship])
      expect(mockUpdateRelationships).toHaveBeenCalledTimes(1)
    })

    it('should update existing relationship when it exists', () => {
      const existingRelationship = createMockRelationship({
        id: 'existing-rel',
        name: 'Original Name',
      })

      const updatedRelationship = createMockRelationship({
        id: 'existing-rel',
        name: 'Updated Name',
      })

      mockGlobalRelationships = [existingRelationship]

      const { result } = renderHook(() => useRelationships())

      act(() => {
        result.current.addOrUpdateRelationship(updatedRelationship)
      })

      expect(mockUpdateRelationships).toHaveBeenCalledWith([updatedRelationship])
      expect(mockUpdateRelationships).toHaveBeenCalledTimes(1)
    })

    it('should update only the matching relationship when multiple exist', () => {
      const relationship1 = createMockRelationship({
        id: 'rel-1',
        name: 'Relationship 1',
      })

      const relationship2 = createMockRelationship({
        id: 'rel-2',
        name: 'Relationship 2',
      })

      const updatedRelationship1 = createMockRelationship({
        id: 'rel-1',
        name: 'Updated Relationship 1',
      })

      mockGlobalRelationships = [relationship1, relationship2]

      const { result } = renderHook(() => useRelationships())

      act(() => {
        result.current.addOrUpdateRelationship(updatedRelationship1)
      })

      expect(mockUpdateRelationships).toHaveBeenCalledWith([
        updatedRelationship1,
        relationship2,
      ])
      expect(mockUpdateRelationships).toHaveBeenCalledTimes(1)
    })

    it('should add relationship to existing list when adding new one', () => {
      const existingRelationship = createMockRelationship({
        id: 'existing-rel',
      })

      const newRelationship = createMockRelationship({
        id: 'new-rel',
      })

      mockGlobalRelationships = [existingRelationship]

      const { result } = renderHook(() => useRelationships())

      act(() => {
        result.current.addOrUpdateRelationship(newRelationship)
      })

      expect(mockUpdateRelationships).toHaveBeenCalledWith([
        existingRelationship,
        newRelationship,
      ])
      expect(mockUpdateRelationships).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteRelationship', () => {
    it('should remove relationship from global relationships', () => {
      const relationship1 = createMockRelationship({
        id: 'rel-1',
      })

      const relationship2 = createMockRelationship({
        id: 'rel-2',
      })

      mockGlobalRelationships = [relationship1, relationship2]

      const { result } = renderHook(() => useRelationships())

      act(() => {
        result.current.deleteRelationship(relationship1)
      })

      expect(mockUpdateRelationships).toHaveBeenCalledWith([relationship2])
      expect(mockUpdateRelationships).toHaveBeenCalledTimes(1)
    })

    it('should handle deleting non-existent relationship', () => {
      const existingRelationship = createMockRelationship({
        id: 'existing-rel',
      })

      const nonExistentRelationship = createMockRelationship({
        id: 'non-existent-rel',
      })

      mockGlobalRelationships = [existingRelationship]

      const { result } = renderHook(() => useRelationships())

      act(() => {
        result.current.deleteRelationship(nonExistentRelationship)
      })

      expect(mockUpdateRelationships).toHaveBeenCalledWith([existingRelationship])
      expect(mockUpdateRelationships).toHaveBeenCalledTimes(1)
    })

    it('should handle deleting from empty relationships list', () => {
      const relationshipToDelete = createMockRelationship({
        id: 'rel-to-delete',
      })

      mockGlobalRelationships = []

      const { result } = renderHook(() => useRelationships())

      act(() => {
        result.current.deleteRelationship(relationshipToDelete)
      })

      expect(mockUpdateRelationships).toHaveBeenCalledWith([])
      expect(mockUpdateRelationships).toHaveBeenCalledTimes(1)
    })

    it('should remove all matching relationships with same ID', () => {
      const relationship1 = createMockRelationship({
        id: 'rel-1',
      })

      const relationship2 = createMockRelationship({
        id: 'rel-2',
      })

      const relationship3 = createMockRelationship({
        id: 'rel-3',
      })

      mockGlobalRelationships = [relationship1, relationship2, relationship3]

      const { result } = renderHook(() => useRelationships())

      act(() => {
        result.current.deleteRelationship(relationship2)
      })

      expect(mockUpdateRelationships).toHaveBeenCalledWith([relationship1, relationship3])
      expect(mockUpdateRelationships).toHaveBeenCalledTimes(1)
    })
  })

  describe('hook return value', () => {
    it('should return all expected functions', () => {
      const { result } = renderHook(() => useRelationships())

      expect(result.current).toHaveProperty('getRelationshipsBySourceVersion')
      expect(result.current).toHaveProperty('getRelationshipsByTargetVersion')
      expect(result.current).toHaveProperty('sortRelationshipsByCategory')
      expect(result.current).toHaveProperty('addOrUpdateRelationship')
      expect(result.current).toHaveProperty('deleteRelationship')

      expect(typeof result.current.getRelationshipsBySourceVersion).toBe('function')
      expect(typeof result.current.getRelationshipsByTargetVersion).toBe('function')
      expect(typeof result.current.sortRelationshipsByCategory).toBe('function')
      expect(typeof result.current.addOrUpdateRelationship).toBe('function')
      expect(typeof result.current.deleteRelationship).toBe('function')
    })
  })

  describe('integration scenarios', () => {
    it('should handle complex relationship filtering and categorization', () => {
      const relationships = [
        createMockRelationship({
          id: 'rel-1',
          category: 'installed_on',
          relationships: [
            {
              product1VersionId: 'source-1',
              product2VersionId: 'target-1',
              relationshipId: 'rel-id-1',
            },
          ],
        }),
        createMockRelationship({
          id: 'rel-2',
          category: 'default_component_of',
          relationships: [
            {
              product1VersionId: 'source-1',
              product2VersionId: 'target-2',
              relationshipId: 'rel-id-2',
            },
          ],
        }),
        createMockRelationship({
          id: 'rel-3',
          category: 'installed_on',
          relationships: [
            {
              product1VersionId: 'source-2',
              product2VersionId: 'target-1',
              relationshipId: 'rel-id-3',
            },
          ],
        }),
      ]

      mockGlobalRelationships = relationships

      const { result } = renderHook(() => useRelationships())

      // Test filtering by source version
      const sourceFiltered = result.current.getRelationshipsBySourceVersion('source-1')
      expect(sourceFiltered).toHaveLength(2)

      // Test filtering by target version
      const targetFiltered = result.current.getRelationshipsByTargetVersion('target-1')
      expect(targetFiltered).toHaveLength(2)

      // Test categorization of filtered results
      const categorized = result.current.sortRelationshipsByCategory(sourceFiltered)
      expect(categorized.installed_on).toHaveLength(1)
      expect(categorized.default_component_of).toHaveLength(1)
    })

    it('should handle edge cases with multiple operations', () => {
      const { result } = renderHook(() => useRelationships())

      // Start with empty relationships
      mockGlobalRelationships = []

      // Add a relationship
      const newRelationship = createMockRelationship({
        id: 'test-rel',
        category: 'installed_with',
      })

      act(() => {
        result.current.addOrUpdateRelationship(newRelationship)
      })

      // Verify it was added
      expect(mockUpdateRelationships).toHaveBeenCalledWith([newRelationship])

      // Test categorization with provided relationships (not global)
      const categorized = result.current.sortRelationshipsByCategory([newRelationship])
      expect(categorized.installed_with).toHaveLength(1)

      // Delete the relationship
      act(() => {
        result.current.deleteRelationship(newRelationship)
      })

      expect(mockUpdateRelationships).toHaveBeenLastCalledWith([])
    })
  })
})
