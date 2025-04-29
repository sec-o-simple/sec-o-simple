import {
  TProductTreeBranch,
  TProductTreeBranchCategory,
} from '@/routes/products/types/tProductTreeBranch'
import useDocumentStore from './useDocumentStore'

export function useProductTreeBranch() {
  const products = Object.values(useDocumentStore((store) => store.products))
  const updateProducts = useDocumentStore((store) => store.updateProducts)

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

  const getFilteredPTBs = (
    filter: (ptb: TProductTreeBranch) => boolean,
    startingBranches?: TProductTreeBranch[],
  ): TProductTreeBranch[] => {
    const matchingBranches: TProductTreeBranch[] = []
    for (const ptb of startingBranches ?? products) {
      if (filter(ptb)) {
        matchingBranches.push({
          ...ptb,
          subBranches: getFilteredPTBs(filter, ptb.subBranches) ?? [],
        })
      }
    }
    return matchingBranches
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

  const addPTB = (ptb: TProductTreeBranch) => {
    const newProducts = [...products, ptb]
    updateProducts(newProducts)
  }

  const updatePTB = (ptb: TProductTreeBranch) => {
    const updateBranch = (branch: TProductTreeBranch): TProductTreeBranch =>
      branch.id === ptb.id
        ? { ...branch, ...ptb }
        : { ...branch, subBranches: branch.subBranches.map(updateBranch) }
    const newProducts = products.map(updateBranch)
    updateProducts(newProducts)
  }

  const deletePTB = (id: string) => {
    updateProducts(getFilteredPTBs((ptb) => ptb.id !== id))
  }

  return {
    rootBranch: products,
    findProductTreeBranch,
    getFilteredPTBs,
    getPTBsByCategory,
    addPTB,
    updatePTB,
    deletePTB,
  }
}
