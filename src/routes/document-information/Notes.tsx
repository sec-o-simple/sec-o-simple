import WizardStep from '@/components/WizardStep'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useListValidation } from '@/utils/validation/useListValidation'
import usePageVisit from '@/utils/validation/usePageVisit'
import { Alert } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { NoteGenerator, NotesList, TNote } from '../shared/NotesList'
import { TDocumentInformation } from './types/tDocumentInformation'

export default function Notes() {
  const { t } = useTranslation()
  const notesListState = useListState<TNote>({
    generator: NoteGenerator,
  })

  useDocumentStoreUpdater<TDocumentInformation>({
    localState: [
      notesListState.data,
      () => ({
        notes: notesListState.data,
      }),
    ],
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: (initialData) => notesListState.setData(initialData.notes),
  })

  const hasVisitedPage = usePageVisit()
  const listValidation = useListValidation(
    `/document/notes`,
    notesListState.data,
  )

  return (
    <WizardStep
      title={t('nav.documentInformation.notes')}
      progress={1.2}
      onBack={'/document-information/general'}
      onContinue={'/document-information/publisher'}
    >
      {(hasVisitedPage || listValidation.isTouched) &&
        listValidation.hasErrors && (
          <Alert color="danger">
            {listValidation.errorMessages.map((m) => (
              <p key={m.path}>{m.message}</p>
            ))}
          </Alert>
        )}
      <NotesList
        notesListState={notesListState}
        csafPath="/document/notes"
        isTouched={hasVisitedPage}
      />
    </WizardStep>
  )
}
