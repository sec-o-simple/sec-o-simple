import StatusIndicator from '@/components/StatusIndicator'
import ComponentList from '@/components/forms/ComponentList'
import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import VSplit from '@/components/forms/VSplit'
import {
  TDocumentReference,
  TReferenceCategory,
  referenceCategories,
} from '@/routes/document-information/types/tDocumentReference'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { ListState } from '@/utils/useListState'
import { usePrefixValidation } from '@/utils/validation/usePrefixValidation'
import { SelectItem } from '@heroui/react'
import { useTranslation } from 'react-i18next'

export function ReferencesList({
  referencesListState,
  csafPath,
}: {
  referencesListState: ListState<TDocumentReference>
  csafPath: string
}) {
  const { t } = useTranslation()

  return (
    <ComponentList
      listState={referencesListState}
      title="summary"
      itemLabel={t('ref.reference')}
      itemBgColor="bg-zinc-50"
      startContent={({ index }) => (
        <StartContent csafPath={`${csafPath}/${index}`} />
      )}
      content={(reference, index) => (
        <ReferenceForm
          referenceIndex={index}
          reference={reference}
          csafPath={`${csafPath}/${index}`}
          onChange={referencesListState.updateDataEntry}
        />
      )}
    />
  )
}

function StartContent({ csafPath }: { csafPath: string }) {
  const { hasErrors } = usePrefixValidation(csafPath)

  return <StatusIndicator hasErrors={hasErrors} hasVisited={true} />
}

function ReferenceForm({
  reference,
  referenceIndex,
  csafPath,
  onChange,
}: {
  reference: TDocumentReference
  referenceIndex: number
  csafPath: string
  onChange: (reference: TDocumentReference) => void
}) {
  const { t } = useTranslation()

  return (
    <VSplit>
      <Select
        label={t('ref.category')}
        csafPath={`${csafPath}/category`}
        selectedKeys={[reference.category]}
        isRequired
        onSelectionChange={(selected) => {
          if (!selected.anchorKey) return

          onChange({
            ...reference,
            category: [...selected][0] as TReferenceCategory,
          })
        }}
        renderValue={(selected) => {
          if (!selected[0].key) return ''
          return t(`ref.categories.${selected[0].key}`)
        }}
        isDisabled={checkReadOnly(reference, 'category')}
      >
        {referenceCategories.map((key) => (
          <SelectItem key={key} textValue={key}>
            {t(`ref.categories.${key}`)}
          </SelectItem>
        ))}
      </Select>
      <Textarea
        label={t('ref.summary')}
        csafPath={`${csafPath}/summary`}
        value={reference.summary}
        onValueChange={(newValue) =>
          onChange({ ...reference, summary: newValue })
        }
        autoFocus={referenceIndex === 0}
        placeholder={getPlaceholder(reference, 'summary')}
        isDisabled={checkReadOnly(reference, 'summary')}
        isRequired
      />
      <Input
        label={t('ref.url')}
        type="url"
        csafPath={`${csafPath}/url`}
        value={reference.url}
        onValueChange={(newValue) => onChange({ ...reference, url: newValue })}
        isDisabled={checkReadOnly(reference, 'url')}
        placeholder={getPlaceholder(reference, 'url')}
        isRequired
      />
    </VSplit>
  )
}
