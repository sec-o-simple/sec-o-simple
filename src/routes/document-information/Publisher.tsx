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
import usePageVisit from '@/utils/usePageVisit'

export default function Publisher() {
  const [localState, setLocalState] = useState(getDefaultDocumentPublisher())
  const { isFieldReadonly } = useTemplate()
  const hasVisitedPage = usePageVisit()

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
        isTouched={hasVisitedPage}
        value={localState.name}
        onValueChange={(v) => setLocalState({ ...localState, name: v })}
        isDisabled={isFieldReadonly('document-information.publisher.name')}
      />
      <HSplit className="items-start">
        <Select
          label="Category of Publisher"
          csafPath="/document/publisher/category"
          isTouched={hasVisitedPage}
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
          isTouched={hasVisitedPage}
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
        isTouched={hasVisitedPage}
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
        isTouched={hasVisitedPage}
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
