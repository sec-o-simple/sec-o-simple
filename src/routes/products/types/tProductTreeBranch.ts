import { uid } from 'uid'

export const productTreeBranchCategories = [
  'vendor',
  'product_name',
  'product_version',
  'product_family',
] as const

export type TProductTreeBranchCategory =
  (typeof productTreeBranchCategories)[number]

export const productTreeBranchProductTypes = ['Software', 'Hardware'] as const

export type TProductTreeBranchProductType =
  (typeof productTreeBranchProductTypes)[number]

export type TProductIdentificationHelper = {
  hashes?: {
    file_hashes: {
      algorithm: string
      value: string
    }[]
    filename: string
  }[]
  purl?: string
  cpe?: string
  model_numbers?: string[]
  sbom_urls?: string[]
  serial_numbers?: string[]
  x_generic_uris?: {
    namespace: string
    uri: string
  }[]
}

export type TProductTreeBranch = {
  id: string
  category: TProductTreeBranchCategory
  name: string
  productName?: string
  description: string
  identificationHelper?: TProductIdentificationHelper
  subBranches: TProductTreeBranch[]
  type?: TProductTreeBranchProductType
  familyId?: string
}

export type TProductFamily = {
  id: string
  name: string
  parent: TProductFamily | null
}

export type TProductFamilyTemplate = {
  id: string
  name: string
  subFamily?: TProductFamilyTemplate
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

export function getDefaultProductFamily(): TProductFamily {
  return {
    id: uid(),
    name: '',
    parent: null,
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
