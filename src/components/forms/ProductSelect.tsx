import { TSelectableFullProductName } from '@/utils/useProductTreeBranch'
import { AutocompleteItem } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { Autocomplete } from './Autocomplete'

export type ProductSelectProps = {
  products?: TSelectableFullProductName[]
  onAdd?: (product: TSelectableFullProductName) => void
  isRequired?: boolean
  selected?: string[]
  description?: string
}

export default function ProductSelect({
  products: ptbs = [],
  onAdd,
  isRequired,
  selected = [],
  description = '',
}: ProductSelectProps) {
  const { t } = useTranslation()

  return (
    <Autocomplete
      description={description}
      placeholder={t('common.add', {
        label: t('products.product.label') as string,
      })}
      onSelectionChange={(selected) => {
        const productId = selected as string
        const ptb = ptbs.find(
          (x) => x.full_product_name.product_id === productId,
        )
        if (ptb) {
          onAdd?.(ptb)
        }
      }}
      isRequired={isRequired}
    >
      {ptbs
        .filter((p) => !selected.includes(p.full_product_name.product_id))
        .map((p) => (
          <AutocompleteItem key={p.full_product_name.product_id}>
            {p.full_product_name.name}
          </AutocompleteItem>
        ))}
    </Autocomplete>
  )
}
