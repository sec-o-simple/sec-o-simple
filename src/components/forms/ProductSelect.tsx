import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { SelectItem } from '@heroui/select'
import { useTranslation } from 'react-i18next'
import Select from './Select'

export type ProductSelectProps = {
  onAdd?: (product: TProductTreeBranch) => void
  isRequired?: boolean
  selected?: string[]
}

export default function ProductSelect({
  onAdd,
  isRequired,
  selected = [],
}: ProductSelectProps) {
  const { getSelectablePTBs } = useProductTreeBranch()
  const ptbs = getSelectablePTBs()
  const { t } = useTranslation()

  return (
    <Select
      placeholder={t('common.add', {
        label: t('products.product.label') as string,
      })}
      selectedKeys={[]}
      onSelectionChange={(selected) => {
        const productId = [...selected][0] as string
        const ptb = ptbs.find((x) => x.id === productId)
        if (ptb) {
          onAdd?.(ptb)
        }
      }}
      isRequired={isRequired}
    >
      {ptbs
        .filter((p) => !selected.includes(p.id))
        .map((p) => (
          <SelectItem key={p.id}>{p.name}</SelectItem>
        ))}
    </Select>
  )
}
