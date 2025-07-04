import { TemplateKeys } from '@/utils/template'

export type TDocumentPublisher = {
  name: string
  category: TPublisherCategory
  namespace: string
  contactDetails: string
  issuingAuthority?: string
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
    issuingAuthority: undefined,
  }
}

export function getDocumentPublisherTemplateKeys(): TemplateKeys<TDocumentPublisher> {
  return {
    name: 'document-information.publisher.name',
    category: 'document-information.publisher.category',
    namespace: 'document-information.publisher.namespace',
    contactDetails: 'document-information.publisher.contactDetails',
    issuingAuthority: 'document-information.publisher.issuingAuthority',
  }
}
