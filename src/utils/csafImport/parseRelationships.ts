import {
  CSAFRelationship,
  TRelationship,
  getDefaultRelationship,
} from '@/routes/products/types/tRelationship'
import { getParentPTB } from './utils'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { IdGenerator } from './idGenerator'

export function parseRelationships(
  csafRelationships: CSAFRelationship[],
  idGenerator: IdGenerator,
  sosPTBs: TProductTreeBranch[],
): TRelationship[] {
  const relationships: TRelationship[] = []

  for (const csafRelationship of csafRelationships) {
    const id1 = idGenerator.getId(csafRelationship.product_reference)
    const id2 = idGenerator.getId(csafRelationship.relates_to_product_reference)
    const parent1 = getParentPTB(id1, sosPTBs)?.id
    const parent2 = getParentPTB(id2, sosPTBs)?.id

    if (!parent1 || !parent2) {
      console.error('Failed to parse csaf relationship', csafRelationship)
      continue
    }

    const existingElement = relationships.find(
      (x) =>
        x.category === csafRelationship.category &&
        x.productId1 === parent1 &&
        x.productId2 === parent2,
    )
    const relationship = existingElement ?? {
      ...getDefaultRelationship(),
      productId1: parent1,
      productId2: parent2,
      category: csafRelationship.category,
    }
    relationship.name += csafRelationship.full_product_name?.name
    if (!relationship.product1VersionIds.includes(id1)) {
      relationship.product1VersionIds.push(id1)
    }
    if (!relationship.product2VersionIds.includes(id2)) {
      relationship.product2VersionIds.push(id2)
    }

    if (!existingElement) {
      relationships.push(relationship)
    }
  }

  return relationships
}
