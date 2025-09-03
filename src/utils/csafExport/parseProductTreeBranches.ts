import { getFamilyChain } from '@/routes/products/ProductFamily'
import {
  TProductFamily,
  TProductIdentificationHelper,
  TProductTreeBranch,
  TProductTreeBranchCategory,
} from '@/routes/products/types/tProductTreeBranch'

export type TParsedProductTreeBranch = {
  category: TProductTreeBranchCategory
  name: string
  product?: {
    name: string
    product_id: string
    product_identification_helper?: TProductIdentificationHelper
  }
  branches?: TParsedProductTreeBranch[]
}

export function parseProductTreeBranches(
  branches: TProductTreeBranch[],
  families: TProductFamily[],
  getFullProductName: (id: string) => string,
): TParsedProductTreeBranch[] {
  // Helper function to find a family by ID
  const findFamilyById = (familyId: string): TProductFamily | null => {
    return families.find((family) => family.id === familyId) || null
  }

  // Helper function to build family tree branches from a family chain
  const buildFamilyBranches = (
    familyChain: TProductFamily[],
    productBranch: TParsedProductTreeBranch,
  ): TParsedProductTreeBranch => {
    // Start from the deepest family and work up
    let result = productBranch

    for (let i = familyChain.length - 1; i >= 0; i--) {
      const family = familyChain[i]
      result = {
        category: 'product_family',
        name: family.name,
        branches: [result],
      }
    }

    return result
  }

  return branches.map((branch) => {
    const pbObj: TParsedProductTreeBranch = {
      category: branch.category,
      name: branch.name,
    }

    // Handle sub-branches recursively if they exist
    if (branch.subBranches.length > 0) {
      pbObj['branches'] = parseProductTreeBranches(
        branch.subBranches,
        families,
        getFullProductName,
      )
    }

    // Only add product property for product_version branches (leaf nodes in the hierarchy)
    // The hierarchy is: vendor → product-family (optional, can be nested) → product → version
    if (branch.category === 'product_version') {
      pbObj['product'] = {
        name: branch.productName ?? getFullProductName(branch.id),
        product_id: branch.id,
        product_identification_helper: branch.identificationHelper,
      }
    }

    // If this is a product_name branch with a familyId, we need to integrate the family hierarchy
    if (branch.category === 'product_name' && branch.familyId) {
      const family = findFamilyById(branch.familyId)

      if (family) {
        const familyChain = getFamilyChain(family)

        if (familyChain.length > 0) {
          // Build the family tree structure with the product at the end
          const productBranch: TParsedProductTreeBranch = {
            category: branch.category,
            name: branch.name,
            branches: pbObj.branches, // Include product versions
          }

          // Wrap the product in the family hierarchy
          return buildFamilyBranches(familyChain, productBranch)
        }
      }
    }

    return pbObj
  })
}
