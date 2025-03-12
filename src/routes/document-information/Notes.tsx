import WizardStep from '@/components/WizardStep'
import { useListState } from '@/utils/useListState'
import { NoteGenerator, NotesList, TNote } from '../shared/NotesList'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { TDocumentInformation } from './types/tDocumentInformation'

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

  return (
    <WizardStep
      title="Document Information - Notes"
      progress={1.25}
      onBack={'/document-information/general'}
      onContinue={'/document-information/publisher'}
    >
      <NotesList notesListState={notesListState} />
    </WizardStep>
  )
}
