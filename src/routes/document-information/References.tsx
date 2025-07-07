import StatusIndicator from '@/components/StatusIndicator'
import WizardStep from '@/components/WizardStep'
import ComponentList from '@/components/forms/ComponentList'
import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import VSplit from '@/components/forms/VSplit'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useListValidation } from '@/utils/validation/useListValidation'
import usePageVisit from '@/utils/validation/usePageVisit'
import { usePrefixValidation } from '@/utils/validation/usePrefixValidation'
import { Alert, SelectItem } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { TDocumentInformation } from './types/tDocumentInformation'
import {
  TDocumentReference,
  TReferenceCategory,
  getDefaultDocumentReference,
} from './types/tDocumentReference'

export default function References() {
  const referencesListState = useListState<TDocumentReference>({
    generator: getDefaultDocumentReference,
  })

  const { t } = useTranslation()
  usePageVisit()

  useDocumentStoreUpdater<TDocumentInformation>({
    localState: [
      referencesListState.data,
      () => ({
        references: referencesListState.data,
      }),
    ],
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: (initialData) => referencesListState.setData(initialData.references),
  })

  const listValidation = useListValidation(
    `/document/references`,
    referencesListState.data,
  )

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
      <Select
        label={t('ref.category')}
        csafPath="/document/publisher/category"
        selectedKeys={[reference.category]}
        isRequired
        onSelectionChange={(selected) => {
          if (!selected.anchorKey) return

          onChange({
            ...reference,
            category: [...selected][0] as TReferenceCategory,
          })
        }}
        isDisabled={checkReadOnly(reference, 'category')}
      >
        {['external', 'self'].map((key) => (
          <SelectItem key={key}>{t(`ref.categories.${key}`)}</SelectItem>
        ))}
      </Select>
      <Textarea
        label={t('ref.summary')}
        csafPath={`/document/references/${referenceIndex}/summary`}
        value={reference.summary}
        onValueChange={(newValue) =>
          onChange({ ...reference, summary: newValue })
        }
        autoFocus={true}
        placeholder={getPlaceholder(reference, 'summary')}
        isDisabled={checkReadOnly(reference, 'summary')}
        isRequired
      />
      <Input
        label={t('ref.url')}
        type="url"
        csafPath={`/document/references/${referenceIndex}/url`}
        value={reference.url}
        onValueChange={(newValue) => onChange({ ...reference, url: newValue })}
        isDisabled={checkReadOnly(reference, 'url')}
        placeholder={getPlaceholder(reference, 'url')}
        isRequired
      />
    </VSplit>
  )
}
