import WizardStep from '@/components/WizardStep'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useListValidation } from '@/utils/validation/useListValidation'
import usePageVisit from '@/utils/validation/usePageVisit'
import { Alert } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { NotesList, TNote, useNoteGenerator } from '../shared/NotesList'
import { NotesTemplates } from '../shared/NotesTemplates'
import { TDocumentInformation } from './types/tDocumentInformation'

export default function Notes() {
  const { t } = useTranslation()

  const noteGenerator = useNoteGenerator()
  const notesListState = useListState<TNote>({
    generator: noteGenerator,
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

      <NotesTemplates
        notesListState={notesListState}
        templatePath="document-information.notes_templates"
      />

      <NotesList
        notesListState={notesListState}
        csafPath="/document/notes"
        isTouched={hasVisitedPage}
      />
    </WizardStep>
  )
}
