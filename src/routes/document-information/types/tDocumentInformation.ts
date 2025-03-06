import { TNote } from '@/routes/shared/NotesList'
import {
  getDefaultGeneralDocumentInformation,
  TGeneralDocumentInformation,
} from './tGeneralDocumentInformation'
import {
  getDefaultDocumentPublisher,
  TDocumentPublisher,
} from './tDocumentPublisher'
import { TDocumentReference } from './tDocumentReference'

export type TDocumentInformation = TGeneralDocumentInformation &
  TDocumentPublisher & {
    notes: TNote[]
    references: TDocumentReference[]
  }

export function getDefaultDocumentInformation() {
  return {
    ...getDefaultGeneralDocumentInformation(),
    ...getDefaultDocumentPublisher(),
    notes: [],
    references: [],
  }
}
