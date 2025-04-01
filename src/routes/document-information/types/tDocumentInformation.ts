import { TNote } from '@/routes/shared/NotesList'
import {
  getDefaultGeneralDocumentInformation,
  getGeneralDocumentInformationTemplateKeys,
  TGeneralDocumentInformation,
} from './tGeneralDocumentInformation'
import {
  getDefaultDocumentPublisher,
  getDocumentPublisherTemplateKeys,
  TDocumentPublisher,
} from './tDocumentPublisher'
import { TDocumentReference } from './tDocumentReference'
import { TemplateKeys } from '@/utils/template'

export type TDocumentInformation = TGeneralDocumentInformation & {
  notes: TNote[]
  publisher: TDocumentPublisher
  references: TDocumentReference[]
}

export function getDefaultDocumentInformation(): TDocumentInformation {
  return {
    ...getDefaultGeneralDocumentInformation(),
    notes: [],
    publisher: getDefaultDocumentPublisher(),
    references: [],
  }
}

export function getDocumentInformationTemplateKeys(): TemplateKeys<TDocumentInformation> {
  return {
    ...getGeneralDocumentInformationTemplateKeys(),
    notes: 'document-information.notes',
    publisher: getDocumentPublisherTemplateKeys(),
    references: 'document-information.references',
  }
}
