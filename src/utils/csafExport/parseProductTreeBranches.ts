import {
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
  getFullProductName: (id: string) => string,
): TParsedProductTreeBranch[] {
  return branches.map((branch) => {
    const pbObj: TParsedProductTreeBranch = {
      category: branch.category,
      name: branch.name,
    }

    if (branch.subBranches.length > 0) {
      pbObj['branches'] = parseProductTreeBranches(
        branch.subBranches,
        getFullProductName,
      )
    } else {
      pbObj['product'] = {
        name: branch.productName ?? getFullProductName(branch.id),
        product_id: branch.id,
        product_identification_helper: branch.identificationHelper,
      }
    }

    return pbObj
  })
}
