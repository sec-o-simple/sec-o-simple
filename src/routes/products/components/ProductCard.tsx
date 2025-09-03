import IconButton from '@/components/forms/IconButton'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { faCodeFork } from '@fortawesome/free-solid-svg-icons'
import { Chip } from '@heroui/chip'
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
            labelGenerator={(x) =>
              getPTBName(x).name ?? t('untitled.product_version')
            }
          />
        )}
      </div>
    </InfoCard>
  )
}
