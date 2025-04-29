import { TProductTreeBranchProductType } from './types/tProductTreeBranch'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import ProductCard from './components/ProductCard'

export type ProductListProps = {
  productType: TProductTreeBranchProductType
}

export default function ProductList({ productType }: ProductListProps) {
  const { getPTBsByCategory } = useProductTreeBranch()
  const products = getPTBsByCategory('product_name')

  return (
    <div className="flex flex-col items-stretch gap-2">
      {products
        .filter((product) => product.type === productType)
        .map((product) => (
          <ProductCard key={product.id} product={product} />
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
