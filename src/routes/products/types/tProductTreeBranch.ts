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

export function getPTBName(branch: TProductTreeBranch) {
  if (branch.name) {
    return branch.name
  }
  switch (branch.category) {
    case 'vendor':
      return 'Untitled Vendor'
    case 'product_name':
      return 'Untitled Product'
    case 'product_version':
      return 'Untitled Version'
    default:
      return 'Untitled'
  }
}
