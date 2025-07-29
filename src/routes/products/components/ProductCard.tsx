import IconButton from '@/components/forms/IconButton'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { faCodeFork } from '@fortawesome/free-solid-svg-icons'
import { Chip } from '@heroui/chip'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { TProductTreeBranch, getPTBName } from '../types/tProductTreeBranch'
import InfoCard, { InfoCardProps } from './InfoCard'
import TagList from './TagList'

export type ProductCardProps = Partial<InfoCardProps> & {
  product: TProductTreeBranch
  openEditModal?: boolean
}

export default function ProductCard({
  product,
  onEdit,
  ...props
}: ProductCardProps) {
  const { t } = useTranslation()
  const { deletePTB, findProductTreeBranch } = useProductTreeBranch()
  const navigate = useNavigate()

  return (
    <InfoCard
      variant="boxed"
      title={
        getPTBName(product) ?? t(`untitled.${product.category?.toLowerCase()}`)
      }
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
      {product.subBranches.length > 0 && (
        <TagList
          items={product.subBranches}
          linkGenerator={(version) =>
            `/product-management/version/${version.id}`
          }
          labelGenerator={(x) =>
            getPTBName(findProductTreeBranch(x.id)) ??
            t('untitled.product_version')
          }
        />
      )}
    </InfoCard>
  )
}
