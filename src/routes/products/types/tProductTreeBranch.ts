import { useTranslation } from 'react-i18next'
import { uid } from 'uid'

export const productTreeBranchCategories = [
  'vendor',
  'product_name',
  'product_version',
] as const

export type TProductTreeBranchCategory =
  (typeof productTreeBranchCategories)[number]

export const productTreeBranchProductTypes = ['Software', 'Hardware'] as const

export type TProductTreeBranchProductType =
  (typeof productTreeBranchProductTypes)[number]

export type TProductTreeBranch = {
  id: string
  category: TProductTreeBranchCategory
  name: string
  description: string
  subBranches: TProductTreeBranch[]
  type?: TProductTreeBranchProductType
}

export type TProductTreeBranchWithParents = TProductTreeBranch & {
  parent: TProductTreeBranchWithParents | null
}

export function getDefaultProductTreeBranch(
  category: TProductTreeBranchCategory,
): TProductTreeBranch {
  return {
    id: uid(),
    category: category,
    name: '',
    description: '',
    subBranches: [] as TProductTreeBranch[],
    type: category === 'product_name' ? 'Software' : undefined,
  }
}

export function getPTBName(branch?: TProductTreeBranch) {
  if (!branch) {
    return 'unknown product tree branch'
  }
  if (branch.name) {
    return branch.name
  }

  return null
}

export function getFullPTBName(branch: TProductTreeBranchWithParents) {
  let nameParts = []
  let current: TProductTreeBranchWithParents | null = branch
  while (current !== null) {
    nameParts.push(getPTBName(current))
    current = current.parent
  }
  return nameParts.reverse().join(' ')
}
