import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IdGenerator } from '../../../src/utils/csafImport/idGenerator'
import { uid } from 'uid'

// Mock the uid module
vi.mock('uid', () => ({
  uid: vi.fn(() => 'mock-generated-id')
}))

describe('IdGenerator', () => {
  let idGenerator: IdGenerator
  const mockUid = vi.mocked(uid)

  beforeEach(() => {
    idGenerator = new IdGenerator()
    mockUid.mockClear()
    mockUid.mockReturnValue('mock-generated-id')
  })

  describe('constructor', () => {
    it('should initialize with empty previousGeneratedIds', () => {
      const generator = new IdGenerator()
      expect(generator.previousGeneratedIds).toEqual({})
    })
  })

  describe('getId', () => {
    it('should generate new ID when no csafPid is provided', () => {
      mockUid.mockReturnValue('new-id-1')
      
      const result = idGenerator.getId()
      
      expect(result).toBe('new-id-1')
      expect(mockUid).toHaveBeenCalledOnce()
      expect(idGenerator.previousGeneratedIds).toEqual({})
    })

    it('should generate new ID when undefined csafPid is provided', () => {
      mockUid.mockReturnValue('new-id-2')
      
      const result = idGenerator.getId(undefined)
      
      expect(result).toBe('new-id-2')
      expect(mockUid).toHaveBeenCalledOnce()
      expect(idGenerator.previousGeneratedIds).toEqual({})
    })

    it('should generate new ID when empty string csafPid is provided', () => {
      mockUid.mockReturnValue('new-id-3')
      
      const result = idGenerator.getId('')
      
      expect(result).toBe('new-id-3')
      expect(mockUid).toHaveBeenCalledOnce()
      expect(idGenerator.previousGeneratedIds).toEqual({})
    })

    it('should generate and cache new ID when valid csafPid is provided for first time', () => {
      mockUid.mockReturnValue('cached-id-1')
      
      const result = idGenerator.getId('test-pid-1')
      
      expect(result).toBe('cached-id-1')
      expect(mockUid).toHaveBeenCalledOnce()
      expect(idGenerator.previousGeneratedIds).toEqual({
        'test-pid-1': 'cached-id-1'
      })
    })

    it('should return cached ID when csafPid exists in cache', () => {
      // First call to cache the ID
      mockUid.mockReturnValue('original-cached-id')
      idGenerator.getId('cached-pid')
      
      // Clear mock call count
      mockUid.mockClear()
      
      // Second call should return cached value without calling uid()
      const result = idGenerator.getId('cached-pid')
      
      expect(result).toBe('original-cached-id')
      expect(mockUid).not.toHaveBeenCalled()
      expect(idGenerator.previousGeneratedIds).toEqual({
        'cached-pid': 'original-cached-id'
      })
    })

    it('should handle multiple different csafPids correctly', () => {
      mockUid
        .mockReturnValueOnce('id-for-pid-1')
        .mockReturnValueOnce('id-for-pid-2')
        .mockReturnValueOnce('id-for-pid-3')
      
      const result1 = idGenerator.getId('pid-1')
      const result2 = idGenerator.getId('pid-2')
      const result3 = idGenerator.getId('pid-3')
      
      expect(result1).toBe('id-for-pid-1')
      expect(result2).toBe('id-for-pid-2')
      expect(result3).toBe('id-for-pid-3')
      expect(mockUid).toHaveBeenCalledTimes(3)
      expect(idGenerator.previousGeneratedIds).toEqual({
        'pid-1': 'id-for-pid-1',
        'pid-2': 'id-for-pid-2',
        'pid-3': 'id-for-pid-3'
      })
    })

    it('should return different cached IDs for different csafPids', () => {
      mockUid
        .mockReturnValueOnce('unique-id-a')
        .mockReturnValueOnce('unique-id-b')
      
      // Cache first ID
      const result1 = idGenerator.getId('first-pid')
      // Cache second ID
      const result2 = idGenerator.getId('second-pid')
      
      // Clear mock to verify cached retrieval
      mockUid.mockClear()
      
      // Retrieve cached IDs
      const cachedResult1 = idGenerator.getId('first-pid')
      const cachedResult2 = idGenerator.getId('second-pid')
      
      expect(cachedResult1).toBe('unique-id-a')
      expect(cachedResult2).toBe('unique-id-b')
      expect(mockUid).not.toHaveBeenCalled()
    })

    it('should handle mixed calls with and without csafPid', () => {
      mockUid
        .mockReturnValueOnce('uncached-id-1')
        .mockReturnValueOnce('cached-id-for-test')
        .mockReturnValueOnce('uncached-id-2')
      
      // Call without csafPid (not cached)
      const result1 = idGenerator.getId()
      // Call with csafPid (cached)
      const result2 = idGenerator.getId('test-pid')
      // Call without csafPid again (not cached)
      const result3 = idGenerator.getId()
      
      expect(result1).toBe('uncached-id-1')
      expect(result2).toBe('cached-id-for-test')
      expect(result3).toBe('uncached-id-2')
      expect(mockUid).toHaveBeenCalledTimes(3)
      expect(idGenerator.previousGeneratedIds).toEqual({
        'test-pid': 'cached-id-for-test'
      })
    })

    it('should handle whitespace-only csafPid as empty string', () => {
      mockUid.mockReturnValue('whitespace-id')
      
      // Test with whitespace-only string
      const result = idGenerator.getId('   ')
      
      expect(result).toBe('whitespace-id')
      expect(mockUid).toHaveBeenCalledOnce()
      // Should not be cached because it's treated as valid csafPid
      expect(idGenerator.previousGeneratedIds).toEqual({
        '   ': 'whitespace-id'
      })
    })

    it('should preserve cache across multiple instances', () => {
      // This tests that each instance has its own cache
      const generator1 = new IdGenerator()
      const generator2 = new IdGenerator()
      
      mockUid
        .mockReturnValueOnce('gen1-id')
        .mockReturnValueOnce('gen2-id')
      
      generator1.getId('shared-pid')
      generator2.getId('shared-pid')
      
      expect(generator1.previousGeneratedIds).toEqual({
        'shared-pid': 'gen1-id'
      })
      expect(generator2.previousGeneratedIds).toEqual({
        'shared-pid': 'gen2-id'
      })
    })

    it('should handle special characters in csafPid', () => {
      mockUid.mockReturnValue('special-char-id')
      
      const specialPid = 'pid-with-@#$%^&*()_+-=[]{}|;:,.<>?'
      const result = idGenerator.getId(specialPid)
      
      expect(result).toBe('special-char-id')
      expect(idGenerator.previousGeneratedIds[specialPid]).toBe('special-char-id')
    })

    it('should handle very long csafPid strings', () => {
      mockUid.mockReturnValue('long-string-id')
      
      const longPid = 'a'.repeat(1000)
      const result = idGenerator.getId(longPid)
      
      expect(result).toBe('long-string-id')
      expect(idGenerator.previousGeneratedIds[longPid]).toBe('long-string-id')
    })

    it('should work correctly when uid returns different values', () => {
      const mockIds = ['id-1', 'id-2', 'id-3', 'id-4', 'id-5']
      mockUid.mockImplementation(() => mockIds.shift() || 'fallback-id')
      
      const results: string[] = []
      results.push(idGenerator.getId()) // No cache
      results.push(idGenerator.getId('pid-1')) // Cache
      results.push(idGenerator.getId()) // No cache
      results.push(idGenerator.getId('pid-1')) // From cache
      results.push(idGenerator.getId('pid-2')) // New cache
      
      expect(results).toEqual(['id-1', 'id-2', 'id-3', 'id-2', 'id-4'])
      expect(idGenerator.previousGeneratedIds).toEqual({
        'pid-1': 'id-2',
        'pid-2': 'id-4'
      })
    })
  })

  describe('edge cases', () => {
    it('should handle numeric string csafPid', () => {
      mockUid.mockReturnValue('numeric-string-id')
      
      const result = idGenerator.getId('12345')
      
      expect(result).toBe('numeric-string-id')
      expect(idGenerator.previousGeneratedIds['12345']).toBe('numeric-string-id')
    })

    it('should handle boolean-like string csafPid', () => {
      mockUid.mockReturnValue('boolean-like-id')
      
      const result1 = idGenerator.getId('true')
      const result2 = idGenerator.getId('false')
      
      expect(result1).toBe('boolean-like-id')
      expect(result2).toBe('boolean-like-id')
      expect(idGenerator.previousGeneratedIds).toEqual({
        'true': 'boolean-like-id',
        'false': 'boolean-like-id'
      })
    })

    it('should maintain consistent behavior with consecutive calls', () => {
      mockUid.mockReturnValue('consistent-id')
      
      // Multiple calls with same parameters should be consistent
      const results: string[] = []
      for (let i = 0; i < 5; i++) {
        results.push(idGenerator.getId('consistent-pid'))
      }
      
      // All results should be the same (cached)
      expect(results.every(id => id === 'consistent-id')).toBe(true)
      expect(mockUid).toHaveBeenCalledOnce() // Only called once for caching
    })
  })
})
