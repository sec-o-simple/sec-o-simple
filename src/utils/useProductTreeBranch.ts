import {
  TProductFamily,
  TProductTreeBranch,
  TProductTreeBranchCategory,
  TProductTreeBranchWithParents,
} from '@/routes/products/types/tProductTreeBranch'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const products = Object.values(useDocumentStore((store) => store.products))
  const families = Object.values(useDocumentStore((store) => store.families))
  const relationships = Object.values(
    useDocumentStore((store) => store.relationships),
  )
  const updateProducts = useDocumentStore((store) => store.updateProducts)
  const updateFamilies = useDocumentStore((store) => store.updateFamilies)
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
    let isNameReadonly = false
    let name = branch.name

    if (
      branch.category === 'product_version' &&
      branch.productName !== undefined &&
      getFullProductName(branch.id) !== branch.productName
    ) {
      isNameReadonly = true
      name = branch.productName
    } else if (!!branch.identificationHelper) {
      isNameReadonly = true
      name = getFullProductName(branch.id)
    }

    if (!name) {
      name = t('untitled.product_version')
    }

    return {
      name,
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

  const getFullProductName = (versionId: string): string => {
    const ptb = findProductTreeBranchWithParents(versionId)

    let nameParts = []
    let current: TProductTreeBranchWithParents | null = ptb || null
    while (current !== null) {
      nameParts.push(current.name)
      current = current.parent
    }

    return nameParts.reverse().join(' ')
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

  const addProductFamily = (family: TProductFamily) => {
    const newFamilies = [...families, family]
    updateFamilies(newFamilies)
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

  const updateFamily = (family: TProductFamily) => {
    const newFamilies = families.map((f) => (f.id === family.id ? family : f))
    updateFamilies(newFamilies)
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

  const deleteFamily = (id: string) => {
    updateFamilies(families.filter((fam) => fam.id !== id))
  }

  return {
    rootBranch: products,
    families,
    findProductTreeBranch,
    findProductTreeBranchWithParents,
    getFullProductName,
    getRelationshipFullProductName,
    getFilteredPTBs,
    getPTBsByCategory,
    getPTBName,
    getSelectableRefs,
    getGroupedSelectableRefs,
    addPTB,
    addProductFamily,
    updatePTB,
    updateFamily,
    deletePTB,
    deleteFamily,
  }
}
