import { Chip } from '@heroui/chip'
import { TProductTreeBranch, getPTBName } from '../types/tProductTreeBranch'
import InfoCard, { InfoCardProps } from './InfoCard'
import TagList from './TagList'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { Modal, useDisclosure } from '@heroui/modal'
import { PTBEditForm } from './PTBEditForm'
import IconButton from '@/components/forms/IconButton'
import { faCodeFork } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

export type ProductCardProps = Partial<InfoCardProps> & {
  product: TProductTreeBranch
}

export default function ProductCard({ product, ...props }: ProductCardProps) {
  const { t } = useTranslation()
  const { updatePTB, deletePTB } = useProductTreeBranch()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const navigate = useNavigate()

  return (
    <InfoCard
      variant="boxed"
      title={
        getPTBName(product) ?? t(`untitled.${product.category?.toLowerCase()}`)
      }
      linkTo={`product/${product.id}`}
      startContent={
        <Chip color="primary" variant="flat" radius="md" size="lg">
          {product.type}
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
          items={product.subBranches.map(
            (version) => getPTBName(version) ?? t('untitled.product_version'),
          )}
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
