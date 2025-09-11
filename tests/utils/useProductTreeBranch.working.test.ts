import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProductTreeBranch } from '../../src/utils/useProductTreeBranch'

// Mock dependencies with minimal setup
const mockUseDocumentStore = vi.fn()
const mockUpdateProducts = vi.fn()
const mockUpdateFamilies = vi.fn()
const mockGetRelationshipsBySourceVersion = vi.fn()
const mockGetRelationshipsByTargetVersion = vi.fn()
const mockDeleteRelationship = vi.fn()

vi.mock('../../src/utils/useDocumentStore', () => ({
  default: (selector: any) => mockUseDocumentStore(selector),
}))

vi.mock('../../src/utils/useRelationships', () => ({
  useRelationships: () => ({
    getRelationshipsBySourceVersion: mockGetRelationshipsBySourceVersion,
    getRelationshipsByTargetVersion: mockGetRelationshipsByTargetVersion,
    deleteRelationship: mockDeleteRelationship,
  }),
}))

describe('useProductTreeBranch - minimal test', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // The global setup.ts mocks useProductTreeBranch but provides different structure
    // We need to unmock it to access the real function
    vi.unmock('@/utils/useProductTreeBranch')

    // Minimal mock setup
    mockUseDocumentStore.mockImplementation((selector) => {
      const mockStore = {
        products: {},
        families: {},
        relationships: {},
        updateProducts: mockUpdateProducts,
        updateFamilies: mockUpdateFamilies,
      }
      return selector(mockStore)
    })

    mockGetRelationshipsBySourceVersion.mockReturnValue([])
    mockGetRelationshipsByTargetVersion.mockReturnValue([])
  })

  it('should render hook without crashing', () => {
    const { result } = renderHook(() => useProductTreeBranch())

    expect(result.current).toBeDefined()
    expect(result.current.rootBranch).toBeDefined()
    expect(Array.isArray(result.current.rootBranch)).toBe(true)
  })

  it('should provide expected function structure', () => {
    const { result } = renderHook(() => useProductTreeBranch())

    expect(typeof result.current.findProductTreeBranch).toBe('function')
    expect(typeof result.current.addPTB).toBe('function')
    expect(typeof result.current.updatePTB).toBe('function')
    expect(typeof result.current.deletePTB).toBe('function')
  })
})
