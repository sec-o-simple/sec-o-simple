import {
  TProductTreeBranch,
  TProductTreeBranchCategory,
  TProductTreeBranchWithParents,
} from '@/routes/products/types/tProductTreeBranch'
import useDocumentStore from './useDocumentStore'
import { useRelationships } from './useRelationships'

export type TSelectableFullProductName = {
  category: string
  full_product_name: {
    name: string
    product_id: string
  }
}

export function useProductTreeBranch() {
  const products = Object.values(useDocumentStore((store) => store.products))
  const relationships = Object.values(
    useDocumentStore((store) => store.relationships),
  )
  const updateProducts = useDocumentStore((store) => store.updateProducts)

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

  const getFullProductName = (versionId: string): string => {
    const version = findProductTreeBranchWithParents(versionId)
    const product = version?.parent
    const vendor = product?.parent
    return `${vendor?.name ?? ''} ${product?.name ?? ''} ${version?.name ?? ''}`
  }

  const getRelationshipFullProductName = (
    sourceVersionId: string,
    targetVersionId: string,
    category: string,
  ): string => {
    const name = [
      getFullProductName(sourceVersionId),
      category.replaceAll('_', ' ').toLowerCase(),
      getFullProductName(targetVersionId),
    ].join(' ')

    return name
  }

  const getSelectableRefs = (): TSelectableFullProductName[] => {
    // this function returns all ProductTreeBranches that can be referenced e.g. in Vulnerablility Scores
    // later product groups might be added to this
    const ptbs: TSelectableFullProductName[] = [
      ...getPTBsByCategory('product_version').map((v) => {
        const fullProductName = getFullProductName(v.id)
        return {
          category: v.category,
          full_product_name: {
            name: fullProductName,
            product_id: v.id,
          },
        }
      }),
      ...relationships.flatMap((relationship) => {
        return (
          relationship.relationships?.flatMap((rel) => {
            return {
              category: relationship.category,
              full_product_name: {
                name: getRelationshipFullProductName(
                  rel.product1VersionId,
                  rel.product2VersionId,
                  relationship.category,
                ),
                product_id: rel.relationshipId,
              },
            }
          }) ?? []
        )
      }),
    ]

    return ptbs.sort((a, b) =>
      a.full_product_name.name.localeCompare(b.full_product_name.name),
    ) as TSelectableFullProductName[]
  }

  const getGroupedSelectableRefs = (): {
    [key: string]: TSelectableFullProductName[]
  } => {
    const groups: { [key: string]: TSelectableFullProductName[] } = {}
    const selectableRefs = getSelectableRefs()

    selectableRefs.map((ref) => {
      const existingGroup = groups[ref.category]
      if (existingGroup) {
        existingGroup.push(ref)
      } else {
        groups[ref.category] = [ref]
      }
    })

    return groups
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
    getFullProductName,
    getRelationshipFullProductName,
    getFilteredPTBs,
    getPTBsByCategory,
    getSelectableRefs,
    getGroupedSelectableRefs,
    addPTB,
    updatePTB,
    deletePTB,
  }
}
