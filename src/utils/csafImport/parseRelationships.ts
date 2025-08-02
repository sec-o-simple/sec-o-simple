import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import {
  CSAFRelationship,
  TRelationship,
  getDefaultRelationship,
} from '@/routes/products/types/tRelationship'
import { getParentPTB } from './utils'

export function parseRelationships(
  csafRelationships: CSAFRelationship[],
  sosPTBs: TProductTreeBranch[],
): TRelationship[] {
  const relationships: TRelationship[] = []

  for (const csafRelationship of csafRelationships) {
    const id1 = csafRelationship.product_reference
    const id2 = csafRelationship.relates_to_product_reference
    const parent1 = getParentPTB(id1, sosPTBs)?.id
    const parent2 = getParentPTB(id2, sosPTBs)?.id

    if (!parent1 || !parent2) {
      console.error('Failed to parse csaf relationship', csafRelationship)
      continue
    }

    let relationship = relationships.find(
      (x) =>
        x.category === csafRelationship.category &&
        x.productId1 === parent1 &&
        x.productId2 === parent2,
    )

    if (!relationship) {
      relationship = {
        ...getDefaultRelationship(),
        productId1: parent1,
        productId2: parent2,
        category: csafRelationship.category,
        name: csafRelationship.full_product_name?.name || '',
        relationships: [],
      }
      relationships.push(relationship)
    } else {
      // Optionally append name if needed
      if (
        csafRelationship.full_product_name?.name &&
        !relationship.name.includes(csafRelationship.full_product_name.name)
      ) {
        relationship.name += csafRelationship.full_product_name.name
      }
    }

    // Add the relationship entry if not already present
    const exists = relationship.relationships?.some(
      (rel) => rel.product1VersionId === id1 && rel.product2VersionId === id2,
    )
    if (!exists) {
      relationship.relationships?.push({
        product1VersionId: id1,
        product2VersionId: id2,
        relationshipId: csafRelationship.full_product_name.product_id,
      })
    }
  }

  return relationships
}
