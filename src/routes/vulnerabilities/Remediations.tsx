import { TVulnerability } from './types/tVulnerability'
import ComponentList from '@/components/forms/ComponentList'
import { useListState } from '@/utils/useListState'
import VSplit from '@/components/forms/VSplit'
import { Input, Textarea } from '@/components/forms/Input'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { useEffect } from 'react'
import ProductsTagList from './components/ProductsTagList'
import { Chip } from '@heroui/chip'
import Select from '@/components/forms/Select'
import {
  TRemediation,
  TRemediationCategory,
  getDefaultRemediation,
  remediationCategories,
} from './types/tRemediation'
import { SelectItem } from '@heroui/select'
import HSplit from '@/components/forms/HSplit'
import DatePicker from '@/components/forms/DatePicker'
import { useTranslation } from 'react-i18next'

export default function Remediations({
  vulnerability,
  vulnerabilityIndex,
  onChange,
  isTouched = false,
}: {
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  onChange: (vulnerability: TVulnerability) => void
  isTouched?: boolean
}) {
  const { t } = useTranslation()
  const remediationsListState = useListState<TRemediation>({
    initialData: vulnerability.remediations,
    generator: getDefaultRemediation,
  })

  useEffect(
    () =>
      onChange({ ...vulnerability, remediations: remediationsListState.data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remediationsListState.data],
  )

  return (
    <ComponentList
      listState={remediationsListState}
      title="url"
      itemLabel={t('vulnerabilities.remediation.title')}
      startContent={(r) => <CategoryChip remediation={r} />}
      content={(remediation, index) => (
        <RemediationForm
          remediation={remediation}
          csafPath={`/vulnerabilities/${vulnerabilityIndex}/remediations/${index}`}
          isTouched={isTouched}
          onChange={remediationsListState.updateDataEntry}
        />
      )}
    />
  )
}

function CategoryChip({ remediation }: { remediation: TRemediation }) {
  const { t } = useTranslation()

  return (
    <Chip color="primary" variant="flat" radius="md">
      {t(`vulnerabilities.remediation.categories.${remediation.category}`)}
    </Chip>
  )
}

function RemediationForm({
  remediation,
  csafPath,
  onChange,
  isTouched = false,
}: {
  remediation: TRemediation
  csafPath: string
  onChange: (remediation: TRemediation) => void
  isTouched?: boolean
}) {
  const { t } = useTranslation()

  return (
    <VSplit>
      <HSplit className="items-start">
        <Select
          label={t('vulnerabilities.remediation.category')}
          csafPath={`${csafPath}/category`}
          isTouched={isTouched}
          selectedKeys={[remediation.category]}
          onSelectionChange={(selected) => {
            onChange({
              ...remediation,
              category: [...selected][0] as TRemediationCategory,
            })
          }}
          isDisabled={checkReadOnly(remediation, 'category')}
          placeholder={getPlaceholder(remediation, 'category')}
        >
          {remediationCategories.map((remediation) => (
            <SelectItem key={remediation}>
              {t(`vulnerabilities.remediation.categories.${remediation}`)}
            </SelectItem>
          ))}
        </Select>
        <DatePicker
          label={t('vulnerabilities.remediation.date')}
          isTouched={isTouched}
          csafPath={`${csafPath}/date`}
          value={remediation.date}
          onChange={(newValue) => onChange({ ...remediation, date: newValue })}
          isDisabled={checkReadOnly(remediation, 'details')}
        />
      </HSplit>
      <Textarea
        label={t('vulnerabilities.remediation.details')}
        isTouched={isTouched}
        csafPath={`${csafPath}/details`}
        value={remediation.details}
        onValueChange={(newValue) =>
          onChange({ ...remediation, details: newValue })
        }
        isDisabled={checkReadOnly(remediation, 'details')}
        placeholder={getPlaceholder(remediation, 'details')}
      />
      <Input
        label={t('vulnerabilities.remediation.url')}
        isTouched={isTouched}
        csafPath={`${csafPath}/url`}
        value={remediation.url}
        onValueChange={(newValue) =>
          onChange({ ...remediation, url: newValue })
        }
        isDisabled={checkReadOnly(remediation, 'url')}
        placeholder={getPlaceholder(remediation, 'url')}
      />
      <ProductsTagList
        products={remediation.productIds}
        onChange={(productIds) => onChange({ ...remediation, productIds })}
      />
    </VSplit>
  )
}
