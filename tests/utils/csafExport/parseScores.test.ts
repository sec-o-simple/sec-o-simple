import { describe, it, expect, vi } from 'vitest'
import parseScores from '../../../src/utils/csafExport/parseScores'
import type { TVulnerabilityScore } from '../../../src/routes/vulnerabilities/types/tVulnerabilityScore'

vi.mock('cvss4', () => ({
  calculateBaseScore: vi.fn((vectorString: string) => {
    if (vectorString === 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H') {
      return 9.8
    }
    throw new Error('Invalid vector string')
  }),
  calculateQualScore: vi.fn((score: number) => {
    if (score >= 9.0) return 'critical'
    if (score >= 7.0) return 'high'
    return 'medium'
  }),
}))

const makeScore = (overrides: Partial<TVulnerabilityScore> = {}): TVulnerabilityScore => ({
  id: 'score-1',
  cvssVersion: '3.1',
  vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
  productIds: [],
  applyAllKnownAffectedProducts: false,
  ...overrides,
})

describe('parseScores', () => {
  it('returns undefined when scores array is empty', () => {
    expect(parseScores([])).toBeUndefined()
  })

  it('returns undefined when no v3 scores exist', () => {
    const score = makeScore({ cvssVersion: '4.0' as any })
    expect(parseScores([score])).toBeUndefined()
  })

  it('parses a valid v3.1 score with calculated baseScore and baseSeverity', () => {
    const score = makeScore()
    const result = parseScores([score])

    expect(result).toHaveLength(1)
    expect(result![0].cvss_v3.baseScore).toBe(9.8)
    expect(result![0].cvss_v3.baseSeverity).toBe('CRITICAL')
    expect(result![0].cvss_v3.version).toBe('3.1')
    expect(result![0].cvss_v3.vectorString).toBe(score.vectorString)
  })

  it('parses a valid v3.0 score', () => {
    const score = makeScore({ cvssVersion: '3.0' })
    const result = parseScores([score])
    expect(result).toHaveLength(1)
    expect(result![0].cvss_v3.version).toBe('3.0')
  })

  it('returns default baseScore 0 and empty baseSeverity when vector string is invalid', () => {
    const score = makeScore({ vectorString: 'INVALID' })
    const result = parseScores([score])
    expect(result).toHaveLength(1)
    expect(result![0].cvss_v3.baseScore).toBe(0)
    expect(result![0].cvss_v3.baseSeverity).toBe('')
  })

  it('uses knownAffectedProductIds when applyAllKnownAffectedProducts is true', () => {
    const score = makeScore({ applyAllKnownAffectedProducts: true })
    const result = parseScores([score], ['prod-1', 'prod-2'])
    expect(result![0].products).toEqual(['prod-1', 'prod-2'])
  })

  it('uses productIds when applyAllKnownAffectedProducts is false', () => {
    const score = makeScore({ productIds: ['prod-3'], applyAllKnownAffectedProducts: false })
    const result = parseScores([score], ['prod-1'])
    expect(result![0].products).toEqual(['prod-3'])
  })

  it('falls back to applyAll when productIds is empty', () => {
    const score = makeScore({ productIds: [], applyAllKnownAffectedProducts: undefined })
    const result = parseScores([score], ['prod-x'])
    // productIds.length === 0 → applyAllKnownAffectedProducts is true → uses knownAffectedProductIds
    expect(result![0].products).toEqual(['prod-x'])
  })

  it('deduplicates products', () => {
    const score = makeScore({ productIds: ['a', 'a', 'b'], applyAllKnownAffectedProducts: false })
    const result = parseScores([score])
    expect(result![0].products).toEqual(['a', 'b'])
  })
})
