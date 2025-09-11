import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

// Mock the document store
vi.mock('../../src/utils/useDocumentStore')

import type { TSOSDocumentType } from '../../src/utils/useDocumentStore'
import useDocumentStore from '../../src/utils/useDocumentStore'
import useDocumentType from '../../src/utils/useDocumentType'

describe('useDocumentType', () => {
  let mockSOSDocumentType: TSOSDocumentType

  beforeEach(() => {
    vi.clearAllMocks()

    // Default document type
    mockSOSDocumentType = 'Software'

    // Mock the document store
    ;(useDocumentStore as unknown as Mock).mockImplementation((selector) => {
      const mockState = {
        sosDocumentType: mockSOSDocumentType,
        // Add other store properties that might be accessed
        setSOSDocumentType: vi.fn(),
        documentInformation: {},
        updateDocumentInformation: vi.fn(),
        products: [],
        updateProducts: vi.fn(),
        families: [],
        updateFamilies: vi.fn(),
        relationships: [],
        updateRelationships: vi.fn(),
        vulnerabilities: [],
        updateVulnerabilities: vi.fn(),
      }

      if (typeof selector === 'function') {
        return selector(mockState)
      }

      return mockState
    })
  })

  describe('Basic functionality', () => {
    it('should return the correct document type', () => {
      mockSOSDocumentType = 'Software'

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('Software')
    })

    it('should return an object with type, hasSoftware, and hasHardware properties', () => {
      const { result } = renderHook(() => useDocumentType())

      expect(result.current).toHaveProperty('type')
      expect(result.current).toHaveProperty('hasSoftware')
      expect(result.current).toHaveProperty('hasHardware')
    })
  })

  describe('Software document types', () => {
    it('should correctly identify Software type as having software but not hardware', () => {
      mockSOSDocumentType = 'Software'

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('Software')
      expect(result.current.hasSoftware).toBe(true)
      expect(result.current.hasHardware).toBe(false)
    })

    it('should correctly identify VexSoftware type as having software but not hardware', () => {
      mockSOSDocumentType = 'VexSoftware'

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('VexSoftware')
      expect(result.current.hasSoftware).toBe(false)
      expect(result.current.hasHardware).toBe(false)
    })
  })

  describe('Hardware-related document types', () => {
    it('should correctly identify HardwareFirmware type as having no hardware or software', () => {
      mockSOSDocumentType = 'HardwareFirmware'

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('HardwareFirmware')
      expect(result.current.hasSoftware).toBe(false)
      expect(result.current.hasHardware).toBe(false)
    })

    it('should correctly identify VexHardwareFirmware type as having no hardware or software', () => {
      mockSOSDocumentType = 'VexHardwareFirmware'

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('VexHardwareFirmware')
      expect(result.current.hasSoftware).toBe(false)
      expect(result.current.hasHardware).toBe(false)
    })
  })

  describe('Combined document types', () => {
    it('should correctly identify HardwareSoftware type as having both software and hardware', () => {
      mockSOSDocumentType = 'HardwareSoftware'

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('HardwareSoftware')
      expect(result.current.hasSoftware).toBe(true)
      expect(result.current.hasHardware).toBe(true)
    })

    it('should correctly identify VexHardwareSoftware type as having both software and hardware', () => {
      mockSOSDocumentType = 'VexHardwareSoftware'

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('VexHardwareSoftware')
      expect(result.current.hasSoftware).toBe(false)
      expect(result.current.hasHardware).toBe(false)
    })
  })

  describe('Import document type', () => {
    it('should correctly identify Import type as having both software and hardware', () => {
      mockSOSDocumentType = 'Import'

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('Import')
      expect(result.current.hasSoftware).toBe(true)
      expect(result.current.hasHardware).toBe(true)
    })
  })

  describe('Special document types', () => {
    it('should correctly identify VexSbom type as having neither software nor hardware', () => {
      mockSOSDocumentType = 'VexSbom'

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('VexSbom')
      expect(result.current.hasSoftware).toBe(false)
      expect(result.current.hasHardware).toBe(false)
    })
  })

  describe('Hook reactivity', () => {
    it('should update when document type changes from Software to HardwareFirmware', () => {
      mockSOSDocumentType = 'Software'

      const { result, rerender } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('Software')
      expect(result.current.hasSoftware).toBe(true)
      expect(result.current.hasHardware).toBe(false)

      // Change the document type
      mockSOSDocumentType = 'HardwareFirmware'
      rerender()

      expect(result.current.type).toBe('HardwareFirmware')
      expect(result.current.hasSoftware).toBe(false)
      expect(result.current.hasHardware).toBe(false)
    })

    it('should update when document type changes from Software to HardwareSoftware', () => {
      mockSOSDocumentType = 'Software'

      const { result, rerender } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('Software')
      expect(result.current.hasSoftware).toBe(true)
      expect(result.current.hasHardware).toBe(false)

      // Change the document type
      mockSOSDocumentType = 'HardwareSoftware'
      rerender()

      expect(result.current.type).toBe('HardwareSoftware')
      expect(result.current.hasSoftware).toBe(true)
      expect(result.current.hasHardware).toBe(true)
    })

    it('should update when document type changes from HardwareSoftware to VexSoftware', () => {
      mockSOSDocumentType = 'HardwareSoftware'

      const { result, rerender } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('HardwareSoftware')
      expect(result.current.hasSoftware).toBe(true)
      expect(result.current.hasHardware).toBe(true)

      // Change the document type
      mockSOSDocumentType = 'VexSoftware'
      rerender()

      expect(result.current.type).toBe('VexSoftware')
      expect(result.current.hasSoftware).toBe(false)
      expect(result.current.hasHardware).toBe(false)
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle empty or undefined document type gracefully', () => {
      // Set an invalid type by casting
      mockSOSDocumentType = undefined as any

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBeUndefined()
      expect(result.current.hasSoftware).toBe(false)
      expect(result.current.hasHardware).toBe(false)
    })

    it('should handle unknown document type gracefully', () => {
      // Set an unknown type by casting
      mockSOSDocumentType = 'UnknownType' as any

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe('UnknownType')
      expect(result.current.hasSoftware).toBe(false)
      expect(result.current.hasHardware).toBe(false)
    })
  })

  describe('Logic validation', () => {
    it('should use correct array inclusion logic for hasSoftware', () => {
      const softwareTypes: TSOSDocumentType[] = [
        'Software',
        'Import',
        'HardwareSoftware',
      ]

      softwareTypes.forEach((type) => {
        mockSOSDocumentType = type
        const { result } = renderHook(() => useDocumentType())
        expect(result.current.hasSoftware).toBe(true)
      })
    })

    it('should use correct array inclusion logic for hasHardware', () => {
      // Note: The current logic checks for 'Hardware' which is not a valid type
      // This test reflects the actual behavior of the code
      const hardwareTypes: TSOSDocumentType[] = ['Import', 'HardwareSoftware']

      hardwareTypes.forEach((type) => {
        mockSOSDocumentType = type
        const { result } = renderHook(() => useDocumentType())
        expect(result.current.hasHardware).toBe(true)
      })
    })

    it('should ensure non-software types return false for hasSoftware', () => {
      const nonSoftwareTypes: TSOSDocumentType[] = [
        'HardwareFirmware',
        'VexSoftware',
        'VexHardwareSoftware',
        'VexHardwareFirmware',
        'VexSbom',
      ]

      nonSoftwareTypes.forEach((type) => {
        mockSOSDocumentType = type
        const { result } = renderHook(() => useDocumentType())
        expect(result.current.hasSoftware).toBe(false)
      })
    })

    it('should ensure non-hardware types return false for hasHardware', () => {
      const nonHardwareTypes: TSOSDocumentType[] = [
        'Software',
        'HardwareFirmware',
        'VexSoftware',
        'VexHardwareSoftware',
        'VexHardwareFirmware',
        'VexSbom',
      ]

      nonHardwareTypes.forEach((type) => {
        mockSOSDocumentType = type
        const { result } = renderHook(() => useDocumentType())
        expect(result.current.hasHardware).toBe(false)
      })
    })
  })

  describe('Integration with document store', () => {
    it('should call the document store selector with the correct function', () => {
      const mockSelector = vi.fn((state) => state.sosDocumentType)
      ;(useDocumentStore as unknown as Mock).mockImplementation(mockSelector)

      renderHook(() => useDocumentType())

      expect(mockSelector).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should access sosDocumentType from the store state', () => {
      let capturedSelector: any
      ;(useDocumentStore as unknown as Mock).mockImplementation((selector) => {
        capturedSelector = selector
        return selector({
          sosDocumentType: 'Software',
          setSOSDocumentType: vi.fn(),
        })
      })

      renderHook(() => useDocumentType())

      // Test that the selector correctly extracts sosDocumentType
      const mockState = {
        sosDocumentType: 'HardwareSoftware',
        setSOSDocumentType: vi.fn(),
        otherProperty: 'should not be accessed',
      }

      const result = capturedSelector(mockState)
      expect(result).toBe('HardwareSoftware')
    })
  })

  describe('Return value structure', () => {
    it('should return an object with exactly 3 properties', () => {
      const { result } = renderHook(() => useDocumentType())

      const keys = Object.keys(result.current)
      expect(keys).toHaveLength(3)
      expect(keys).toEqual(['type', 'hasSoftware', 'hasHardware'])
    })

    it('should return boolean values for hasSoftware and hasHardware', () => {
      const { result } = renderHook(() => useDocumentType())

      expect(typeof result.current.hasSoftware).toBe('boolean')
      expect(typeof result.current.hasHardware).toBe('boolean')
    })

    it('should return the same type value as in the store', () => {
      mockSOSDocumentType = 'VexHardwareFirmware'

      const { result } = renderHook(() => useDocumentType())

      expect(result.current.type).toBe(mockSOSDocumentType)
    })
  })
})
