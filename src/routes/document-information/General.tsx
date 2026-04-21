import WizardStep from '@/components/WizardStep'
import { Autocomplete } from '@/components/forms/Autocomplete'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import VSplit from '@/components/forms/VSplit'
import licenseData from '@/utils/licenses.json'
import { useTemplate } from '@/utils/template'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import usePageVisit from '@/utils/validation/usePageVisit'
import useValidationStore from '@/utils/validation/useValidationStore'
import { Alert, AutocompleteItem, cn } from '@heroui/react'
import { SelectItem } from '@heroui/select'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TDocumentInformation } from './types/tDocumentInformation'
import {
  TGeneralDocumentInformation,
  TTLPLevel,
  defaultLicenseExpression,
  getDefaultGeneralDocumentInformation,
  tlpLevel,
} from './types/tGeneralDocumentInformation'

type TLicense = {
  name: string
  licenseId: string
}

const licenses = licenseData.licenses as TLicense[]

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
  const { t, i18n } = useTranslation()
  const { isFieldReadonly, getFieldPlaceholder } = useTemplate()
  const message = useValidationStore((state) => state.messages).filter(
    (m) => m.path === `/document/distribution/tlp`,
  )?.[0]

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
          renderValue={(value) =>
            t(`document.general.languages.${value[0].key}`)
          }
          isDisabled={isFieldReadonly('document-information.lang')}
          isRequired
          placeholder={getFieldPlaceholder('document-information.lang')}
        >
          {Object.keys(i18n.store.data).map((key) => (
            <SelectItem key={key} textValue={key}>
              {t(`document.general.languages.${key}`)}
            </SelectItem>
          ))}
        </Select>
      </HSplit>

      <HSplit className="items-start">
        <Autocomplete
          className="w-full"
          label={t('document.general.licenseExpression')}
          csafPath="/document/license_expression"
          isTouched={hasVisitedPage}
          selectedKey={localState.licenseExpression ?? defaultLicenseExpression}
          onSelectionChange={(v) =>
            setLocalState({
              ...localState,
              licenseExpression: (v as string) ?? defaultLicenseExpression,
            })
          }
          isDisabled={isFieldReadonly(
            'document-information.license-expression',
          )}
          maxListboxHeight={400}
          itemHeight={48}
          isRequired
          placeholder={getFieldPlaceholder(
            'document-information.license-expression',
          )}
        >
          {licenses.map((license) => (
            <AutocompleteItem
              key={license.licenseId}
              textValue={`${license.name} (${license.licenseId})`}
            >
              {license.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>
      </HSplit>

      <div className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t('document.general.tlp.title')}
          </h2>
        </div>

        <VSplit>
          {message && (
            <Alert color="danger">
              <p>{message.message}</p>
            </Alert>
          )}

          <Select
            selectedKeys={[localState.tlp?.label as TTLPLevel]}
            label={t('document.general.tlp.label')}
            onSelectionChange={(v) =>
              setLocalState({
                ...localState,
                tlp: { ...localState.tlp, label: [...v][0] as TTLPLevel },
              })
            }
            csafPath="/document/distribution/tlp/label"
            renderValue={(value) => (
              <TLPColor color={value[0].key as TTLPLevel} />
            )}
            placeholder={
              getFieldPlaceholder(
                'document-information.tlp.label.placeholder',
              ) ?? t('document.general.tlp.label.placeholder')
            }
          >
            {tlpLevel.map((level) => (
              <SelectItem key={level}>
                <TLPColor color={level} />
              </SelectItem>
            ))}
          </Select>
        </VSplit>
      </div>
    </WizardStep>
  )
}

function TLPColor({ color }: { color: TTLPLevel }) {
  const backgroundColor =
    {
      WHITE: 'bg-zinc-200',
      GREEN: 'bg-green-500',
      AMBER: 'bg-amber-500',
      RED: 'bg-red-500',
    }[color] || 'bg-zinc-200'

  return (
    <div className="flex items-center gap-2">
      <div className={cn('size-2 rounded-full', backgroundColor)} />

      {color}
    </div>
  )
}
