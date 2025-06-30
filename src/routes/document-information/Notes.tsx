import WizardStep from '@/components/WizardStep'
import { useListState } from '@/utils/useListState'
import { NoteGenerator, NotesList, TNote } from '../shared/NotesList'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { TDocumentInformation } from './types/tDocumentInformation'
import { Alert } from '@heroui/react'
import { useListValidation } from '@/utils/useListValidation'
import usePageVisit from '@/utils/usePageVisit'
import { useTranslation } from 'react-i18next'

export default function Notes() {
  const { t } = useTranslation()
  const notesListState = useListState<TNote>({
    generator: NoteGenerator,
  })

  useDocumentStoreUpdater<TDocumentInformation>({
    localState: [notesListState.data, () => ({ notes: notesListState.data })],
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
      progress={1.25}
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
