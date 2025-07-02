import {
  TProductTreeBranch,
  TProductTreeBranchCategory,
} from '@/routes/products/types/tProductTreeBranch'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { SelectItem, SelectProps } from '@heroui/select'
import Select from './Select'
import { useTranslation } from 'react-i18next'

type PTBSelectBaseProps = Omit<
  SelectProps,
  'onSelect' | 'children' | 'selectionMode'
> & {
  selectionCategory: TProductTreeBranchCategory
  allowedIds?: string[]
}
type PTBSingleSelectProps = PTBSelectBaseProps & {
  selectionMode?: 'single'
  selectedId: string
  onSelect?: (ptb: TProductTreeBranch) => void
}
type PTBMultiSelectProps = PTBSelectBaseProps & {
  selectionMode: 'multiple'
  selectedIds: string[]
  onSelect?: (ptbs: TProductTreeBranch[]) => void
}

export type PTBSelectProps = PTBSingleSelectProps | PTBMultiSelectProps

export default function PTBSelect(props: PTBSelectProps) {
  const { t } = useTranslation()
  const {
    selectionMode,
    selectionCategory,
    allowedIds,
    onSelect,
    ...selectProps
  } = props

  const { getPTBsByCategory } = useProductTreeBranch()
  const ptbs = getPTBsByCategory(selectionCategory).filter(
    (x) => !allowedIds || allowedIds.includes(x.id),
  )

  return (
    <Select
      {...selectProps}
      selectionMode={selectionMode ?? 'single'}
      selectedKeys={
        selectionMode === 'multiple' ? props.selectedIds : [props.selectedId]
      }
      onSelectionChange={(selected) => {
        const ids = [...selected] as string[]
        const selectedPTBs = ids
          .map((id) => ptbs.find((x) => x.id === id))
          .filter((x) => !!x) as TProductTreeBranch[]

        if (selectionMode === 'multiple') {
          onSelect?.(selectedPTBs)
        } else {
          if (selectedPTBs.length > 0) {
            onSelect?.(selectedPTBs[0])
          }
        }
      }}
    >
      {ptbs.map((p) => (
        <SelectItem key={p.id}>
          {p.name !== '' ? p.name : t(`untitled.${selectionCategory}`)}
        </SelectItem>
      ))}
    </Select>
  )
}
