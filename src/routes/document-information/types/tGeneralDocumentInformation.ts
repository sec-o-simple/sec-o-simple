import { TemplateKeys } from '@/utils/template'

export type TGeneralDocumentInformation = {
  title: string
  id: string
  language: string
  status: TDocumentStatus
}

export const documentStatus = ['draft', 'final', 'interim'] as const
export type TDocumentStatus = (typeof documentStatus)[number]

export function getDefaultGeneralDocumentInformation(): TGeneralDocumentInformation {
  return {
    title: '',
    id: '',
    language: 'en', // Default to English
    status: 'draft', // Default to draft status
  }
}

export function getGeneralDocumentInformationTemplateKeys(): TemplateKeys<TGeneralDocumentInformation> {
  return {
    title: 'document-information.title',
    id: 'document-information.id',
    language: 'document-information.language',
    status: 'document-information.tracking.status',
  }
}
