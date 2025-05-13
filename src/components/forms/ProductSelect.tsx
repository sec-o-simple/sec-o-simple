import { SelectItem } from '@heroui/select'
import Select from './Select'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'

export type ProductSelectProps = {
  onAdd?: (product: TProductTreeBranch) => void
}

export default function ProductSelect({ onAdd }: ProductSelectProps) {
  const { getSelectablePTBs } = useProductTreeBranch()
  const ptbs = getSelectablePTBs()

  return (
    <Select
      placeholder="Add Product"
      selectedKeys={[]}
      onSelectionChange={(selected) => {
        const productId = [...selected][0] as string
        const ptb = ptbs.find((x) => x.id === productId)
        if (ptb) {
          onAdd?.(ptb)
        }
      }}
    >
      {ptbs.map((p) => (
        <SelectItem key={p.id}>{p.name}</SelectItem>
      ))}
    </Select>
  )
}
