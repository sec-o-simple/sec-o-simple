import { TNote } from '@/routes/shared/NotesList'
import { TemplateKeys } from '@/utils/template'
import i18next from 'i18next'
import { uid } from 'uid'
import { TAcknowledgment } from './tDocumentAcknowledgments'
import {
  getDefaultDocumentPublisher,
  getDocumentPublisherTemplateKeys,
  TDocumentPublisher,
} from './tDocumentPublisher'
import { TDocumentReference } from './tDocumentReference'
import {
  getDefaultGeneralDocumentInformation,
  getGeneralDocumentInformationTemplateKeys,
  TGeneralDocumentInformation,
} from './tGeneralDocumentInformation'
import { TRevisionHistoryEntry } from './tRevisionHistoryEntry'

export type TDocumentInformation = TGeneralDocumentInformation & {
  publisher: TDocumentPublisher
  revisionHistory: TRevisionHistoryEntry[]
  acknowledgments: TAcknowledgment[]
  notes: TNote[]
  aliases: string[]
  references: TDocumentReference[]
}

export function getDefaultDocumentInformation(): TDocumentInformation {
  return {
    ...getDefaultGeneralDocumentInformation(),
    publisher: getDefaultDocumentPublisher(),
    acknowledgments: [],
    notes: [],
    references: [],
    aliases: [],
    revisionHistory: [
      {
        id: uid(),
        date: new Date().toISOString(),
        number: '1',
        summary: i18next.t('document.general.revisionHistory.initialRevision'),
      },
    ],
    tlp: {
      label: undefined,
      url: undefined,
    },
  }
}

export function getDocumentInformationTemplateKeys(): TemplateKeys<TDocumentInformation> {
  return {
    ...getGeneralDocumentInformationTemplateKeys(),
    notes: 'document-information.notes',
    publisher: getDocumentPublisherTemplateKeys(),
    references: 'document-information.references',
    revisionHistory: 'document-information.revision-history',
    acknowledgments: 'document-information.acknowledgments',
    aliases: 'document-information.aliases',
  }
}
