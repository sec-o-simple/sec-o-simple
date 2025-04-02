import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { SelectItem } from '@heroui/select'
import { useState } from 'react'
import { TDocumentInformation } from './types/tDocumentInformation'
import {
  TPublisherCategory,
  getDefaultDocumentPublisher,
  publisherCategories,
} from './types/tDocumentPublisher'

export default function Publisher() {
  const [localState, setLocalState] = useState(getDefaultDocumentPublisher())

  useDocumentStoreUpdater<TDocumentInformation>({
    localState: [localState, () => ({ publisher: localState })],
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: (initialDocumentInformation) =>
      setLocalState(initialDocumentInformation.publisher),
  })

  return (
    <WizardStep
      title="Document Information - Publisher"
      progress={1.5}
      onBack={'/document-information/notes'}
      onContinue={'/document-information/references'}
    >
      <Input
        label="Name of publisher"
        value={localState.name}
        onValueChange={(v) => setLocalState({ ...localState, name: v })}
      />
      <HSplit>
        <Select
          label="Category of Publisher"
          selectedKeys={[localState.category]}
          onSelectionChange={(selected) =>
            setLocalState({
              ...localState,
              category: [...selected][0] as TPublisherCategory,
            })
          }
        >
          {publisherCategories.map((key) => (
            <SelectItem key={key}>{key}</SelectItem>
          ))}
        </Select>
        <Input
          label="Namespace of Publisher"
          placeholder="e.g., https://publisher.example.org/"
          value={localState.namespace}
          onValueChange={(v) => setLocalState({ ...localState, namespace: v })}
        />
      </HSplit>
      <Textarea
        label="Contact Details"
        value={localState.contactDetails}
        onValueChange={(v) =>
          setLocalState({ ...localState, contactDetails: v })
        }
      />
      <Textarea
        label="Issuing Authority"
        value={localState.issuingAuthority}
        onValueChange={(v) =>
          setLocalState({ ...localState, issuingAuthority: v })
        }
      />
    </WizardStep>
  )
}
