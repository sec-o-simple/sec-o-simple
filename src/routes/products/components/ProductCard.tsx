import { Chip } from '@heroui/chip'
import { TProductTreeBranch, getPTBName } from '../types/tProductTreeBranch'
import InfoCard, { InfoCardProps } from './InfoCard'
import TagList from './TagList'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { Modal, useDisclosure } from '@heroui/modal'
import { PTBEditForm } from './PTBEditForm'

export type ProductCardProps = Partial<InfoCardProps> & {
  product: TProductTreeBranch
}

export default function ProductCard({ product, ...props }: ProductCardProps) {
  const { updatePTB, deletePTB } = useProductTreeBranch()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

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
      onEdit={onOpen}
      onDelete={() => deletePTB(product.id)}
      {...props}
    >
      <TagList
        tags={product.subBranches.map((version) => getPTBName(version))}
      />
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
