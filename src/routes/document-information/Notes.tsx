import WizardStep from '@/components/WizardStep'
import { useListState } from '@/utils/useListState'
import { NoteGenerator, NotesList, TNote } from '../shared/NotesList'

export default function Notes() {
  const notesListState = useListState<TNote>({
    generator: NoteGenerator,
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
