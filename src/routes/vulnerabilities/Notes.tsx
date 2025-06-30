import { useListState } from '@/utils/useListState'
import { NoteGenerator, NotesList, TNote } from '../shared/NotesList'
import { useEffect } from 'react'
import { TVulnerability } from './types/tVulnerability'
import { Alert } from '@heroui/react'
import { useListValidation } from '@/utils/useListValidation'
import { useTranslation } from 'react-i18next'

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
      <NotesList
        isTouched={isTouched}
        notesListState={notesListState}
        csafPath={`/vulnerabilities/${vulnerabilityIndex}/notes`}
      />
    </>
  )
}
