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
        csafPath="/document/publisher/name"
        value={localState.name}
        onValueChange={(v) => setLocalState({ ...localState, name: v })}
        isDisabled={isFieldReadonly('document-information.publisher.name')}
      />
      <HSplit className="items-start">
        <Select
          label="Category of Publisher"
          csafPath="/document/publisher/category"
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
          csafPath="/document/publisher/namespace"
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
        csafPath="/document/publisher/contact_details"
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
        csafPath="/document/publisher/issuing_authority"
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
