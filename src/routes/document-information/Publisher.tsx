import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input, Textarea } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import {
  TPublisherCategory,
  getDefaultDocumentPublisher,
  publisherCategories,
} from './types/tDocumentPublisher'
import { useState } from 'react'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { TDocumentInformation } from './types/tDocumentInformation'
import { useTemplate } from '@/utils/template'

export default function Publisher() {
  const [localState, setLocalState] = useState(getDefaultDocumentPublisher())
  const { isFieldReadonly } = useTemplate()

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
        isDisabled={isFieldReadonly('document-information.publisher.name')}
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
          isDisabled={isFieldReadonly(
            'document-information.publisher.category',
          )}
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
          isDisabled={isFieldReadonly(
            'document-information.publisher.namespace',
          )}
        />
      </HSplit>
      <Textarea
        label="Contact Details"
        value={localState.contactDetails}
        onValueChange={(v) =>
          setLocalState({ ...localState, contactDetails: v })
        }
        isDisabled={isFieldReadonly(
          'document-information.publisher.contactDetails',
        )}
      />
      <Textarea
        label="Issuing Authority"
        value={localState.issuingAuthority}
        onValueChange={(v) =>
          setLocalState({ ...localState, issuingAuthority: v })
        }
        isDisabled={isFieldReadonly(
          'document-information.publisher.issuingAuthority',
        )}
      />
    </WizardStep>
  )
}
