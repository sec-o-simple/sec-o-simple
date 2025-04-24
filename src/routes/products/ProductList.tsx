import { TProductTreeBranch } from './types/tProductTreeBranch'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import ProductCard from './components/ProductCard'

export type ProductListProps = {
  filter: (product: TProductTreeBranch) => boolean
}

export default function ProductList({ filter }: ProductListProps) {
  const { getPTBsByCategory } = useProductTreeBranch()
  const products = getPTBsByCategory('product_name')

  return (
    <>
      {products.map(
        (product) =>
          filter(product) && <ProductCard key={product.id} product={product} />,
      )}
    </>
  )
}
