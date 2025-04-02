import { TemplateKeys } from '@/utils/template'

export type TGeneralDocumentInformation = {
  title: string
  id: string
  language: string
}

export function getDefaultGeneralDocumentInformation(): TGeneralDocumentInformation {
  return {
    title: '',
    id: '',
    language: '',
  }
}

export function getGeneralDocumentInformationTemplateKeys(): TemplateKeys<TGeneralDocumentInformation> {
  return {
    title: 'document-information.title',
    id: 'document-information.id',
    language: 'document-information.language',
  }
}
