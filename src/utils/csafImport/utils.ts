import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'

export function getParentPTB(
  id: string,
  startingBranches: TProductTreeBranch[],
  currentParent?: TProductTreeBranch,
): TProductTreeBranch | undefined {
  for (const branch of startingBranches) {
    if (startingBranches?.find((x) => x.id === id)) {
      return currentParent
    } else {
      const nestedSearch = getParentPTB(id, branch.subBranches, branch)
      if (nestedSearch) {
        return nestedSearch
      }
    }
  }
}
