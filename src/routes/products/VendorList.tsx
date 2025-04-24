import { useListState } from '@/utils/useListState'
import ComponentList from '@/components/forms/ComponentList'
import {
  TProductTreeBranch,
  getDefaultProductTreeBranch,
} from './types/tProductTreeBranch'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import ProductCard from './components/ProductCard'

export default function VendorList() {
  const vendorListState = useListState<TProductTreeBranch>({
    generator: () => getDefaultProductTreeBranch('vendor'),
  })

  useDocumentStoreUpdater({
    localState: vendorListState.data,
    valueField: 'products',
    valueUpdater: 'updateProducts',
    init: (initialData) => {
      vendorListState.setData(Object.values(initialData))
    },
  })

  return (
    <ComponentList
      listState={vendorListState}
      title="name"
      titleProps={{ className: 'font-bold' }}
      endContent={(item) => (
        <div className="text-neutral-foreground">{item.description}</div>
      )}
      content={(vendor) =>
        vendor.subBranches.map((product) => (
          <ProductCard
            key={product.id}
            className="border-t py-2"
            product={product}
            variant="plain"
          />
        ))
      }
    />
  )
}
