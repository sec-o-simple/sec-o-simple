import {
  TProductTreeBranch,
  getDefaultProductTreeBranch,
} from '@/routes/products/types/tProductTreeBranch'
import { TCSAFDocument } from '../csafExport/csafExport'
import { TParsedProductTreeBranch } from '../csafExport/parseProductTreeBranches'
import { DeepPartial } from '../deepPartial'
import { IdGenerator } from './idGenerator'

function convertCSAFProductTreeBranches(
  csafPTBs: TParsedProductTreeBranch[],
  idGenerator: IdGenerator,
): TProductTreeBranch[] {
  return (
    csafPTBs?.map((csafPTB) => {
      const defaultPTB = getDefaultProductTreeBranch(csafPTB.category)
      return {
        id: idGenerator.getId(csafPTB.product?.product_id),
        category: csafPTB.category,
        name: csafPTB.name || defaultPTB.name,
        description: csafPTB.product?.name ?? defaultPTB.description,
        identificationHelper: csafPTB.product?.product_identification_helper,
        subBranches: convertCSAFProductTreeBranches(
          csafPTB.branches ?? [],
          idGenerator,
        ),
        // We don't have a type for imported Files, so we set it to undefined
        type: undefined,
      } as TProductTreeBranch
    }) || []
  )
}

export function parseProductTree(
  csafDocument: DeepPartial<TCSAFDocument>,
  idGenerator: IdGenerator,
): TProductTreeBranch[] {
  return convertCSAFProductTreeBranches(
    csafDocument.product_tree?.branches as TParsedProductTreeBranch[],
    idGenerator,
  )
}
