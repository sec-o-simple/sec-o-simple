import { uid } from 'uid'

export const productTreeBranchCategories = [
  'vendor',
  'product_name',
  'product_version',
] as const

export type TProductTreeBranchCategory =
  (typeof productTreeBranchCategories)[number]

export type TProductTreeBranch = {
  id: string
  category: TProductTreeBranchCategory
  name: string
  description: string
  subBranches: TProductTreeBranch[]
  type?: string
}

export function getDefaultProductTreeBranch(
  category: TProductTreeBranchCategory,
) {
  return {
    id: uid(),
    category: category,
    name: '',
    description: '',
    subBranches: [] as TProductTreeBranch[],
  }
}
