import IconButton from '@/components/forms/IconButton'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import {
  faAdd,
  faChevronDown,
  faChevronRight,
  faCircleInfo,
  faCodeFork,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Tooltip } from '@heroui/react'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { TProductTreeBranch } from '../types/tProductTreeBranch'
import InfoCard, { InfoCardProps } from './InfoCard'
import TagList from './TagList'

export type ProductCardProps = Partial<InfoCardProps> & {
  product: TProductTreeBranch
  openEditModal?: boolean
  chips?: ReactNode
  showVersionTags?: boolean
  showVersionPanel?: boolean
  showVersionRelationshipAction?: boolean
  showAddVersionButton?: boolean
  versionsHeaderLabel?: string
  onAddVersion?: () => void
  onEditVersion?: (version: TProductTreeBranch) => void
  onDeleteVersion?: (version: TProductTreeBranch) => void
  showProductPageLink?: boolean
  initiallyExpandVersions?: boolean
}

export default function ProductCard({
  product,
  onEdit,
  chips,
  showVersionTags = true,
  showVersionPanel = false,
  showVersionRelationshipAction = false,
  showAddVersionButton = false,
  versionsHeaderLabel,
  onAddVersion,
  onEditVersion,
  onDeleteVersion,
  showProductPageLink = true,
  initiallyExpandVersions = false,
  ...props
}: ProductCardProps) {
  const { t } = useTranslation()
  const { deletePTB, getPTBName } = useProductTreeBranch()
  const navigate = useNavigate()
  const { name } = getPTBName(product)
  const [isVersionsExpanded, setIsVersionsExpanded] = useState(
    initiallyExpandVersions,
  )
  const versionsLabel =
    versionsHeaderLabel ?? t('products.product.version.label_plural')

  return (
    <InfoCard
      variant="boxed"
      title={name ?? t('untitled.product_version')}
      description={product.description}
      linkTo={showProductPageLink ? `product/${product.id}` : undefined}
      startContent={
        <Chip color="primary" variant="flat" radius="md" size="lg">
          {product.type ?? t('products.unknownType')}
        </Chip>
      }
      className="gap-1"
      endContent={
        showProductPageLink ? (
          <IconButton
            icon={faCodeFork}
            tooltip={t('products.product.version.edit', {
              count: 2,
            })}
            onPress={() => navigate(`product/${product.id}`)}
          />
        ) : undefined
      }
      onEdit={onEdit}
      onDelete={() => deletePTB(product.id)}
      {...props}
    >
      <div className="flex flex-row gap-2">
        {chips}
        {showVersionTags &&
          !showVersionPanel &&
          product.subBranches.length > 0 && (
            <TagList
              items={product.subBranches}
              linkGenerator={(version) =>
                `/products/management/version/${version.id}`
              }
              labelGenerator={(x) => {
                const { name, isReadonly, readonlyReason } = getPTBName(x)
                const displayName = name ?? t('untitled.product_version')
                const readonlyReasonText =
                  isReadonly && readonlyReason
                    ? t(`product_version.readonly_reason.${readonlyReason}`)
                    : undefined

                return (
                  <span className="flex items-center gap-1">
                    <span>{displayName}</span>
                    {readonlyReasonText && (
                      <Tooltip showArrow content={readonlyReasonText}>
                        <span
                          className="inline-flex text-zinc-500"
                          aria-label={readonlyReasonText}
                        >
                          <FontAwesomeIcon icon={faCircleInfo} size="sm" />
                        </span>
                      </Tooltip>
                    )}
                  </span>
                )
              }}
            />
          )}
      </div>

      {showVersionPanel && (
        <div className="border-default-200 bg-default-50 mt-2 rounded-md border p-3">
          <Button
            variant="light"
            className="h-auto w-full justify-between px-1 py-1"
            onClick={() => setIsVersionsExpanded((prev) => !prev)}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
              <FontAwesomeIcon
                icon={isVersionsExpanded ? faChevronDown : faChevronRight}
                size="sm"
              />
              {versionsLabel}
            </span>
            <span className="text-xs text-zinc-500">
              ({product.subBranches.length})
            </span>
          </Button>

          {isVersionsExpanded && (
            <div className="mt-2 flex flex-col gap-2">
              {product.subBranches.map((version) => (
                <InfoCard
                  key={version.id}
                  title={
                    getPTBName(version).name ?? t('untitled.product_version')
                  }
                  variant="boxed"
                  onEdit={
                    onEditVersion ? () => onEditVersion(version) : undefined
                  }
                  onDelete={
                    onDeleteVersion ? () => onDeleteVersion(version) : undefined
                  }
                  endContent={
                    showVersionRelationshipAction ? (
                      <IconButton
                        icon={faCodeFork}
                        tooltip={t('products.relationship.edit', {
                          count: 2,
                        })}
                        onPress={() =>
                          navigate(`/products/management/version/${version.id}`)
                        }
                      />
                    ) : undefined
                  }
                />
              ))}

              {showAddVersionButton && (
                <Button
                  variant="bordered"
                  className="border-primary text-primary w-full border-dashed"
                  startContent={<FontAwesomeIcon icon={faAdd} />}
                  onClick={onAddVersion}
                >
                  {t('common.add', {
                    label: t('products.product.version.label'),
                  })}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </InfoCard>
  )
}
