import AddItemButton from '@/components/forms/AddItemButton'
import VSplit from '@/components/forms/VSplit'
import { useListState } from '@/utils/useListState'
import { useEffect } from 'react'
import VulnerabilityProduct from './components/VulnerabilityProduct'
import { TVulnerability } from './types/tVulnerability'
import {
  getDefaultVulnerabilityProduct,
  TVulnerabilityProduct,
} from './types/tVulnerabilityProduct'

export default function Products({
  vulnerability,
  onChange,
}: {
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  onChange: (vulnerability: TVulnerability) => void
}) {
  const productsListState = useListState<TVulnerabilityProduct>({
    initialData: vulnerability.products,
    generator: getDefaultVulnerabilityProduct,
  })

  useEffect(
    () => onChange({ ...vulnerability, products: productsListState.data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productsListState.data],
  )

  return (
    <VSplit className="gap-2">
      {productsListState.data.map((vulnerabilityProduct) => (
        <VulnerabilityProduct
          key={vulnerabilityProduct.id}
          vulnerabilityProduct={vulnerabilityProduct}
          onChange={productsListState.updateDataEntry}
          onDelete={productsListState.removeDataEntry}
        />
      ))}
      <AddItemButton
        onPress={() => {
          productsListState.setData((prev) => [
            ...prev,
            {
              ...getDefaultVulnerabilityProduct(),
              productId:
                productsListState.data[productsListState.data.length - 1]
                  ?.productId,
            },
          ])
        }}
        className="w-full"
      />
    </VSplit>
  )
}
