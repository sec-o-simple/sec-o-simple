import IconButton from '@/components/forms/IconButton'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { faCircleInfo, faCodeFork } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Chip } from '@heroui/chip'
import { Tooltip } from '@heroui/react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { TProductTreeBranch } from '../types/tProductTreeBranch'
import InfoCard, { InfoCardProps } from './InfoCard'
import TagList from './TagList'

export type ProductCardProps = Partial<InfoCardProps> & {
  product: TProductTreeBranch
  openEditModal?: boolean
  chips?: ReactNode
}

export default function ProductCard({
  product,
  onEdit,
  chips,
  ...props
}: ProductCardProps) {
  const { t } = useTranslation()
  const { deletePTB, getPTBName } = useProductTreeBranch()
  const navigate = useNavigate()
  const { name } = getPTBName(product)

  return (
    <InfoCard
      variant="boxed"
      title={name ?? t('untitled.product_version')}
      description={product.description}
      linkTo={`product/${product.id}`}
      startContent={
        <Chip color="primary" variant="flat" radius="md" size="lg">
          {product.type ?? t('products.unknownType')}
        </Chip>
      }
      endContent={
        <IconButton
          icon={faCodeFork}
          tooltip={t('products.product.version.edit', {
            count: 2,
          })}
          onPress={() => navigate(`product/${product.id}`)}
        />
      }
      onEdit={onEdit}
      onDelete={() => deletePTB(product.id)}
      {...props}
    >
      <div className="flex flex-row gap-2">
        {chips}
        {product.subBranches.length > 0 && (
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
    </InfoCard>
  )
}
