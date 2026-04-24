import WizardStep from '@/components/WizardStep'
import { faArrowDown, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import useDocumentStore from '@/utils/useDocumentStore'
import { useDocumentValidation } from '@/utils/useDocumentStoreUpdater'
import { Alert } from '@heroui/react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  applyStatusToProductVersion,
  applyStatusToVulnerability,
  getMatrixCellStatus,
  hasVulnerabilityMatrixAssignment,
  matrixProductStatuses,
  TMatrixProductStatusValue,
  updateVulnerabilityProductStatus,
} from './utils/productMatrix'

export default function ProductMatrix() {
  useDocumentValidation()

  const { t } = useTranslation()
  const vulnerabilities = useDocumentStore((state) => state.vulnerabilities)
  const updateVulnerabilities = useDocumentStore(
    (state) => state.updateVulnerabilities,
  )
  const { getSelectableRefs } = useProductTreeBranch()

  const productVersions = useMemo(
    () =>
      getSelectableRefs().map((ref) => ({
        id: ref.full_product_name.product_id,
        name: ref.full_product_name.name,
        category: ref.category,
      })),
    [getSelectableRefs],
  )

  const groupedProductVersions = useMemo(() => {
    const groups = new Map<string, typeof productVersions>()
    if (productVersions.some((p) => p.category === 'product_version')) {
      groups.set('product_version', [])
    }
    for (const item of productVersions) {
      if (!groups.has(item.category)) groups.set(item.category, [])
      groups.get(item.category)!.push(item)
    }
    return groups
  }, [productVersions])

  const setCellStatus = (
    productId: string,
    vulnerabilityIndex: number,
    status: TMatrixProductStatusValue,
  ) => {
    updateVulnerabilities(
      vulnerabilities.map((vulnerability, index) =>
        index === vulnerabilityIndex
          ? updateVulnerabilityProductStatus(vulnerability, productId, status)
          : vulnerability,
      ),
    )
  }

  const applyCellToRow = (productId: string, vulnerabilityIndex: number) => {
    const vulnerability = vulnerabilities[vulnerabilityIndex]

    if (!vulnerability) {
      return
    }

    const cellStatus = getMatrixCellStatus(vulnerability, productId)
    updateVulnerabilities(
      applyStatusToProductVersion(vulnerabilities, productId, cellStatus),
    )
  }

  const applyCellToColumn = (productId: string, vulnerabilityIndex: number) => {
    const vulnerability = vulnerabilities[vulnerabilityIndex]

    if (!vulnerability) {
      return
    }

    const cellStatus = getMatrixCellStatus(vulnerability, productId)
    const productIds = productVersions.map((p) => p.id)

    updateVulnerabilities(
      vulnerabilities.map((currentVulnerability, index) =>
        index === vulnerabilityIndex
          ? applyStatusToVulnerability(
              currentVulnerability,
              productIds,
              cellStatus,
            )
          : currentVulnerability,
      ),
    )
  }

  const hasMatrixData = productVersions.length > 0 && vulnerabilities.length > 0
  const firstProductVersionId = productVersions[0]?.id

  return (
    <WizardStep
      title={t('vulnerabilities.matrix.title')}
      progress={3}
      onBack="/vulnerabilities/list"
      onContinue="/tracking"
    >
      <p className="text-default-500 text-sm">
        {t('vulnerabilities.matrix.description')}
      </p>

      {!hasMatrixData && (
        <Alert color="warning">{t('vulnerabilities.matrix.empty')}</Alert>
      )}

      {hasMatrixData && (
        <div className="border-default-200 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="bg-content2">
                <th className="border-default-200 w-72 max-w-sm border p-3 text-left">
                  {t('vulnerabilities.matrix.productVersion')}
                </th>
                {vulnerabilities.map((vulnerability, vulnerabilityIndex) => (
                  <th
                    key={vulnerability.id}
                    className="border-default-200 min-w-56 border p-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <VulnerabilityHeader
                        vulnerabilityIndex={vulnerabilityIndex}
                        cve={vulnerability.cve}
                        title={vulnerability.title}
                        isMissing={
                          !hasVulnerabilityMatrixAssignment(vulnerability)
                        }
                      />

                      {firstProductVersionId && (
                        <button
                          type="button"
                          className="border-default-300 bg-content2 hover:bg-content3 text-default-700 flex h-7 shrink-0 items-center gap-1 rounded border px-2 text-[10px] font-medium"
                          aria-label={t('vulnerabilities.matrix.applyColumn')}
                          title={t('vulnerabilities.matrix.applyColumn')}
                          data-testid={`matrix-apply-column-header-${vulnerabilityIndex}`}
                          onClick={() =>
                            applyCellToColumn(
                              firstProductVersionId,
                              vulnerabilityIndex,
                            )
                          }
                        >
                          <span>{t('vulnerabilities.matrix.applyFirst')}</span>
                          <FontAwesomeIcon icon={faArrowDown} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from(groupedProductVersions.entries()).flatMap(
                ([category, items]) => [
                  <tr key={`group-${category}`} className="bg-content2">
                    <th
                      colSpan={vulnerabilities.length + 1}
                      className="border-default-200 text-default-500 border px-3 py-1.5 text-left text-xs font-semibold tracking-wide uppercase"
                    >
                      {t(`products.relationship.categories.${category}`)}
                    </th>
                  </tr>,
                  ...items.map((productVersion, rowIndex) => (
                    <tr key={productVersion.id}>
                      <th className="border-default-200 bg-content1 w-72 max-w-sm border p-3 text-left align-top font-medium">
                        <div className="flex items-start justify-between gap-2">
                          <span>{productVersion.name}</span>
                          <button
                            type="button"
                            className="border-default-300 bg-content2 hover:bg-content3 text-default-700 flex h-7 shrink-0 items-center gap-1 rounded border px-2 text-[10px] font-medium"
                            aria-label={t('vulnerabilities.matrix.applyRow')}
                            title={t('vulnerabilities.matrix.applyRow')}
                            data-testid={`matrix-apply-row-header-${rowIndex}`}
                            onClick={() => applyCellToRow(productVersion.id, 0)}
                          >
                            <span>
                              {t('vulnerabilities.matrix.applyFirst')}
                            </span>
                            <FontAwesomeIcon icon={faArrowRight} />
                          </button>
                        </div>
                      </th>

                      {vulnerabilities.map(
                        (vulnerability, vulnerabilityIndex) => {
                          const cellStatus = getMatrixCellStatus(
                            vulnerability,
                            productVersion.id,
                          )

                          return (
                            <td
                              key={vulnerability.id}
                              className="border-default-200 border p-2 align-top"
                            >
                              <div className="w-full">
                                <select
                                  aria-label={`matrix-cell-${rowIndex}-${vulnerabilityIndex}`}
                                  data-testid={`matrix-cell-${rowIndex}-${vulnerabilityIndex}`}
                                  className="border-default-300 bg-content1 w-full rounded-md border px-2 py-2"
                                  value={cellStatus}
                                  onChange={(event) =>
                                    setCellStatus(
                                      productVersion.id,
                                      vulnerabilityIndex,
                                      event.target
                                        .value as TMatrixProductStatusValue,
                                    )
                                  }
                                >
                                  <option value="" />
                                  {matrixProductStatuses.map((status) => (
                                    <option key={status} value={status}>
                                      {t(
                                        `vulnerabilities.products.status.${status}`,
                                      )}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          )
                        },
                      )}
                    </tr>
                  )),
                ],
              )}
            </tbody>
          </table>
        </div>
      )}
    </WizardStep>
  )
}

function VulnerabilityHeader({
  vulnerabilityIndex,
  cve,
  title,
  isMissing,
}: {
  vulnerabilityIndex: number
  cve?: string
  title?: string
  isMissing?: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-1">
      <span
        className="font-semibold"
        data-testid={`matrix-vulnerability-label-${vulnerabilityIndex}`}
      >
        {cve ||
          t('vulnerabilities.matrix.vulnerabilityFallback', {
            index: vulnerabilityIndex + 1,
          })}
        {isMissing && (
          <span
            className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700"
            data-testid={`matrix-vulnerability-missing-${vulnerabilityIndex}`}
          >
            {t('vulnerabilities.matrix.required')}
          </span>
        )}
      </span>
      {title && <span className="text-default-500 text-xs">{title}</span>}
    </div>
  )
}
