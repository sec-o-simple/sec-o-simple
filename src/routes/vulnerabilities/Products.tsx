import AddItemButton from '@/components/forms/AddItemButton'
import { useListState } from '@/utils/useListState'
import { useEffect } from 'react'
import VulnerabilityProduct from './components/VulnerabilityProduct'
import { TVulnerability } from './types/tVulnerability'
import {
  TVulnerabilityProduct,
  getDefaultVulnerabilityProduct,
} from './types/tVulnerabilityProduct'
import { useTranslation } from 'react-i18next'

export default function Products({
  vulnerability,
  onChange,
}: {
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  onChange: (vulnerability: TVulnerability) => void
}) {
  const { t } = useTranslation()
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
        <thead className="border-b-1 [&>th]:p-2 [&>th]:text-left [&>th]:font-normal [&>th]:text-gray">
          <th>{t('products.product.name')}</th>
          <th>{t('products.product.version.affected')}</th>
          <th>{t('products.product.version.fixed')}</th>
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
