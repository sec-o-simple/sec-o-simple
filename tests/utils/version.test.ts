import { describe, it, expect } from 'vitest'
import { compareVersions, normalizeVersion } from '../../src/utils/version'

describe('version utilities', () => {
  describe('compareVersions', () => {
    it('should return 1 when v2 is greater than v1 (semver)', () => {
      const result = compareVersions('1.0.0', '2.0.0')
      expect(result).toBe(1)
    })

    it('should return 1 when v2 equals v1 (semver)', () => {
      const result = compareVersions('1.0.0', '1.0.0')
      expect(result).toBe(1)
    })

    it('should return -1 when v2 is less than v1 (semver)', () => {
      const result = compareVersions('2.0.0', '1.0.0')
      expect(result).toBe(-1)
    })

    it('should handle patch versions correctly', () => {
      const result = compareVersions('1.0.1', '1.0.2')
      expect(result).toBe(1)
    })

    it('should handle minor versions correctly', () => {
      const result = compareVersions('1.1.0', '1.2.0')
      expect(result).toBe(1)
    })

    it('should handle pre-release versions', () => {
      const result = compareVersions('1.0.0-alpha', '1.0.0-beta')
      expect(result).toBe(1)
    })

    it('should fall back to integer parsing for non-semver strings', () => {
      const result = compareVersions('5', '10')
      expect(result).toBe(5) // parseInt('10') - parseInt('5')
    })

    it('should handle non-semver strings with different lengths', () => {
      const result = compareVersions('2', '15')
      expect(result).toBe(13) // parseInt('15') - parseInt('2')
    })

    it('should handle mixed invalid semver strings', () => {
      const result = compareVersions('invalid1', '7')
      // parseInt('invalid1') returns NaN, so NaN - 7 = NaN
      expect(result).toBeNaN()
    })

    it('should handle both versions being invalid semver', () => {
      const result = compareVersions('abc', 'def')
      // parseInt('def') - parseInt('abc') = NaN - NaN = NaN
      expect(result).toBeNaN()
    })
  })

  describe('normalizeVersion', () => {
    it('should remove build metadata after +', () => {
      const result = normalizeVersion('1.0.0+build123')
      expect(result).toBe('1.0.0')
    })

    it('should return unchanged version without build metadata', () => {
      const result = normalizeVersion('1.0.0')
      expect(result).toBe('1.0.0')
    })

    it('should handle multiple + characters correctly', () => {
      const result = normalizeVersion('1.0.0+build+extra')
      expect(result).toBe('1.0.0')
    })

    it('should handle version with only + at the end', () => {
      const result = normalizeVersion('1.0.0+')
      expect(result).toBe('1.0.0')
    })

    it('should handle empty string', () => {
      const result = normalizeVersion('')
      expect(result).toBe('')
    })

    it('should handle version starting with +', () => {
      const result = normalizeVersion('+1.0.0')
      expect(result).toBe('')
    })

    it('should handle complex build metadata', () => {
      const result = normalizeVersion('2.1.0+20230101.abc123.dirty')
      expect(result).toBe('2.1.0')
    })
  })
})
