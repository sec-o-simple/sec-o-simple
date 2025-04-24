import WizardStep from '@/components/WizardStep'
import { useListState } from '@/utils/useListState'
import { NoteGenerator, NotesList, TNote } from '../shared/NotesList'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { TDocumentInformation } from './types/tDocumentInformation'
import { Alert } from '@heroui/react'
import { useListValidation } from '@/utils/useListValidation'

export default function Notes() {
  const notesListState = useListState<TNote>({
    generator: NoteGenerator,
  })

  useDocumentStoreUpdater<TDocumentInformation>({
    localState: [notesListState.data, () => ({ notes: notesListState.data })],
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: (initialData) => notesListState.setData(initialData.notes),
  })

  const listValidation = useListValidation(`/document/notes`, notesListState.data)

  return (
    <WizardStep
      title="Document Information - Notes"
      progress={1.25}
      onBack={'/document-information/general'}
      onContinue={'/document-information/publisher'}
    >
      {listValidation.isTouched && listValidation.hasErrors && (
        <Alert color="danger">
          {listValidation.errorMessages.map((m) => (
            <p key={m.path}>
              {m.message}
            </p>
          ))}
        </Alert>
      )}
      <NotesList notesListState={notesListState} csafPath="/document/notes" />
    </WizardStep>
  )
}
