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
): TParsedProductTreeBranch[] {
  return branches.map((branch) => {
    const pbObj: TParsedProductTreeBranch = {
      category: branch.category,
      name: branch.name,
    }

    if (branch.subBranches.length > 0) {
      pbObj['branches'] = parseProductTreeBranches(branch.subBranches)
    } else {
      pbObj['product'] = {
        name: branch.name,
        product_id: branch.id,
        product_identification_helper: branch.identificationHelper,
      }
    }

    return pbObj
  })
}
