export type TDocumentPublisher = {
  name: string
  category: TPublisherCategory
  namespace: string
  contactDetails: string
  issuingAuthority: string
}

export const publisherCategories = [
  'coordinator',
  'discoverer',
  'other',
  'translator',
  'user',
  'vendor',
] as const
export type TPublisherCategory = (typeof publisherCategories)[number]

export function getDefaultDocumentPublisher(): TDocumentPublisher {
  return {
    name: '',
    category: 'vendor',
    namespace: '',
    contactDetails: '',
    issuingAuthority: '',
  }
}
