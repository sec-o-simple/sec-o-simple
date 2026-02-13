import AddItemButton from '@/components/forms/AddItemButton'
import VSplit from '@/components/forms/VSplit'
import { useListState } from '@/utils/useListState'
import { useFieldValidation } from '@/utils/validation/useFieldValidation'
import { Alert } from '@heroui/react'
import { useEffect } from 'react'
import VulnerabilityProduct from './components/VulnerabilityProduct'
import { TVulnerability } from './types/tVulnerability'
import {
  TVulnerabilityProduct,
  useVulnerabilityProductGenerator,
} from './types/tVulnerabilityProduct'

export default function Products({
  vulnerability,
  vulnerabilityIndex,
  onChange,
}: {
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  onChange: (vulnerability: TVulnerability) => void
}) {
  const { generateVulnerabilityProduct } = useVulnerabilityProductGenerator()
  const productsListState = useListState<TVulnerabilityProduct>({
    initialData: vulnerability.products,
    generator: generateVulnerabilityProduct(),
  })

  useEffect(
    () => onChange({ ...vulnerability, products: productsListState.data }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productsListState.data],
  )

  const validation = useFieldValidation(
    `/vulnerabilities/${vulnerabilityIndex}/product_status`,
  )

  // for each productsListState.data, we want the index of the product grouped by the status
  // e.g. the first known_affected product has index 0, the second known_affected product has index 1, etc.
  // this is needed to construct the correct csafPath for each VulnerabilityProduct component
  const productsByStatus: Map<string, string[]> = new Map()
  productsListState.data.forEach((product) => {
    if (!productsByStatus.has(product.status)) {
      productsByStatus.set(product.status, [])
    }
    productsByStatus.get(product.status)?.push(product.id)
  })

  return (
    <VSplit className="gap-2 rounded-lg border border-gray-200 p-4">
      {validation.hasErrors && (
        <Alert color="danger">
          {validation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}

      {productsListState.data.map((vulnerabilityProduct) => {
        const statusGroup = productsByStatus.get(vulnerabilityProduct.status)
        const statusIndex = statusGroup?.indexOf(vulnerabilityProduct.id) ?? 0

        return (
          <VulnerabilityProduct
            key={vulnerabilityProduct.id}
            vulnerabilityProduct={vulnerabilityProduct}
            csafPath={`/vulnerabilities/${vulnerabilityIndex}/product_status/${vulnerabilityProduct.status}/${statusIndex}`}
            onChange={productsListState.updateDataEntry}
            onDelete={productsListState.removeDataEntry}
          />
        )
      })}
      <AddItemButton
        onPress={() => {
          productsListState.setData((prev) => [
            ...prev,
            {
              ...generateVulnerabilityProduct(),
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
