import VSplit from '@/components/forms/VSplit'
import useDocumentStore from '@/utils/useDocumentStore'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { useFieldValidation } from '@/utils/validation/useFieldValidation'
import { Button } from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { TVulnerability } from './types/tVulnerability'
import {
  matrixProductStatuses,
  getMatrixCellStatus,
  TMatrixProductStatusValue,
  updateVulnerabilityProductStatus,
} from './utils/productMatrix'

const statusCopyMap: Record<string, TMatrixProductStatusValue> = {
  known_affected: 'known_affected',
  known_not_affected: 'known_not_affected',
  fixed: 'fixed',
  under_investigation: 'under_investigation',
  first_affected: 'known_affected',
  last_affected: 'known_affected',
  first_fixed: 'fixed',
  recommended: 'fixed',
}

export default function Products({
  vulnerability,
  vulnerabilityIndex,
  onChange,
}: {
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  onChange: (vulnerability: TVulnerability) => void
}) {
  const { t } = useTranslation()
  const vulnerabilities = useDocumentStore((state) => state.vulnerabilities)
  const { getPTBsByCategory, getFullProductName } = useProductTreeBranch()
  const [copySourceVulnerabilityId, setCopySourceVulnerabilityId] = useState('')
  const [showCopySelection, setShowCopySelection] = useState(false)
  const [localVulnerability, setLocalVulnerability] = useState(vulnerability)

  useEffect(() => {
    setLocalVulnerability(vulnerability)
  }, [vulnerability])

  const productVersions = useMemo(
    () =>
      getPTBsByCategory('product_version')
        .map((version) => ({
          id: version.id,
          name: getFullProductName(version.id),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [getPTBsByCategory, getFullProductName],
  )

  const copySources = useMemo(
    () =>
      vulnerabilities
        .filter((item) => item.id !== vulnerability.id)
        .map((item, index) => ({
          id: item.id,
          label:
            item.cve ||
            item.title ||
            t('vulnerabilities.matrix.vulnerabilityFallback', {
              index: index + 1,
            }),
        })),
    [vulnerabilities, vulnerability.id, t],
  )

  const validation = useFieldValidation(
    `/vulnerabilities/${vulnerabilityIndex}/product_status`,
  )

  const updateVersionStatus = (
    productId: string,
    status: TMatrixProductStatusValue,
  ) => {
    const updated = updateVulnerabilityProductStatus(
      localVulnerability,
      productId,
      status,
    )

    setLocalVulnerability(updated)
    onChange(updated)
  }

  const copySelectionFromVulnerability = () => {
    const source = vulnerabilities.find(
      (item) => item.id === copySourceVulnerabilityId,
    )

    if (!source) {
      return
    }

    const getStatusFromSource = (productId: string): TMatrixProductStatusValue => {
      for (let i = source.products.length - 1; i >= 0; i--) {
        const sourceProduct = source.products[i]
        if (sourceProduct.productId === productId) {
          return statusCopyMap[sourceProduct.status] || ''
        }
      }

      return ''
    }

    const updated = productVersions.reduce(
      (current, version) =>
        updateVulnerabilityProductStatus(
          current,
          version.id,
          getStatusFromSource(version.id),
        ),
      localVulnerability,
    )

    setLocalVulnerability(updated)
    onChange(updated)
    setCopySourceVulnerabilityId('')
    setShowCopySelection(false)
  }

  return (
    <VSplit className="gap-2">
      <div className="flex justify-end">
        {productVersions.length > 0 && !showCopySelection && (
          <Button
            size="sm"
            variant="light"
            data-testid="toggle-copy-selection"
            onPress={() => setShowCopySelection(true)}
          >
            {t('vulnerabilities.products.copySectionTitle')}
          </Button>
        )}
      </div>

      {productVersions.length > 0 && showCopySelection && (
        <div className="border-default-200 flex items-end gap-2 rounded-md border p-3">
          <div className="flex grow flex-col gap-1">
            <label className="text-sm font-medium">
              {t('vulnerabilities.products.copyFromLabel')}
            </label>
            <select
              data-testid="copy-source-select"
              className="border-default-300 bg-content1 rounded-md border px-2 py-2"
              value={copySourceVulnerabilityId}
              onChange={(event) =>
                setCopySourceVulnerabilityId(event.target.value)
              }
            >
              <option value="">
                {t('vulnerabilities.products.copyFromPlaceholder')}
              </option>
              {copySources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            data-testid="copy-selection-button"
            isDisabled={!copySourceVulnerabilityId}
            onPress={copySelectionFromVulnerability}
          >
            {t('vulnerabilities.products.copyButton')}
          </Button>

          <Button
            variant="light"
            data-testid="close-copy-selection"
            onPress={() => {
              setCopySourceVulnerabilityId('')
              setShowCopySelection(false)
            }}
          >
            {t('common.cancel')}
          </Button>
        </div>
      )}

      {validation.hasErrors && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {validation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </div>
      )}

      {productVersions.length === 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {t('vulnerabilities.products.noProductVersions')}{' '}
          {t('vulnerabilities.products.noProductVersionsLinkPrefix')}{' '}
          <Link to="/products/management" className="underline">
            {t('products.manage')}
          </Link>
          .
        </div>
      )}

      {productVersions.length > 0 && (
        <div className="overflow-auto">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-content2">
                <th className="border-default-200 w-1/5 border p-2 text-left">
                  {t('vulnerabilities.matrix.productVersion')}
                </th>
                {matrixProductStatuses.map((status) => (
                  <th
                    key={status}
                    className="border-default-200 w-1/5 border p-2 text-center"
                  >
                    {t(`vulnerabilities.products.status.${status}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productVersions.map((version) => {
                const selectedStatus = getMatrixCellStatus(
                  localVulnerability,
                  version.id,
                )

                return (
                  <tr key={version.id}>
                    <td className="border-default-200 border p-2">{version.name}</td>
                    {matrixProductStatuses.map((status) => (
                      <td key={`${version.id}-${status}`} className="border-default-200 border p-2">
                        <label className="flex items-center justify-center">
                          <input
                            type="radio"
                            data-testid={`status-radio-${version.id}-${status}`}
                            name={`product-status-${localVulnerability.id || vulnerabilityIndex}-${version.id}`}
                            checked={selectedStatus === status}
                            onChange={() => updateVersionStatus(version.id, status)}
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-default-500 px-1 text-xs">
        {t('vulnerabilities.products.matrixHint')}{' '}
        <Link
          to="/vulnerabilities/matrix"
          className="text-primary hover:text-primary-600 underline"
        >
          {t('vulnerabilities.products.openMatrix')}
        </Link>
        .
      </p>
    </VSplit>
  )
}
