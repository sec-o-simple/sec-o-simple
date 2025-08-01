import ComponentList from '@/components/forms/ComponentList'
import DatePicker from '@/components/forms/DatePicker'
import HSplit from '@/components/forms/HSplit'
import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import VSplit from '@/components/forms/VSplit'
import StatusIndicator from '@/components/StatusIndicator'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { useListState } from '@/utils/useListState'
import {
  TSelectableFullProductName,
  useProductTreeBranch,
} from '@/utils/useProductTreeBranch'
import { useFieldValidation } from '@/utils/validation/useFieldValidation'
import { useListValidation } from '@/utils/validation/useListValidation'
import { usePrefixValidation } from '@/utils/validation/usePrefixValidation'
import { Chip } from '@heroui/chip'
import { Alert } from '@heroui/react'
import { SelectItem } from '@heroui/select'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ProductsTagList from './components/ProductsTagList'
import {
  TRemediation,
  TRemediationCategory,
  remediationCategories,
  useRemediationGenerator,
} from './types/tRemediation'
import { TVulnerability } from './types/tVulnerability'

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

  const remediationGenerator = useRemediationGenerator()
  const remediationsListState = useListState<TRemediation>({
    initialData: vulnerability.remediations,
    generator: remediationGenerator,
  })
  const { getSelectableRefs } = useProductTreeBranch()
  let refs = getSelectableRefs()

  useEffect(
    () =>
      onChange({ ...vulnerability, remediations: remediationsListState.data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remediationsListState.data],
  )

  const listValidation = useListValidation(
    `/vulnerabilities/${vulnerabilityIndex}/remediations`,
    remediationsListState.data,
  )

  const csafPath = `/vulnerabilities/${vulnerabilityIndex}/remediations`
  const knownAffectedProducts = vulnerability.products.filter(
    (p) => p.status === 'known_affected',
  )

  return (
    <>
      {listValidation.hasErrors && (
        <Alert color="danger" className="mb-4">
          {listValidation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}
      <ComponentList
        listState={remediationsListState}
        title="url"
        itemLabel={t('vulnerabilities.remediation.title')}
        itemBgColor="bg-zinc-50"
        startContent={({ item, index }) => (
          <RemediationStartContent
            item={item}
            csafPath={`${csafPath}/${index}`}
          />
        )}
        content={(remediation, index) => (
          <RemediationForm
            remediation={remediation}
            csafPath={`${csafPath}/${index}`}
            isTouched={isTouched}
            products={refs?.filter((p) =>
              knownAffectedProducts.some(
                (product) =>
                  product.productId === p.full_product_name.product_id,
              ),
            )}
            onChange={remediationsListState.updateDataEntry}
          />
        )}
      />
    </>
  )
}

function RemediationStartContent({
  item,
  csafPath,
}: {
  item: TRemediation
  csafPath: string
}) {
  const { hasErrors } = usePrefixValidation(csafPath)
  const { t } = useTranslation()

  return (
    <>
      <StatusIndicator hasErrors={hasErrors} hasVisited={true} />
      <Chip color="primary" variant="flat" radius="md" size="lg">
        {t(`vulnerabilities.remediation.categories.${item.category}`)}
      </Chip>
    </>
  )
}

function RemediationForm({
  remediation,
  csafPath,
  onChange,
  products: ptbs = [],
  isTouched = false,
}: {
  remediation: TRemediation
  csafPath: string
  onChange: (remediation: TRemediation) => void
  products?: TSelectableFullProductName[]
  isTouched?: boolean
}) {
  const { t } = useTranslation()
  const fieldValidation = useFieldValidation(`${csafPath}/product_ids`)

  return (
    <VSplit>
      <HSplit className="items-start">
        <Select
          label={t('vulnerabilities.remediation.category')}
          csafPath={`${csafPath}/category`}
          isTouched={isTouched}
          selectedKeys={[remediation.category]}
          onSelectionChange={(selected) => {
            if (!selected.anchorKey) return

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
          isDisabled={checkReadOnly(remediation, 'date')}
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
        isRequired
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
        error={
          fieldValidation.hasErrors
            ? fieldValidation.errorMessages[0].message
            : ''
        }
        description={t('vulnerabilities.remediation.productsDescription')}
        selected={remediation.productIds}
        products={ptbs}
        onChange={(productIds) => onChange({ ...remediation, productIds })}
        isRequired
      />
    </VSplit>
  )
}
