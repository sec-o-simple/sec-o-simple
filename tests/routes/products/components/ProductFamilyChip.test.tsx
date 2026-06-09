import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

const mockFamilies = [
  {
    id: 'family-1',
    name: 'Root Family',
    parent: null,
    subFamilies: [],
  },
  {
    id: 'family-2',
    name: 'Child Family',
    parent: { id: 'family-1', name: 'Root Family', parent: null, subFamilies: [] },
    subFamilies: [],
  },
]

vi.mock('../../../../src/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: () => ({
    families: mockFamilies,
  }),
}))

vi.mock('@heroui/react', () => ({
  Chip: ({ children, onClick }: any) => (
    <span data-testid="chip" onClick={onClick}>
      {children}
    </span>
  ),
}))

vi.mock('../../../../src/routes/products/ProductFamily', () => ({
  getFamilyChain: (family: any) => {
    const chain = []
    let current = family
    while (current) {
      chain.unshift(current)
      current = current.parent
    }
    return chain.length > 0 ? chain : [family]
  },
}))

import { ProductFamilyChip } from '../../../../src/routes/products/components/ProductFamilyChip'
import type { TProductTreeBranch } from '../../../../src/routes/products/types/tProductTreeBranch'

const baseProduct: TProductTreeBranch = {
  id: 'prod-1',
  category: 'product_name',
  name: 'My Product',
  description: '',
  subBranches: [],
}

describe('ProductFamilyChip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when product has no familyId', () => {
    const { container } = render(<ProductFamilyChip product={baseProduct} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when family is not found in families list', () => {
    const product = { ...baseProduct, familyId: 'non-existent-family' }
    const { container } = render(<ProductFamilyChip product={product} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a chip with family name when family is found (single level)', () => {
    const product = { ...baseProduct, familyId: 'family-1' }
    render(<ProductFamilyChip product={product} />)
    expect(screen.getByTestId('chip')).toBeInTheDocument()
    expect(screen.getByTestId('chip')).toHaveTextContent('Root Family')
  })

  it('renders chip with full chain for nested family', () => {
    const product = { ...baseProduct, familyId: 'family-2' }
    render(<ProductFamilyChip product={product} />)
    const chip = screen.getByTestId('chip')
    expect(chip).toBeInTheDocument()
    expect(chip.textContent).toContain('Root Family')
    expect(chip.textContent).toContain('Child Family')
  })

  it('navigates to families page when chip is clicked', () => {
    const product = { ...baseProduct, familyId: 'family-1' }
    render(<ProductFamilyChip product={product} />)
    fireEvent.click(screen.getByTestId('chip'))
    expect(mockNavigate).toHaveBeenCalledWith('/products/families/')
  })
})
