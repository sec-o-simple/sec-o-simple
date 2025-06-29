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
import usePageVisit from '@/utils/usePageVisit'

export default function References() {
  const referencesListState = useListState<TDocumentReference>({
    generator: getDefaultDocumentReference,
  })

  usePageVisit()

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
        itemLabel="Reference"
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

function ReferenceForm({
  reference,
  referenceIndex,
  onChange,
}: {
  reference: TDocumentReference
  referenceIndex: number
  onChange: (reference: TDocumentReference) => void
}) {
  return (
    <VSplit>
      <Textarea
        label="Summary of the reference"
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
        label="URL of the reference"
        csafPath={`/document/references/${referenceIndex}/url`}
        value={reference.url}
        onValueChange={(newValue) => onChange({ ...reference, url: newValue })}
        isDisabled={checkReadOnly(reference, 'url')}
        placeholder={getPlaceholder(reference, 'url')}
      />
    </VSplit>
  )
}
