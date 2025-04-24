import { Chip } from '@heroui/chip'
import { TProductTreeBranch } from '../types/tProductTreeBranch'
import InfoCard, { InfoCardProps } from './InfoCard'
import TagList from './TagList'

export type ProductCardProps = Partial<InfoCardProps> & {
  product: TProductTreeBranch
}

export default function ProductCard({ product, ...props }: ProductCardProps) {
  return (
    <InfoCard
      variant="boxed"
      title={product.name}
      linkTo={`product/${product.id}`}
      startContent={
        <Chip color="primary" variant="flat" radius="md" size="lg">
          {product.type}
        </Chip>
      }
      {...props}
    >
      <TagList tags={product.subBranches.map((version) => version.name)} />
    </InfoCard>
  )
}
