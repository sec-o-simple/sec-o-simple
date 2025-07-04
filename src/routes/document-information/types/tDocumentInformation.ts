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
import { TRevisionHistoryEntry } from './tRevisionHistoryEntry'
import { uid } from 'uid'

export type TDocumentInformation = TGeneralDocumentInformation & {
  notes: TNote[]
  publisher: TDocumentPublisher
  references: TDocumentReference[]
  revisionHistory: TRevisionHistoryEntry[]
}

export function getDefaultDocumentInformation(): TDocumentInformation {
  return {
    ...getDefaultGeneralDocumentInformation(),
    notes: [],
    publisher: getDefaultDocumentPublisher(),
    references: [],
    revisionHistory: [
      {
        id: uid(),
        date: new Date().toISOString(),
        number: '1',
        summary: 'Initial revision',
      },
    ],
  }
}

export function getDocumentInformationTemplateKeys(): TemplateKeys<TDocumentInformation> {
  return {
    ...getGeneralDocumentInformationTemplateKeys(),
    notes: 'document-information.notes',
    publisher: getDocumentPublisherTemplateKeys(),
    references: 'document-information.references',
    revisionHistory: 'document-information.revision-history',
  }
}
