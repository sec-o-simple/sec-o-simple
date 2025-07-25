import { useTemplate } from '@/utils/template'
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

export function useRemediationGenerator(): TRemediation {
  const { getTemplateDefaultObject } = useTemplate()
  const defaultRemediation = getTemplateDefaultObject<TRemediation>(
    'vulnerabilities.remediations',
  )

  return {
    id: uid(),
    category: defaultRemediation.category || 'mitigation',
    productIds: [],
  }
}
