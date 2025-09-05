import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock all heavy dependencies BEFORE importing
vi.mock('@/components/forms/AddItemButton', () => ({
  default: ({ children }: any) => <button>{children}</button>,
}))

vi.mock('@/components/WizardStep', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/utils/useDocumentStoreUpdater', () => ({
  default: vi.fn(),
}))

vi.mock('@/utils/useListState', () => ({
  useListState: vi.fn(),
}))

vi.mock('@/utils/useProductTreeBranch', () => ({
  useProductTreeBranch: vi.fn(),
}))

vi.mock('@/utils/validation/usePageVisit', () => ({
  default: vi.fn(),
}))

vi.mock('@heroui/modal', () => ({
  Modal: ({ children }: any) => <div>{children}</div>,
  useDisclosure: vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('../../../src/routes/products/components/InfoCard', () => ({
  default: ({ title }: any) => <div>{title}</div>,
}))

vi.mock('../../../src/routes/products/components/PFEditForm', () => ({
  PFCreateEditForm: () => <div>Form</div>,
}))

// Import the utility functions to test
import {
  getFamilyChain,
  getFamilyChainString,
  ProductFamilyChains,
} from '../../../src/routes/products/ProductFamily'
import type { TProductFamily } from '../../../src/routes/products/types/tProductTreeBranch'

describe('ProductFamily Utility Functions - Fixed', () => {
  describe('getFamilyChain', () => {
    it('should return single item array for root family', () => {
      const rootFamily: TProductFamily = {
        id: 'root',
        name: 'Root Family',
        parent: null,
      }

      const chain = getFamilyChain(rootFamily)
      expect(chain).toEqual([rootFamily])
      expect(chain).toHaveLength(1)
    })

    it('should return full chain for nested family', () => {
      const rootFamily: TProductFamily = {
        id: 'root',
        name: 'Root Family',
        parent: null,
      }

      const childFamily: TProductFamily = {
        id: 'child',
        name: 'Child Family',
        parent: rootFamily,
      }

      const grandchildFamily: TProductFamily = {
        id: 'grandchild',
        name: 'Grandchild Family',
        parent: childFamily,
      }

      const chain = getFamilyChain(grandchildFamily)
      expect(chain).toEqual([rootFamily, childFamily, grandchildFamily])
      expect(chain).toHaveLength(3)
    })

    it('should handle family with null parent', () => {
      const family: TProductFamily = {
        id: 'test',
        name: 'Test Family',
        parent: null,
      }

      const chain = getFamilyChain(family)
      expect(chain).toEqual([family])
    })
  })

  describe('getFamilyChainString', () => {
    it('should return single name for root family', () => {
      const rootFamily: TProductFamily = {
        id: 'root',
        name: 'Root Family',
        parent: null,
      }

      const chainString = getFamilyChainString(rootFamily)
      expect(chainString).toBe('Root Family')
    })

    it('should join names with separator', () => {
      const rootFamily: TProductFamily = {
        id: 'root',
        name: 'Root Family',
        parent: null,
      }

      const childFamily: TProductFamily = {
        id: 'child',
        name: 'Child Family',
        parent: rootFamily,
      }

      const chainString = getFamilyChainString(childFamily)
      expect(chainString).toBe('Root Family / Child Family')
    })

    it('should handle three-level chain', () => {
      const level1: TProductFamily = {
        id: 'level1',
        name: 'A',
        parent: null,
      }

      const level2: TProductFamily = {
        id: 'level2',
        name: 'B',
        parent: level1,
      }

      const level3: TProductFamily = {
        id: 'level3',
        name: 'C',
        parent: level2,
      }

      const chainString = getFamilyChainString(level3)
      expect(chainString).toBe('A / B / C')
    })
  })
})

describe('ProductFamilyChains Component - Fixed', () => {
  it('should render item name', () => {
    const item: TProductFamily = {
      id: 'test-id',
      name: 'Test Family',
      parent: null,
    }

    render(<ProductFamilyChains item={item} />)
    expect(screen.getByText('Test Family')).toBeInTheDocument()
  })

  it('should render parent chain for nested family', () => {
    const rootFamily: TProductFamily = {
      id: 'root',
      name: 'Root Family',
      parent: null,
    }

    const childFamily: TProductFamily = {
      id: 'child',
      name: 'Child Family',
      parent: rootFamily,
    }

    render(<ProductFamilyChains item={childFamily} />)

    expect(screen.getByText('Root Family /')).toBeInTheDocument()
    expect(screen.getByText('Child Family')).toBeInTheDocument()
  })

  it('should apply correct CSS classes', () => {
    const rootFamily: TProductFamily = {
      id: 'root',
      name: 'Root Family',
      parent: null,
    }

    const childFamily: TProductFamily = {
      id: 'child',
      name: 'Child Family',
      parent: rootFamily,
    }

    render(<ProductFamilyChains item={childFamily} />)

    const parentElement = screen.getByText('Root Family /')
    expect(parentElement).toHaveClass('text-zinc-400')

    const childElement = screen.getByText('Child Family')
    expect(childElement).toHaveClass('font-bold')
  })

  it('should handle three-level hierarchy', () => {
    const level1: TProductFamily = {
      id: 'level1',
      name: 'Level 1',
      parent: null,
    }

    const level2: TProductFamily = {
      id: 'level2',
      name: 'Level 2',
      parent: level1,
    }

    const level3: TProductFamily = {
      id: 'level3',
      name: 'Level 3',
      parent: level2,
    }

    render(<ProductFamilyChains item={level3} />)

    expect(screen.getByText('Level 1 /')).toBeInTheDocument()
    expect(screen.getByText('Level 2 /')).toBeInTheDocument()
    expect(screen.getByText('Level 3')).toBeInTheDocument()

    // Final item should be bold
    const finalElement = screen.getByText('Level 3')
    expect(finalElement).toHaveClass('font-bold')
  })
})
