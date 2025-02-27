import { useListState } from '@/utils/useListState'
import { TProductTreeBranch } from './Products'
import ComponentList from '@/components/forms/ComponentList'
import BranchForm from './BranchForm'
import { useEffect } from 'react'
import { uid } from 'uid'

export default function VersionList({
  versions,
  onChange,
}: {
  versions: TProductTreeBranch[]
  onChange: (updatedBranches: TProductTreeBranch[]) => void
}) {
  const versionListState = useListState<TProductTreeBranch>({
    initialData: versions,
    generator: () => ({
      id: uid(),
      category: 'product_version',
      name: '',
      description: '',
      subBranches: [],
    }),
  })

  useEffect(
    () => onChange(versionListState.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versionListState.data],
  )

  return (
    <ComponentList
      listState={versionListState}
      title="name"
      content={(branch) => (
        <BranchForm
          branch={branch}
          onChange={versionListState.updateDataEntry}
          nameLabel="Product version"
        />
      )}
    />
  )
}
