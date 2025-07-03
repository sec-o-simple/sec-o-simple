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
import { useTranslation } from 'react-i18next'
import usePageVisit from '@/utils/validation/usePageVisit'

export default function Publisher() {
  const [localState, setLocalState] = useState(getDefaultDocumentPublisher())
  const { isFieldReadonly, getFieldPlaceholder } = useTemplate()

  const { t } = useTranslation()
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
      title={t('nav.documentInformation.publisher')}
      progress={1.4}
      onBack={'/document-information/notes'}
      onContinue={'/document-information/references'}
    >
      <Input
        label={t('document.publisher.name')}
        csafPath="/document/publisher/name"
        isTouched={hasVisitedPage}
        value={localState.name}
        onValueChange={(v) => setLocalState({ ...localState, name: v })}
        isDisabled={isFieldReadonly('document-information.publisher.name')}
        placeholder={getFieldPlaceholder('document-information.publisher.name')}
      />
      <HSplit className="items-start">
        <Select
          label={t('document.publisher.category')}
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
          placeholder={getFieldPlaceholder(
            'document-information.publisher.category',
          )}
        >
          {publisherCategories.map((key) => (
            <SelectItem key={key}>
              {t(`document.publisher.categories.${key}`)}
            </SelectItem>
          ))}
        </Select>
        <Input
          label={t('document.publisher.namespace')}
          csafPath="/document/publisher/namespace"
          isTouched={hasVisitedPage}
          value={localState.namespace}
          onValueChange={(v) => setLocalState({ ...localState, namespace: v })}
          isDisabled={isFieldReadonly(
            'document-information.publisher.namespace',
          )}
          placeholder={getFieldPlaceholder(
            'document-information.publisher.namespace',
          )}
        />
      </HSplit>
      <Textarea
        label={t('document.publisher.contactDetails')}
        csafPath="/document/publisher/contact_details"
        isTouched={hasVisitedPage}
        value={localState.contactDetails}
        onValueChange={(v) =>
          setLocalState({ ...localState, contactDetails: v })
        }
        isDisabled={isFieldReadonly(
          'document-information.publisher.contactDetails',
        )}
        placeholder={getFieldPlaceholder(
          'document-information.publisher.contactDetails',
        )}
      />
      <Textarea
        label={t('document.publisher.issuingAuthority')}
        csafPath="/document/publisher/issuing_authority"
        isTouched={hasVisitedPage}
        value={localState.issuingAuthority}
        onValueChange={(v) =>
          setLocalState({ ...localState, issuingAuthority: v })
        }
        isDisabled={isFieldReadonly(
          'document-information.publisher.issuingAuthority',
        )}
        placeholder={getFieldPlaceholder(
          'document-information.publisher.issuingAuthority',
        )}
      />
    </WizardStep>
  )
}
