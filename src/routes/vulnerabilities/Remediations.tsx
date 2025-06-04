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
      itemLabel="Remediation"
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
  return (
    <Chip color="primary" variant="flat" radius="md" size="lg">
      {remediation.category}
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
  return (
    <VSplit>
      <HSplit className="items-start">
        <Select
          label="Remediation category"
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
            <SelectItem key={remediation}>{remediation}</SelectItem>
          ))}
        </Select>
        <DatePicker
          label="Remediation date"
          isTouched={isTouched}
          csafPath={`${csafPath}/date`}
          value={remediation.date}
          onChange={(newValue) => onChange({ ...remediation, date: newValue })}
          isDisabled={checkReadOnly(remediation, 'details')}
        />
      </HSplit>
      <Textarea
        label="Details"
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
        label="URL"
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
