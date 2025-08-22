import { TemplateKeys } from '@/utils/template'

export type TGeneralDocumentInformation = {
  title: string
  id: string
  lang: string
  status: TDocumentStatus
  tlp?: {
    label?: TTLPLevel
    url?: string
  }
}

export const documentStatus = ['draft', 'final', 'interim'] as const
export type TDocumentStatus = (typeof documentStatus)[number]

export const tlpLevel = ['GREEN', 'AMBER', 'RED', 'WHITE'] as const
export type TTLPLevel = (typeof tlpLevel)[number]

export function getDefaultGeneralDocumentInformation(): TGeneralDocumentInformation {
  return {
    title: '',
    id: '',
    lang: 'en', // Default to English
    status: 'draft', // Default to draft status
  }
}

export function getGeneralDocumentInformationTemplateKeys(): TemplateKeys<TGeneralDocumentInformation> {
  return {
    title: 'document-information.title',
    id: 'document-information.id',
    lang: 'document-information.language',
    status: 'document-information.tracking.status',
    tlp: {
      label: 'document-information.tlp.label',
      url: 'document-information.tlp.url',
    },
  }
}
