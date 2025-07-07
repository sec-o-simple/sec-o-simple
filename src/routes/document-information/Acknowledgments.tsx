import StatusIndicator from '@/components/StatusIndicator'
import WizardStep from '@/components/WizardStep'
import AcknowledgmentNamesTable from '@/components/forms/AcknowledgmentNamesTable'
import ComponentList from '@/components/forms/ComponentList'
import { Input, Textarea } from '@/components/forms/Input'
import VSplit from '@/components/forms/VSplit'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useFieldValidation } from '@/utils/validation/useFieldValidation'
import { useListValidation } from '@/utils/validation/useListValidation'
import usePageVisit from '@/utils/validation/usePageVisit'
import useValidationStore from '@/utils/validation/useValidationStore'
import { Alert } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import {
  getDefaultDocumentAcknowledgment,
  TAcknowledgment,
} from './types/tDocumentAcknowledgments'
import { TDocumentInformation } from './types/tDocumentInformation'

export default function Acknowledgments() {
  const acknowledgmentsListState = useListState<TAcknowledgment>({
    generator: getDefaultDocumentAcknowledgment,
  })

  const { t } = useTranslation()
  usePageVisit()

  useDocumentStoreUpdater<TDocumentInformation>({
    localState: [
      acknowledgmentsListState.data,
      () => ({
        acknowledgments: acknowledgmentsListState.data,
      }),
    ],
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: (initialData) =>
      acknowledgmentsListState.setData(initialData.acknowledgments ?? []),
  })

  const listValidation = useListValidation(
    `/document/acknowledgments`,
    acknowledgmentsListState.data,
  )

  return (
    <WizardStep
      title={t('nav.documentInformation.acknowledgments')}
      progress={1.8}
      onBack={'/document-information/references'}
      onContinue="/product-management"
    >
      {listValidation.isTouched && listValidation.hasErrors && (
        <Alert color="danger">
          {listValidation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}
      <ComponentList
        listState={acknowledgmentsListState}
        title="organization"
        itemLabel={t('document.acknowledgments.acknowledgment')}
        startContent={StartContent}
        content={(acknowledgment, index) => (
          <AcknowledgmentForm
            acknowledgmentIndex={index}
            acknowledgment={acknowledgment}
            onChange={acknowledgmentsListState.updateDataEntry}
          />
        )}
      />
    </WizardStep>
  )
}

function StartContent({ index }: { index: number }) {
  const { hasErrors } = useFieldValidation(`/document/acknowledgments/${index}`)

  return <StatusIndicator hasErrors={hasErrors} hasVisited={true} />
}

function AcknowledgmentForm({
  acknowledgment,
  acknowledgmentIndex,
  onChange,
}: {
  acknowledgment: TAcknowledgment
  acknowledgmentIndex: number
  onChange: (reference: TAcknowledgment) => void
}) {
  const { t } = useTranslation()
  const message = useValidationStore((state) => state.messages).filter(
    (m) => m.path === `/document/acknowledgments/${acknowledgmentIndex}`,
  )?.[0]

  return (
    <VSplit>
      {message?.severity === 'error' && (
        <Alert color="danger" className="mb-4">
          <p>{message.message}</p>
        </Alert>
      )}

      <Textarea
        label={t('document.acknowledgments.summary')}
        csafPath={`/document/acknowledgments/${acknowledgmentIndex}/summary`}
        value={acknowledgment.summary}
        onValueChange={(newValue) =>
          onChange({ ...acknowledgment, summary: newValue })
        }
        autoFocus={true}
        isDisabled={checkReadOnly(acknowledgment, 'summary')}
        placeholder={getPlaceholder(acknowledgment, 'summary')}
      />
      <Input
        label={t('document.acknowledgments.organization')}
        csafPath={`/document/acknowledgments/${acknowledgmentIndex}/organization`}
        value={acknowledgment.organization}
        onValueChange={(newValue) =>
          onChange({ ...acknowledgment, organization: newValue })
        }
        isDisabled={checkReadOnly(acknowledgment, 'organization')}
        placeholder={getPlaceholder(acknowledgment, 'organization')}
      />

      <AcknowledgmentNamesTable
        acknowledgment={acknowledgment}
        acknowledgmentIndex={acknowledgmentIndex}
        onChange={(updatedAcknowledgment) =>
          onChange({
            ...acknowledgment,
            names: updatedAcknowledgment.names,
          })
        }
      />
    </VSplit>
  )
}
