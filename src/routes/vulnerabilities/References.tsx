import VSplit from '@/components/forms/VSplit'
import {
  TDocumentReference,
  getDefaultDocumentReference,
} from '@/routes/document-information/types/tDocumentReference'
import { ReferencesList } from '@/routes/shared/ReferencesList'
import { useListState } from '@/utils/useListState'
import { useListValidation } from '@/utils/validation/useListValidation'
import { Alert } from '@heroui/react'
import { useEffect } from 'react'
import { TVulnerability } from './types/tVulnerability'

export default function References({
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
  const referencesListState = useListState<TDocumentReference>({
    initialData: vulnerability.references,
    generator: getDefaultDocumentReference,
  })

  useEffect(
    () => onChange({ ...vulnerability, references: referencesListState.data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [referencesListState.data],
  )

  const listValidation = useListValidation(
    `/vulnerabilities/${vulnerabilityIndex}/references`,
    referencesListState.data,
  )

  return (
    <VSplit className="rounded-lg border border-gray-200 p-4">
      {(isTouched || listValidation.isTouched) && listValidation.hasErrors && (
        <Alert color="danger">
          {listValidation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}

      <ReferencesList
        referencesListState={referencesListState}
        csafPath={`/vulnerabilities/${vulnerabilityIndex}/references`}
      />
    </VSplit>
  )
}
