import AddItemButton from '@/components/forms/AddItemButton'
import { useListState } from '@/utils/useListState'
import { useEffect } from 'react'
import VulnerabilityProduct from './components/VulnerabilityProduct'
import { TVulnerability } from './types/tVulnerability'
import {
  TVulnerabilityProduct,
  getDefaultVulnerabilityProduct,
} from './types/tVulnerabilityProduct'

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
        <thead className="border-b-1 [&>th]:py-2 [&>th]:text-left [&>th]:text-gray [&>th]:font-normal [&_th]:px-2">
          <th>Product name</th>
          <th>First affected version</th>
          <th>First fixed version</th>
          <th></th>
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
