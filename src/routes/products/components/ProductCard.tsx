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

export type ProductCardProps = Partial<InfoCardProps> & {
  product: TProductTreeBranch
}

export default function ProductCard({ product, ...props }: ProductCardProps) {
  const { updatePTB, deletePTB } = useProductTreeBranch()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const navigate = useNavigate()

  return (
    <InfoCard
      variant="boxed"
      title={getPTBName(product)}
      linkTo={`product/${product.id}`}
      startContent={
        <Chip color="primary" variant="flat" radius="md" size="lg">
          {product.type}
        </Chip>
      }
      endContent={
        <IconButton
          icon={faCodeFork}
          onPress={() => navigate(`product/${product.id}`)}
        />
      }
      onEdit={onOpen}
      onDelete={() => deletePTB(product.id)}
      {...props}
    >
      {product.subBranches.length > 0 && (
        <TagList
          tags={product.subBranches.map((version) => getPTBName(version))}
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
