import { useListState } from '@/utils/useListState'
import { TProductTreeBranch } from './Products'
import ComponentList from '@/components/forms/ComponentList'
import BranchForm from './BranchForm'
import { uid } from 'uid'
import ProductnameList from './ProductnameList'

export default function VendorList() {
  const vendorListState = useListState<TProductTreeBranch>({
    generator: () => ({
      id: uid(),
      category: 'vendor',
      name: '',
      description: '',
      subBranches: [],
    }),
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
