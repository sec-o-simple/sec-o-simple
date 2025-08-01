import {
  TProductTreeBranch,
  getDefaultProductTreeBranch,
} from '@/routes/products/types/tProductTreeBranch'
import { TCSAFDocument } from '../csafExport/csafExport'
import { TParsedProductTreeBranch } from '../csafExport/parseProductTreeBranches'
import { DeepPartial } from '../deepPartial'

function convertCSAFProductTreeBranches(
  csafPTBs: TParsedProductTreeBranch[],
): TProductTreeBranch[] {
  return (
    csafPTBs?.map((csafPTB) => {
      const defaultPTB = getDefaultProductTreeBranch(csafPTB.category)
      return {
        id: csafPTB.product?.product_id ?? defaultPTB.id,
        category: csafPTB.category,
        name: csafPTB.name || defaultPTB.name,
        productName: csafPTB.product?.name,
        description: csafPTB.product?.name ?? defaultPTB.description,
        identificationHelper: csafPTB.product?.product_identification_helper,
        subBranches: convertCSAFProductTreeBranches(csafPTB.branches ?? []),
        // We don't have a type for imported Files, so we set it to undefined
        type: undefined,
      } as TProductTreeBranch
    }) || []
  )
}

export function parseProductTree(
  csafDocument: DeepPartial<TCSAFDocument>,
): TProductTreeBranch[] {
  return convertCSAFProductTreeBranches(
    csafDocument.product_tree?.branches as TParsedProductTreeBranch[],
  )
}
