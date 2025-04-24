import {
  TProductTreeBranch,
  TProductTreeBranchCategory,
} from '@/routes/products/types/tProductTreeBranch'
import useDocumentStore from './useDocumentStore'

export function useProductTreeBranch() {
  const products = Object.values(useDocumentStore((store) => store.products))

  const findProductTreeBranch = (
    id: string,
    startingBranches?: TProductTreeBranch[],
  ): TProductTreeBranch | undefined => {
    for (const product of startingBranches ?? products) {
      if (product.id === id) {
        return product
      }
      const subTreeSearch = findProductTreeBranch(id, product.subBranches)
      if (subTreeSearch) {
        return subTreeSearch
      }
    }
  }

  const getPTBsByCategory = (
    category: TProductTreeBranchCategory,
    startingBranches?: TProductTreeBranch[],
  ): TProductTreeBranch[] => {
    const matchingBranches = []
    for (const ptb of startingBranches ?? products) {
      if (ptb.category === category) {
        matchingBranches.push(ptb)
      }
      const subTreeMatches = getPTBsByCategory(category, ptb.subBranches)
      subTreeMatches.forEach((ptb) => matchingBranches.push(ptb))
    }
    return matchingBranches
  }

  return { rootBranch: products, findProductTreeBranch, getPTBsByCategory }
}
