import { useListState } from '@/utils/useListState'
import {
  TVulnerabilityProduct,
  getDefaultVulnerabilityProduct,
} from './types/tVulnerabilityProduct'
import { TVulnerability } from './types/tVulnerability'
import { useEffect } from 'react'
import VulnerabilityProduct from './components/VulnerabilityProduct'
import AddItemButton from '@/components/forms/AddItemButton'

export default function Products({
  vulnerability,
  onChange,
}: {
  vulnerability: TVulnerability
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
    <>
      <table className="w-full [&_td]:p-2">
        <thead className="text-neutral-foreground [&>th]:bg-content3 [&>th]:py-2 [&>th]:text-left [&_th]:px-2">
          <th className="rounded-l-lg">Product name</th>
          <th>First affected version</th>
          <th>First fixed version</th>
          <th className="rounded-r-lg"></th>
        </thead>
        <tbody>
          {productsListState.data.map((vulnerabilityProduct) => (
            <VulnerabilityProduct
              key={vulnerabilityProduct.id}
              vulnerabilityProduct={vulnerabilityProduct}
              onChange={productsListState.updateDataEntry}
              onDelete={productsListState.removeDataEntry}
            />
          ))}
          <tr>
            <td colSpan={4}>
              <AddItemButton
                onPress={productsListState.addDataEntry}
                className="w-full"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}
