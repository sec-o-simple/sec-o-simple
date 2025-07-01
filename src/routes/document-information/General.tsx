import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { SelectItem } from '@heroui/select'
import { useState } from 'react'
import { TDocumentInformation } from './types/tDocumentInformation'
import {
  TGeneralDocumentInformation,
  getDefaultGeneralDocumentInformation,
} from './types/tGeneralDocumentInformation'
import { useTemplate } from '@/utils/template'
import usePageVisit from '@/utils/usePageVisit'
import { useTranslation } from 'react-i18next'
import RevisionHistoryTable, { RevisionHistoryEntry } from '@/components/forms/RevisionHistoryTable'

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

  const [revisionHistory, setRevisionHistory] = useState<
    RevisionHistoryEntry[]
  >(() => [
    {
      version: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
  ])

  return (
    <WizardStep
      title={t('nav.documentInformation.general')}
      progress={1}
      onContinue={'/document-information/notes'}
    >
      <Input
        label={t('document.general.title')}
        csafPath="/document/title"
        isTouched={hasVisitedPage}
        value={localState.title}
        onValueChange={(title) => setLocalState({ ...localState, title })}
        isDisabled={isFieldReadonly('document-information.title')}
        placeholder={getFieldPlaceholder('document-information.title')}
      />
      <HSplit className="items-start">
        <Input
          label={t('document.general.id')}
          csafPath="/document/tracking/id"
          isTouched={hasVisitedPage}
          value={localState.id}
          onValueChange={(id) => setLocalState({ ...localState, id })}
          isDisabled={isFieldReadonly('document-information.id')}
          placeholder={getFieldPlaceholder('document-information.id')}
        />
        <Select
          label={t('document.general.language')}
          csafPath="/document/lang"
          isTouched={hasVisitedPage}
          selectedKeys={[localState.language]}
          onSelectionChange={(v) =>
            setLocalState({ ...localState, language: [...v][0] as string })
          }
          isDisabled={isFieldReadonly('document-information.language')}
          placeholder={getFieldPlaceholder('document-information.language')}
        >
          {['de', 'en'].map((key) => (
            <SelectItem key={key}>{key.toUpperCase()}</SelectItem>
          ))}
        </Select>
      </HSplit>
      <RevisionHistoryTable
        revisions={revisionHistory}
        onChange={(newRevisions) => setRevisionHistory(newRevisions)}
      />
    </WizardStep>
  )
}
