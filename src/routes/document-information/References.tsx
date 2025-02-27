import WizardStep from '@/components/WizardStep'
import ComponentList from '@/components/forms/ComponentList'
import VSplit from '@/components/forms/VSplit'
import { useListState } from '@/utils/useListState'
import { Input, Textarea } from '@heroui/input'
import { uid } from 'uid'

export type TDocumentReference = {
  id: string
  url: string
  summary: string
}

export default function References() {
  const referencesListState = useListState<TDocumentReference>({
    generator: () => ({
      id: uid(),
      url: '',
      summary: '',
    }),
  })

  return (
    <WizardStep
      title="Document Information - References"
      progress={1.75}
      onBack={'/document-information/publisher'}
      onContinue={'/products'}
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
      />
      <Input
        label="URL of the reference"
        value={reference.url}
        onValueChange={(newValue) => onChange({ ...reference, url: newValue })}
      />
    </VSplit>
  )
}
