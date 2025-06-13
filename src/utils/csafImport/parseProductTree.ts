import {
  TProductTreeBranch,
  getDefaultProductTreeBranch,
} from '@/routes/products/types/tProductTreeBranch'
import { TCSAFDocument } from '../csafExport/csafExport'
import { DeepPartial } from '../deepPartial'
import { IdGenerator } from './idGenerator'
import { TParsedProductTreeBranch } from '../csafExport/parseProductTreeBranches'

function convertCSAFProductTreeBranches(
  csafPTBs: TParsedProductTreeBranch[],
  idGenerator: IdGenerator,
): TProductTreeBranch[] {
  return csafPTBs.map((csafPTB) => {
    const defaultPTB = getDefaultProductTreeBranch(csafPTB.category)
    return {
      id: idGenerator.getId(csafPTB.product?.product_id),
      category: csafPTB.category,
      name: csafPTB.name || defaultPTB.name,
      description: csafPTB.product?.name ?? defaultPTB.description,
      subBranches: convertCSAFProductTreeBranches(
        csafPTB.branches ?? [],
        idGenerator,
      ),
      type: defaultPTB.type,
    } as TProductTreeBranch
  })
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
