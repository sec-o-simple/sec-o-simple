import { uid } from 'uid'

export type TDocumentReference = {
  id: string
  url: string
  summary: string
  category: TReferenceCategory
}

export const referenceCategories = ['external', 'self'] as const
export type TReferenceCategory = (typeof referenceCategories)[number]

export function getDefaultDocumentReference(): TDocumentReference {
  return {
    id: uid(),
    url: '',
    summary: '',
    category: 'external',
  }
}
