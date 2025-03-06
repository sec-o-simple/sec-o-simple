import { useListState } from '@/utils/useListState'
import ComponentList from '@/components/forms/ComponentList'
import BranchForm from './BranchForm'
import ProductnameList from './ProductnameList'
import {
  TProductTreeBranch,
  getDefaultProductTreeBranch,
} from './types/tProductTreeBranch'
import useAppStoreUpdater from '@/utils/useAppStoreUpdater'

export default function VendorList() {
  const vendorListState = useListState<TProductTreeBranch>({
    generator: () => getDefaultProductTreeBranch('vendor'),
  })

  useAppStoreUpdater({
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
      content={(branch) => (
        <BranchForm
          branch={branch}
          onChange={vendorListState.updateDataEntry}
          nameLabel="Vendor"
        >
          <ProductnameList
            productNames={branch.subBranches}
            onChange={(updatedBranches) =>
              vendorListState.updateDataEntry({
                ...branch,
                subBranches: updatedBranches,
              })
            }
          />
        </BranchForm>
      )}
    />
  )
}
