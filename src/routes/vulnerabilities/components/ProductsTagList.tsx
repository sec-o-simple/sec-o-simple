import ProductSelect from '@/components/forms/ProductSelect'
import VSplit from '@/components/forms/VSplit'
import TagList from '@/routes/products/components/TagList'
import {
  TProductTreeBranchWithParents,
  getFullPTBName,
} from '@/routes/products/types/tProductTreeBranch'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type ProductsTagListProps = {
  products?: string[]
  onChange?: (productIds: string[]) => void
  error?: string
  isRequired?: boolean
}

export default function ProductsTagList({
  products,
  onChange,
  error,
  isRequired,
}: ProductsTagListProps) {
  const { t } = useTranslation()
  const { findProductTreeBranchWithParents } = useProductTreeBranch()

  const initialProducts =
    (products
      ?.map((x) => findProductTreeBranchWithParents(x))
      .filter((x) => x !== undefined) as TProductTreeBranchWithParents[]) ?? []

  const [selectedProducts, setSelectedProducts] = useState(initialProducts)

  useEffect(() => {
    onChange?.(selectedProducts.map((x) => x.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedProducts)])

  return (
    <VSplit className="gap-2">
      <span className="text-sm">
        {t('vulnerabilities.products.title')} {isRequired ? '*' : ''}
      </span>
      <ProductSelect
        isRequired={isRequired}
        selected={selectedProducts.map((x) => x.id)}
        onAdd={(ptb) =>
          setSelectedProducts([
            ...new Set([
              ...selectedProducts,
              findProductTreeBranchWithParents(
                ptb.id,
              ) as TProductTreeBranchWithParents,
            ]),
          ])
        }
      />
      {selectedProducts.length > 0 && (
        <TagList
          items={selectedProducts}
          labelGenerator={(x) => getFullPTBName(x)}
          onRemove={(ptb) =>
            setSelectedProducts(selectedProducts.filter((x) => x.id !== ptb.id))
          }
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
