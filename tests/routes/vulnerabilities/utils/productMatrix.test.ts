import { describe, expect, it } from 'vitest'
import { TVulnerability } from '../../../../src/routes/vulnerabilities/types/tVulnerability'
import {
  applyStatusToProductVersion,
  applyStatusToVulnerability,
  getMatrixCellStatus,
  hasVulnerabilityMatrixAssignment,
  updateVulnerabilityProductStatus,
} from '../../../../src/routes/vulnerabilities/utils/productMatrix'

function createVulnerability(overrides: Partial<TVulnerability> = {}): TVulnerability {
  return {
    id: 'v-1',
    title: 'Vuln 1',
    notes: [],
    references: [],
    products: [],
    flags: [],
    remediations: [],
    scores: [],
    ...overrides,
  }
}

describe('productMatrix utils', () => {
  it('returns empty status when no product entry exists', () => {
    const vulnerability = createVulnerability()

    expect(getMatrixCellStatus(vulnerability, 'product-a')).toBe('')
  })

  it('returns the latest matrix status entry for a product', () => {
    const vulnerability = createVulnerability({
      products: [
        { id: 'p-1', productId: 'product-a', status: 'known_affected' },
        { id: 'p-2', productId: 'product-a', status: 'first_fixed' },
        { id: 'p-3', productId: 'product-a', status: 'fixed' },
      ],
    })

    expect(getMatrixCellStatus(vulnerability, 'product-a')).toBe('fixed')
  })

  it('replaces previous product status entries when setting a new status', () => {
    const vulnerability = createVulnerability({
      products: [
        { id: 'p-1', productId: 'product-a', status: 'known_affected' },
        { id: 'p-2', productId: 'product-b', status: 'fixed' },
      ],
    })

    const updated = updateVulnerabilityProductStatus(
      vulnerability,
      'product-a',
      'known_not_affected',
      () => 'generated-id',
    )

    expect(updated.products).toEqual([
      { id: 'p-2', productId: 'product-b', status: 'fixed' },
      {
        id: 'generated-id',
        productId: 'product-a',
        status: 'known_not_affected',
      },
    ])
  })

  it('removes a product status entry when status is cleared', () => {
    const vulnerability = createVulnerability({
      products: [
        { id: 'p-1', productId: 'product-a', status: 'known_affected' },
        { id: 'p-2', productId: 'product-b', status: 'fixed' },
      ],
    })

    const updated = updateVulnerabilityProductStatus(vulnerability, 'product-a', '')

    expect(updated.products).toEqual([
      { id: 'p-2', productId: 'product-b', status: 'fixed' },
    ])
  })

  it('applies the same status to one product across all vulnerabilities', () => {
    const vulnerabilities = [
      createVulnerability({
        id: 'v-1',
        products: [{ id: 'p-1', productId: 'product-a', status: 'fixed' }],
      }),
      createVulnerability({
        id: 'v-2',
        products: [{ id: 'p-2', productId: 'product-a', status: 'known_affected' }],
      }),
    ]

    const updated = applyStatusToProductVersion(
      vulnerabilities,
      'product-a',
      'under_investigation',
      () => 'shared-id',
    )

    expect(updated.map((v) => getMatrixCellStatus(v, 'product-a'))).toEqual([
      'under_investigation',
      'under_investigation',
    ])
  })

  it('applies one status to all products in one vulnerability', () => {
    const vulnerability = createVulnerability({
      products: [
        { id: 'p-1', productId: 'product-a', status: 'known_affected' },
        { id: 'p-2', productId: 'product-b', status: 'fixed' },
      ],
    })

    const updated = applyStatusToVulnerability(
      vulnerability,
      ['product-a', 'product-b', 'product-c'],
      'fixed',
      () => 'generated-id',
    )

    expect(getMatrixCellStatus(updated, 'product-a')).toBe('fixed')
    expect(getMatrixCellStatus(updated, 'product-b')).toBe('fixed')
    expect(getMatrixCellStatus(updated, 'product-c')).toBe('fixed')
  })

  it('returns matrix assignment availability per vulnerability', () => {
    const withMatrixStatus = createVulnerability({
      products: [{ id: 'p-1', productId: 'product-a', status: 'fixed' }],
    })
    const withoutMatrixStatus = createVulnerability({
      products: [{ id: 'p-2', productId: 'product-a', status: 'first_fixed' }],
    })

    expect(hasVulnerabilityMatrixAssignment(withMatrixStatus)).toBe(true)
    expect(hasVulnerabilityMatrixAssignment(withoutMatrixStatus)).toBe(false)
  })
})
