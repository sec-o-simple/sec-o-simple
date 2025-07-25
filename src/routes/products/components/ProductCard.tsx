import IconButton from '@/components/forms/IconButton'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { faCodeFork } from '@fortawesome/free-solid-svg-icons'
import { Chip } from '@heroui/chip'
import { Modal, useDisclosure } from '@heroui/modal'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { TProductTreeBranch, getPTBName } from '../types/tProductTreeBranch'
import InfoCard, { InfoCardProps } from './InfoCard'
import { PTBEditForm } from './PTBEditForm'
import TagList from './TagList'

export type ProductCardProps = Partial<InfoCardProps> & {
  product: TProductTreeBranch
  openEditModal?: boolean
}

export default function ProductCard({
  product,
  openEditModal,
  ...props
}: ProductCardProps) {
  const { t } = useTranslation()
  const { updatePTB, deletePTB, findProductTreeBranch } = useProductTreeBranch()
  const { isOpen, onOpen, onOpenChange } = useDisclosure({
    defaultOpen: openEditModal,
  })
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
      onEdit={onOpen}
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
      <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <PTBEditForm
          ptb={product}
          onSave={(ptb) => {
            updatePTB(ptb)
          }}
        />
      </Modal>
    </InfoCard>
  )
}
