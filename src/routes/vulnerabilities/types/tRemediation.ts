import { uid } from 'uid'

export const remediationCategories = [
  'mitigation',
  'no_fix_planned',
  'none_available',
  'vendor_fix',
  'workaround',
] as const

export type TRemediationCategory = (typeof remediationCategories)[number]

export type TRemediation = {
  id: string
  category: TRemediationCategory
  details?: string
  date?: string
  url?: string
  productIds: string[]
}

export function getDefaultRemediation(): TRemediation {
  return {
    id: uid(),
    category: 'mitigation',
    productIds: [],
  }
}
