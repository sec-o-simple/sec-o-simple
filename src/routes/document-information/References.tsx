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
import { checkReadOnly } from '@/utils/template'

export default function References() {
  const referencesListState = useListState<TDocumentReference>({
    generator: getDefaultDocumentReference,
  })

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
      title="Document Information - References"
      progress={1.75}
      onBack={'/document-information/publisher'}
      onContinue={'/product-management'}
    >
      <ComponentList
        listState={referencesListState}
        title="summary"
        content={(reference) => (
          <ReferenceForm
            reference={reference}
            onChange={referencesListState.updateDataEntry}
          />
        )}
      />
    </WizardStep>
  )
}

function ReferenceForm({
  reference,
  onChange,
}: {
  reference: TDocumentReference
  onChange: (reference: TDocumentReference) => void
}) {
  return (
    <VSplit>
      <Textarea
        label="Summary of the reference"
        value={reference.summary}
        onValueChange={(newValue) =>
          onChange({ ...reference, summary: newValue })
        }
        autoFocus={true}
        isDisabled={checkReadOnly(reference, 'summary')}
      />
      <Input
        label="URL of the reference"
        value={reference.url}
        onValueChange={(newValue) => onChange({ ...reference, url: newValue })}
        isDisabled={checkReadOnly(reference, 'url')}
      />
    </VSplit>
  )
}
