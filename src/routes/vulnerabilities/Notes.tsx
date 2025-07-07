import VSplit from '@/components/forms/VSplit'
import { useListState } from '@/utils/useListState'
import { useListValidation } from '@/utils/validation/useListValidation'
import { Alert } from '@heroui/react'
import { useEffect } from 'react'
import { NoteGenerator, NotesList, TNote } from '../shared/NotesList'
import { NotesTemplates } from '../shared/NotesTemplates'
import { TVulnerability } from './types/tVulnerability'

export default function Notes({
  vulnerability,
  vulnerabilityIndex,
  onChange,
  isTouched = false,
}: {
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  onChange: (vulnerability: TVulnerability) => void
  isTouched?: boolean
}) {
  const notesListState = useListState<TNote>({
    initialData: vulnerability.notes,
    generator: NoteGenerator,
  })

  const listValidation = useListValidation(
    `/vulnerabilities/${vulnerabilityIndex}/notes`,
    notesListState.data,
  )

  useEffect(
    () => onChange({ ...vulnerability, notes: notesListState.data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notesListState.data],
  )

  return (
    <>
      {(isTouched || listValidation.isTouched) && listValidation.hasErrors && (
        <Alert color="danger">
          {listValidation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}

      <VSplit>
        <NotesTemplates notesListState={notesListState} />

        <NotesList
          isTouched={isTouched}
          notesListState={notesListState}
          csafPath={`/vulnerabilities/${vulnerabilityIndex}/notes`}
        />
      </VSplit>
    </>
  )
}
