import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { useTranslation } from 'react-i18next'
import ProductCard from './components/ProductCard'
import { ProductFamilyChip } from './Product'
import { TProductTreeBranchProductType } from './types/tProductTreeBranch'

export type ProductListProps = {
  productType: TProductTreeBranchProductType
}

export default function ProductList({ productType }: ProductListProps) {
  const { t } = useTranslation()
  const { getPTBsByCategory } = useProductTreeBranch()
  const products = getPTBsByCategory('product_name').filter(
    (product) => product.type === productType,
  )

  return (
    <div className="flex flex-col items-stretch gap-2">
      {products.length === 0 && (
        <div className="text-neutral-foreground text-center text-lg">
          <p>
            {t('products.empty', {
              type: productType,
            })}
          </p>
        </div>
      )}
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          chips={<ProductFamilyChip product={product} />}
        />
      ))}
      {/* Button will be added after products can be moved between vendors */}
      {/*<AddItemButton
        onPress={() => {
          addPTB({
            ...getDefaultProductTreeBranch('product_name'),
            type: productType,
          })
        }}
      />*/}
    </div>
  )
}
