import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import RevisionHistoryTable from '@/components/forms/RevisionHistoryTable'
import Select from '@/components/forms/Select'
import { useTemplate } from '@/utils/template'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import usePageVisit from '@/utils/validation/usePageVisit'
import { SelectItem } from '@heroui/select'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TDocumentInformation } from './types/tDocumentInformation'
import {
  TDocumentStatus,
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

        <Select
          className="w-1/2"
          label={t('document.general.state')}
          csafPath="/document/tracking/status"
          isTouched={hasVisitedPage}
          selectedKeys={[localState.status]}
          onSelectionChange={(v) => {
            if (!v.anchorKey) return

            setLocalState({
              ...localState,
              status: [...v][0] as TDocumentStatus,
            })
          }}
          isDisabled={isFieldReadonly('document-information.tracking.status')}
          isRequired
          placeholder={getFieldPlaceholder(
            'document-information.tracking.status',
          )}
        >
          {['draft', 'final', 'interim'].map((key) => (
            <SelectItem key={key}>
              {t(`document.general.status.${key}`)}
            </SelectItem>
          ))}
        </Select>
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
          selectedKeys={[localState.language]}
          onSelectionChange={(v) =>
            setLocalState({ ...localState, language: [...v][0] as string })
          }
          isDisabled={isFieldReadonly('document-information.language')}
          isRequired
          placeholder={getFieldPlaceholder('document-information.language')}
        >
          {['de', 'en'].map((key) => (
            <SelectItem key={key}>
              {t(`document.general.languages.${key}`)}
            </SelectItem>
          ))}
        </Select>
      </HSplit>
      <RevisionHistoryTable />
    </WizardStep>
  )
}
