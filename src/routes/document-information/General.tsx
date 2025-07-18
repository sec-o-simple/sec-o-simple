import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { useTemplate } from '@/utils/template'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import usePageVisit from '@/utils/validation/usePageVisit'
import { SelectItem } from '@heroui/select'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TDocumentInformation } from './types/tDocumentInformation'
import {
  TGeneralDocumentInformation,
  getDefaultGeneralDocumentInformation,
} from './types/tGeneralDocumentInformation'

export default function General() {
  const [localState, setLocalState] = useState<TGeneralDocumentInformation>(
    getDefaultGeneralDocumentInformation(),
  )

  useDocumentStoreUpdater<TDocumentInformation>({
    localState,
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: setLocalState,
  })

  const hasVisitedPage = usePageVisit()
  const { t } = useTranslation()
  const { isFieldReadonly, getFieldPlaceholder } = useTemplate()

  return (
    <WizardStep
      title={t('nav.documentInformation.general')}
      progress={1}
      onContinue={'/document-information/notes'}
    >
      <HSplit className="items-start">
        <Input
          label={t('document.general.title')}
          csafPath="/document/title"
          isTouched={hasVisitedPage}
          value={localState.title}
          onValueChange={(title) => setLocalState({ ...localState, title })}
          isDisabled={isFieldReadonly('document-information.title')}
          placeholder={getFieldPlaceholder('document-information.title')}
          isRequired
        />
      </HSplit>
      <HSplit className="items-start">
        <Input
          label={t('document.general.id')}
          csafPath="/document/tracking/id"
          isTouched={hasVisitedPage}
          value={localState.id}
          onValueChange={(id) => setLocalState({ ...localState, id })}
          isDisabled={isFieldReadonly('document-information.id')}
          placeholder={getFieldPlaceholder('document-information.id')}
          isRequired
        />
        <Select
          className="w-1/2"
          label={t('document.general.language')}
          csafPath="/document/lang"
          isTouched={hasVisitedPage}
          selectedKeys={[localState.lang]}
          onSelectionChange={(v) =>
            setLocalState({ ...localState, lang: [...v][0] as string })
          }
          isDisabled={isFieldReadonly('document-information.lang')}
          isRequired
          placeholder={getFieldPlaceholder('document-information.lang')}
        >
          {['de', 'en'].map((key) => (
            <SelectItem key={key}>
              {t(`document.general.languages.${key}`)}
            </SelectItem>
          ))}
        </Select>
      </HSplit>
    </WizardStep>
  )
}
