import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import VSplit from '@/components/forms/VSplit'
import { useTemplate } from '@/utils/template'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import usePageVisit from '@/utils/validation/usePageVisit'
import { SelectItem } from '@heroui/select'
import { cn } from '@heroui/theme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TDocumentInformation } from './types/tDocumentInformation'
import {
  TGeneralDocumentInformation,
  TTLPLevel,
  getDefaultGeneralDocumentInformation,
  tlpLevel,
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
            <SelectItem key={key} textValue={key}>
              {t(`document.general.languages.${key}`)}
            </SelectItem>
          ))}
        </Select>
      </HSplit>

      <div className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t('document.general.tlp.title')}
          </h2>
        </div>

        <VSplit>
          <Select
            selectedKeys={[localState.tlp?.label as TTLPLevel]}
            label={t('document.general.tlp.label')}
            onSelectionChange={(v) =>
              setLocalState({
                ...localState,
                tlp: { ...localState.tlp, label: [...v][0] as TTLPLevel },
              })
            }
            csafPath="/document/tlp/label"
            renderValue={(value) => (
              <TLPColor color={value[0].key as TTLPLevel} />
            )}
            placeholder={getFieldPlaceholder('document-information.tlp.label')}
          >
            {tlpLevel.map((level) => (
              <SelectItem key={level}>
                <TLPColor color={level} />
              </SelectItem>
            ))}
          </Select>
          <Input
            label={t('document.general.tlp.url')}
            csafPath="/document/tlp/url"
            type="url"
            isTouched={hasVisitedPage}
            value={localState.tlp?.url}
            onValueChange={(url) =>
              setLocalState({
                ...localState,
                tlp: { ...localState.tlp, url },
              })
            }
            isDisabled={isFieldReadonly('document-information.tlp.url')}
            placeholder={
              getFieldPlaceholder('document-information.tlp.url') ??
              'https://www.first.org/tlp/'
            }
          />
        </VSplit>
      </div>
    </WizardStep>
  )
}

function TLPColor({ color }: { color: TTLPLevel }) {
  const { t } = useTranslation()

  const backgroundColor =
    {
      white: 'bg-zinc-200',
      green: 'bg-green-500',
      amber: 'bg-amber-500',
      red: 'bg-red-500',
    }[color] || 'bg-zinc-200'

  return (
    <div className="flex items-center gap-2">
      <div className={cn('size-2 rounded-full', backgroundColor)} />

      {t(`document.general.tlp.level.${color}`)}
    </div>
  )
}
