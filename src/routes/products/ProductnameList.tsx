import { useListState } from '@/utils/useListState'
import ComponentList from '@/components/forms/ComponentList'
import BranchForm from './BranchForm'
import { useEffect } from 'react'
import VersionList from './VersionList'
import {
  TProductTreeBranch,
  getDefaultProductTreeBranch,
} from './types/tProductTreeBranch'

export default function ProductnameList({
  productNames,
  onChange,
}: {
  productNames: TProductTreeBranch[]
  onChange: (updatedBranches: TProductTreeBranch[]) => void
}) {
  const productnameListState = useListState<TProductTreeBranch>({
    initialData: productNames,
    generator: () => getDefaultProductTreeBranch('product_name'),
  })

  useEffect(
    () => onChange(productnameListState.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productnameListState.data],
  )

  return (
    <ComponentList
      listState={productnameListState}
      title="name"
      content={(branch) => (
        <BranchForm
          branch={branch}
          onChange={productnameListState.updateDataEntry}
          nameLabel="Product name"
        >
          <VersionList
            versions={branch.subBranches}
            onChange={(updatedBranches) =>
              productnameListState.updateDataEntry({
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
