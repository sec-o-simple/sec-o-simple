import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import RevisionHistoryTable from '@/components/forms/RevisionHistoryTable'
import Select from '@/components/forms/Select'
import { useTemplate } from '@/utils/template'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import usePageVisit from '@/utils/validation/usePageVisit'
import { SelectItem } from '@heroui/select'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getDefaultGeneralDocumentInformation, TDocumentStatus, TGeneralDocumentInformation } from './types/tGeneralDocumentInformation'
import { TDocumentInformation } from './types/tDocumentInformation'

export default function Tracking() {
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
      title={t('nav.tracking')}
      onBack={'/vulnerabilities'}
      progress={5}
    >
      <HSplit className="items-start">
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
      <RevisionHistoryTable />
    </WizardStep>
  )
}
