import WizardStep from '@/components/WizardStep'
import ComponentList from '@/components/forms/ComponentList'
import { Input, Textarea } from '@/components/forms/Input'
import VSplit from '@/components/forms/VSplit'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { TDocumentInformation } from './types/tDocumentInformation'
import {
  TDocumentReference,
  getDefaultDocumentReference,
} from './types/tDocumentReference'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { useTranslation } from 'react-i18next'
import usePageVisit from '@/utils/validation/usePageVisit'
import { useListValidation } from '@/utils/validation/useListValidation'
import { Alert } from '@heroui/react'
import StatusIndicator from '@/components/StatusIndicator'
import { usePrefixValidation } from '@/utils/validation/usePrefixValidation'

export default function References() {
  const referencesListState = useListState<TDocumentReference>({
    generator: getDefaultDocumentReference,
  })

  const { t } = useTranslation()
  usePageVisit()

  const listValidation = useListValidation(
    `/document/references`,
    referencesListState.data,
  )

  useDocumentStoreUpdater<TDocumentInformation>({
    localState: [
      referencesListState.data,
      () => ({ references: referencesListState.data }),
    ],
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: (initialData) => referencesListState.setData(initialData.references),
  })

  return (
    <WizardStep
      title={t('nav.documentInformation.references')}
      progress={1.6}
      onBack={'/document-information/publisher'}
      onContinue="/document-information/acknowledgments"
    >
      {listValidation.isTouched && listValidation.hasErrors && (
        <Alert color="danger">
          {listValidation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}
      <ComponentList
        listState={referencesListState}
        title="summary"
        itemLabel={t('ref.reference')}
        startContent={StartContent}
        content={(reference, index) => (
          <ReferenceForm
            referenceIndex={index}
            reference={reference}
            onChange={referencesListState.updateDataEntry}
          />
        )}
      />
    </WizardStep>
  )
}

function StartContent({ index }: { index: number }) {
  const { hasErrors } = usePrefixValidation(`/document/references/${index}`)

  return <StatusIndicator hasErrors={hasErrors} hasVisited={true} />
}

function ReferenceForm({
  reference,
  referenceIndex,
  onChange,
}: {
  reference: TDocumentReference
  referenceIndex: number
  onChange: (reference: TDocumentReference) => void
}) {
  const { t } = useTranslation()

  return (
    <VSplit>
      <Textarea
        label={t('ref.summary')}
        csafPath={`/document/references/${referenceIndex}/summary`}
        value={reference.summary}
        onValueChange={(newValue) =>
          onChange({ ...reference, summary: newValue })
        }
        autoFocus={true}
        isDisabled={checkReadOnly(reference, 'summary')}
        placeholder={getPlaceholder(reference, 'summary')}
      />
      <Input
        label={t('ref.url')}
        csafPath={`/document/references/${referenceIndex}/url`}
        value={reference.url}
        onValueChange={(newValue) => onChange({ ...reference, url: newValue })}
        isDisabled={checkReadOnly(reference, 'url')}
        placeholder={getPlaceholder(reference, 'url')}
      />
    </VSplit>
  )
}
