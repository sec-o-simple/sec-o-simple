import { describe, it, expect, beforeEach } from 'vitest'
import { PidGenerator } from '../../../src/utils/csafExport/pidGenerator'

describe('PidGenerator', () => {
  let pidGenerator: PidGenerator

  beforeEach(() => {
    pidGenerator = new PidGenerator()
  })

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(pidGenerator.counter).toBe(1)
      expect(pidGenerator.previousGeneratedIds).toEqual([])
      expect(pidGenerator.prefix).toBe('CSAFPID')
    })

    it('should initialize with empty previousGeneratedIds array', () => {
      expect(Array.isArray(pidGenerator.previousGeneratedIds)).toBe(true)
      expect(pidGenerator.previousGeneratedIds.length).toBe(0)
    })

    it('should create independent instances', () => {
      const generator1 = new PidGenerator()
      const generator2 = new PidGenerator()

      generator1.getPid('test1')
      
      expect(generator1.counter).toBe(2)
      expect(generator2.counter).toBe(1)
      expect(generator1.previousGeneratedIds.length).toBe(1)
      expect(generator2.previousGeneratedIds.length).toBe(0)
    })
  })

  describe('getPid', () => {
    it('should generate new PID for first call with unique productTreeBranchId', () => {
      const result = pidGenerator.getPid('branch-1')
      
      expect(result).toBe('CSAFPID-0001')
      expect(pidGenerator.counter).toBe(2)
      expect(pidGenerator.previousGeneratedIds).toHaveLength(1)
      expect(pidGenerator.previousGeneratedIds[0]).toEqual({
        ptbId: 'branch-1',
        pid: 'CSAFPID-0001'
      })
    })

    it('should return cached PID for previously seen productTreeBranchId', () => {
      const firstCall = pidGenerator.getPid('branch-1')
      const secondCall = pidGenerator.getPid('branch-1')
      
      expect(firstCall).toBe('CSAFPID-0001')
      expect(secondCall).toBe('CSAFPID-0001')
      expect(firstCall).toBe(secondCall)
      expect(pidGenerator.counter).toBe(2) // Should not increment on second call
      expect(pidGenerator.previousGeneratedIds).toHaveLength(1)
    })

    it('should generate different PIDs for different productTreeBranchIds', () => {
      const pid1 = pidGenerator.getPid('branch-1')
      const pid2 = pidGenerator.getPid('branch-2')
      const pid3 = pidGenerator.getPid('branch-3')
      
      expect(pid1).toBe('CSAFPID-0001')
      expect(pid2).toBe('CSAFPID-0002')
      expect(pid3).toBe('CSAFPID-0003')
      expect(pidGenerator.counter).toBe(4)
      expect(pidGenerator.previousGeneratedIds).toHaveLength(3)
    })

    it('should maintain cache across multiple calls with mixed new and existing IDs', () => {
      const pid1 = pidGenerator.getPid('branch-1')
      const pid2 = pidGenerator.getPid('branch-2')
      const pid1Again = pidGenerator.getPid('branch-1')
      const pid3 = pidGenerator.getPid('branch-3')
      const pid2Again = pidGenerator.getPid('branch-2')
      
      expect(pid1).toBe('CSAFPID-0001')
      expect(pid2).toBe('CSAFPID-0002')
      expect(pid1Again).toBe('CSAFPID-0001')
      expect(pid3).toBe('CSAFPID-0003')
      expect(pid2Again).toBe('CSAFPID-0002')
      
      expect(pidGenerator.counter).toBe(4) // Only incremented 3 times for new IDs
      expect(pidGenerator.previousGeneratedIds).toHaveLength(3)
    })

    it('should format counter with leading zeros (4 digits)', () => {
      expect(pidGenerator.getPid('test-1')).toBe('CSAFPID-0001')
      expect(pidGenerator.getPid('test-2')).toBe('CSAFPID-0002')
      expect(pidGenerator.getPid('test-3')).toBe('CSAFPID-0003')
      
      // Generate many to test padding
      for (let i = 4; i <= 10; i++) {
        pidGenerator.getPid(`test-${i}`)
      }
      expect(pidGenerator.getPid('test-11')).toBe('CSAFPID-0011')
      
      // Test larger numbers
      pidGenerator.counter = 99
      expect(pidGenerator.getPid('test-99')).toBe('CSAFPID-0099')
      
      pidGenerator.counter = 100
      expect(pidGenerator.getPid('test-100')).toBe('CSAFPID-0100')
      
      pidGenerator.counter = 1000
      expect(pidGenerator.getPid('test-1000')).toBe('CSAFPID-1000')
      
      pidGenerator.counter = 9999
      expect(pidGenerator.getPid('test-9999')).toBe('CSAFPID-9999')
    })

    it('should handle counter beyond 4 digits', () => {
      pidGenerator.counter = 10000
      const result = pidGenerator.getPid('test-large')
      
      expect(result).toBe('CSAFPID-10000')
      expect(pidGenerator.counter).toBe(10001)
    })

    it('should handle empty string productTreeBranchId', () => {
      const result = pidGenerator.getPid('')
      
      expect(result).toBe('CSAFPID-0001')
      expect(pidGenerator.previousGeneratedIds).toHaveLength(1)
      expect(pidGenerator.previousGeneratedIds[0].ptbId).toBe('')
    })

    it('should handle special characters in productTreeBranchId', () => {
      const specialIds = [
        'branch-with-dashes',
        'branch_with_underscores',
        'branch.with.dots',
        'branch with spaces',
        'branch@with#special$chars%',
        '123-numeric-start',
        'UPPERCASE-BRANCH',
      ]
      
      const results = specialIds.map(id => pidGenerator.getPid(id))
      
      expect(results).toEqual([
        'CSAFPID-0001',
        'CSAFPID-0002',
        'CSAFPID-0003',
        'CSAFPID-0004',
        'CSAFPID-0005',
        'CSAFPID-0006',
        'CSAFPID-0007',
      ])
      
      expect(pidGenerator.previousGeneratedIds).toHaveLength(7)
    })

    it('should handle very long productTreeBranchId', () => {
      const longId = 'a'.repeat(1000)
      const result = pidGenerator.getPid(longId)
      
      expect(result).toBe('CSAFPID-0001')
      expect(pidGenerator.previousGeneratedIds[0].ptbId).toBe(longId)
    })

    it('should treat similar but different IDs as separate', () => {
      const pid1 = pidGenerator.getPid('branch-1')
      const pid2 = pidGenerator.getPid('branch-1 ')
      const pid3 = pidGenerator.getPid(' branch-1')
      const pid4 = pidGenerator.getPid('Branch-1')
      
      expect(pid1).toBe('CSAFPID-0001')
      expect(pid2).toBe('CSAFPID-0002')
      expect(pid3).toBe('CSAFPID-0003')
      expect(pid4).toBe('CSAFPID-0004')
      
      expect(pidGenerator.previousGeneratedIds).toHaveLength(4)
    })
  })

  describe('previousGeneratedIds array', () => {
    it('should maintain correct structure in previousGeneratedIds', () => {
      pidGenerator.getPid('test-1')
      pidGenerator.getPid('test-2')
      
      expect(pidGenerator.previousGeneratedIds).toHaveLength(2)
      
      pidGenerator.previousGeneratedIds.forEach((entry, index) => {
        expect(entry).toHaveProperty('ptbId')
        expect(entry).toHaveProperty('pid')
        expect(typeof entry.ptbId).toBe('string')
        expect(typeof entry.pid).toBe('string')
        expect(entry.pid).toMatch(/^CSAFPID-\d{4,}$/)
      })
    })

    it('should find existing entries correctly', () => {
      const id1 = 'first-branch'
      const id2 = 'second-branch'
      
      pidGenerator.getPid(id1)
      pidGenerator.getPid(id2)
      pidGenerator.getPid(id1) // Should find existing
      
      expect(pidGenerator.previousGeneratedIds).toHaveLength(2)
      
      const found = pidGenerator.previousGeneratedIds.find(x => x.ptbId === id1)
      expect(found).toBeDefined()
      expect(found!.pid).toBe('CSAFPID-0001')
    })

    it('should preserve insertion order', () => {
      const ids = ['third', 'first', 'second', 'fourth']
      ids.forEach(id => pidGenerator.getPid(id))
      
      const storedIds = pidGenerator.previousGeneratedIds.map(x => x.ptbId)
      expect(storedIds).toEqual(['third', 'first', 'second', 'fourth'])
    })
  })

  describe('edge cases and integration', () => {
    it('should work correctly with rapid sequential calls', () => {
      const results = []
      for (let i = 0; i < 100; i++) {
        results.push(pidGenerator.getPid(`branch-${i}`))
      }
      
      expect(results).toHaveLength(100)
      expect(pidGenerator.counter).toBe(101)
      expect(pidGenerator.previousGeneratedIds).toHaveLength(100)
      
      // Check uniqueness
      const uniqueResults = [...new Set(results)]
      expect(uniqueResults).toHaveLength(100)
      
      // Check format
      results.forEach((result, index) => {
        const expectedNumber = String(index + 1).padStart(4, '0')
        expect(result).toBe(`CSAFPID-${expectedNumber}`)
      })
    })

    it('should handle interleaved new and cached requests', () => {
      // Create some initial entries
      pidGenerator.getPid('a')
      pidGenerator.getPid('b')
      pidGenerator.getPid('c')
      
      expect(pidGenerator.counter).toBe(4)
      expect(pidGenerator.previousGeneratedIds).toHaveLength(3)
      
      // Mix of cached and new
      expect(pidGenerator.getPid('b')).toBe('CSAFPID-0002') // cached
      expect(pidGenerator.getPid('d')).toBe('CSAFPID-0004') // new
      expect(pidGenerator.getPid('a')).toBe('CSAFPID-0001') // cached
      expect(pidGenerator.getPid('e')).toBe('CSAFPID-0005') // new
      expect(pidGenerator.getPid('c')).toBe('CSAFPID-0003') // cached
      
      expect(pidGenerator.counter).toBe(6)
      expect(pidGenerator.previousGeneratedIds).toHaveLength(5)
    })

    it('should maintain state consistency', () => {
      const testIds = ['test1', 'test2', 'test1', 'test3', 'test2', 'test4']
      const results = testIds.map(id => pidGenerator.getPid(id))
      
      expect(results).toEqual([
        'CSAFPID-0001', // test1 - new
        'CSAFPID-0002', // test2 - new  
        'CSAFPID-0001', // test1 - cached
        'CSAFPID-0003', // test3 - new
        'CSAFPID-0002', // test2 - cached
        'CSAFPID-0004', // test4 - new
      ])
      
      expect(pidGenerator.counter).toBe(5) // 4 unique IDs generated
      expect(pidGenerator.previousGeneratedIds).toHaveLength(4)
      
      // Verify each unique ID is stored once
      const uniqueStoredIds = pidGenerator.previousGeneratedIds.map(x => x.ptbId)
      expect(uniqueStoredIds.sort()).toEqual(['test1', 'test2', 'test3', 'test4'])
    })
  })

  describe('prefix property', () => {
    it('should use the correct prefix in generated PIDs', () => {
      const result = pidGenerator.getPid('test')
      expect(result.startsWith('CSAFPID-')).toBe(true)
      expect(result).toMatch(/^CSAFPID-\d{4}$/)
    })

    it('should allow prefix modification', () => {
      pidGenerator.prefix = 'CUSTOM'
      const result = pidGenerator.getPid('test')
      
      expect(result).toBe('CUSTOM-0001')
      expect(result.startsWith('CUSTOM-')).toBe(true)
    })

    it('should handle empty prefix', () => {
      pidGenerator.prefix = ''
      const result = pidGenerator.getPid('test')
      
      expect(result).toBe('-0001')
    })

    it('should handle special character prefix', () => {
      pidGenerator.prefix = 'TEST@PREFIX#123'
      const result = pidGenerator.getPid('test')
      
      expect(result).toBe('TEST@PREFIX#123-0001')
    })
  })
})
