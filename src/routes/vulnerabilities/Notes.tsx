import { useListState } from '@/utils/useListState'
import { TVulnerability } from './Vulnerabilities'
import { NoteGenerator, NotesList, TNote } from '../shared/NotesList'
import { useEffect } from 'react'

export default function Notes({
  vulnerability,
  onChange,
}: {
  vulnerability: TVulnerability
  onChange: (vulnerability: TVulnerability) => void
}) {
  const notesListState = useListState<TNote>({
    initialData: vulnerability.notes,
    generator: NoteGenerator,
  })

  useEffect(
    () => onChange({ ...vulnerability, notes: notesListState.data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notesListState.data],
  )

  return <NotesList notesListState={notesListState} />
}
