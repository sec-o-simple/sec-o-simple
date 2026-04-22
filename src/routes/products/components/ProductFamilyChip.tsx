import { Chip } from '@heroui/react'
import { useNavigate } from 'react-router'
import { getFamilyChain } from '../ProductFamily'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { TProductTreeBranch } from '../types/tProductTreeBranch'

export function ProductFamilyChip({
  product,
}: {
  product: TProductTreeBranch
}) {
  const navigate = useNavigate()
  const { families } = useProductTreeBranch()

  if (!product.familyId) return null

  const family = families.find((f) => f.id === product.familyId)
  if (!family) return null

  return (
    <Chip
      radius="md"
      color="primary"
      variant="flat"
      className="cursor-pointer hover:underline"
      onClick={() => navigate('/products/families/')}
    >
      {getFamilyChain(family)
        .map((f) => f.name)
        .join(' / ')}
    </Chip>
  )
}
