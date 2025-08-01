import {
  TProductTreeBranch,
  TProductTreeBranchCategory,
  TProductTreeBranchWithParents,
} from '@/routes/products/types/tProductTreeBranch'
import { useTranslation } from 'react-i18next'
import useDocumentStore from './useDocumentStore'
import useProductDatabase from './useProductDatabase'
import { useRelationships } from './useRelationships'

export function useProductTreeBranch() {
  const { t } = useTranslation()
  const products = Object.values(useDocumentStore((store) => store.products))
  const updateProducts = useDocumentStore((store) => store.updateProducts)
  const { enabled: pdbEnabled } = useProductDatabase()
  const {
    getRelationshipsBySourceVersion,
    getRelationshipsByTargetVersion,
    deleteRelationship,
  } = useRelationships()

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

  const findProductTreeBranchWithParents = (
    id: string,
    parent?: TProductTreeBranchWithParents,
    startingBranches?: TProductTreeBranch[],
  ): TProductTreeBranchWithParents | undefined => {
    for (const product of startingBranches ?? products) {
      const currentProduct = { ...product, parent: parent ?? null }
      if (product.id === id) {
        return currentProduct
      }
      const subTreeSearch = findProductTreeBranchWithParents(
        id,
        currentProduct,
        product.subBranches,
      )
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

  const getPTBName = (
    branch: TProductTreeBranch,
  ): {
    isReadonly?: boolean
    name?: string
  } => {
    let isNameReadonly = !pdbEnabled && !!branch.identificationHelper
    let name = isNameReadonly ? branch.productName : branch.name

    if (!branch) {
      return { name: 'unknown product tree branch', isReadonly: true }
    }

    if (!name) {
      name = t('untitled.product_version')
    }

    return {
      name: name,
      isReadonly: isNameReadonly,
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

  const getSelectablePTBs = (): TProductTreeBranch[] => {
    // this function returns all ProductTreeBranches that can be referenced e.g. in Vulnerablility Scores
    // later product groups might be added to this
    return getPTBsByCategory('product_version')
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

    return newProducts
  }

  const deletePTB = (id: string) => {
    updateProducts(getFilteredPTBs((ptb) => ptb.id !== id))

    const deleteAllRelationships = (versionId: string) => {
      const relationships = getRelationshipsBySourceVersion(versionId)
      relationships.forEach((relationship) => deleteRelationship(relationship))

      const targetRelationships = getRelationshipsByTargetVersion(versionId)
      targetRelationships.forEach((relationship) =>
        deleteRelationship(relationship),
      )
    }

    const branch = findProductTreeBranch(id)
    if (!branch) {
      console.warn(`ProductTreeBranch with id ${id} not found`)
      return
    }

    const category = branch.category
    if (category === 'vendor') {
      branch.subBranches.forEach((product) => {
        product.subBranches.forEach((version) => {
          deleteAllRelationships(version.id)
        })
      })
    } else if (category === 'product_name') {
      branch.subBranches.forEach((version) => {
        deleteAllRelationships(version.id)
      })
    } else if (category === 'product_version') {
      deleteAllRelationships(id)
    }
  }

  return {
    rootBranch: products,
    findProductTreeBranch,
    findProductTreeBranchWithParents,
    getFilteredPTBs,
    getPTBsByCategory,
    getSelectablePTBs,
    getPTBName,
    addPTB,
    updatePTB,
    deletePTB,
  }
}
