import ProductSelect from '@/components/forms/ProductSelect'
import VSplit from '@/components/forms/VSplit'
import TagList from '@/routes/products/components/TagList'
import {
  TSelectableFullProductName,
  useProductTreeBranch,
} from '@/utils/useProductTreeBranch'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type ProductsTagListProps = {
  products?: TSelectableFullProductName[]
  selected?: string[]
  onChange?: (productIds: string[]) => void
  error?: string
  isRequired?: boolean
  description?: string
}

export default function ProductsTagList({
  products,
  selected,
  onChange,
  error,
  isRequired,
  description,
}: ProductsTagListProps) {
  const { t } = useTranslation()
  const { getSelectableRefs } = useProductTreeBranch()
  const selectableRefs = getSelectableRefs()

  const initialProducts =
    selected
      ?.map((x) =>
        selectableRefs.find((ptb) => ptb.full_product_name.product_id === x),
      )
      .filter((x) => x !== undefined) ?? []

  const [selectedProducts, setSelectedProducts] = useState(
    initialProducts ?? [],
  )

  useEffect(() => {
    onChange?.(selectedProducts.map((x) => x?.full_product_name.product_id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedProducts)])

  return (
    <VSplit className="gap-2">
      <span className="text-sm">
        {t('vulnerabilities.products.title')} {isRequired ? '*' : ''}
      </span>
      <ProductSelect
        description={description}
        products={products}
        isRequired={isRequired}
        selected={selectedProducts.map((x) => x.full_product_name.product_id)}
        onAdd={(ptb) => {
          console.log('Adding product', ptb)
          setSelectedProducts([...new Set([...selectedProducts, ptb])])
        }}
      />
      {selectedProducts.length > 0 && (
        <TagList
          items={selectedProducts}
          labelGenerator={(x) => x?.full_product_name.name}
          onRemove={(ptb) => {
            if (!ptb) return

            setSelectedProducts(
              selectedProducts.filter(
                (x) =>
                  x.full_product_name.product_id !==
                  ptb.full_product_name.product_id,
              ),
            )
          }}
        />
      )}
      {error && <span className="text-sm text-red-500">{error}</span>}
      {/* If no products are selected, show a message */}
      {selectedProducts.length === 0 && (
        <span className="text-center text-neutral-foreground">
          {t('vulnerabilities.remediation.products.empty')}
        </span>
      )}
    </VSplit>
  )
}
