import {
  CSAFRelationship,
  TRelationship,
} from '@/routes/products/types/tRelationship'
import { PidGenerator } from './pidGenerator'
import { uid } from 'uid'

export default function generateRelationships(
  relationships: TRelationship[],
  pidGenerator: PidGenerator,
): CSAFRelationship[] {
  const csafRelationships = [] as CSAFRelationship[]
  const ridGenerator = new PidGenerator()
  ridGenerator.prefix = 'CSAFRID'

  relationships.forEach((relationship) => {
    relationship.product1VersionIds.forEach((sourceVersion) => {
      relationship.product2VersionIds.forEach((targetVersion) => {
        csafRelationships.push({
          category: relationship.category,
          product_reference: pidGenerator.getPid(sourceVersion),
          relates_to_product_reference: pidGenerator.getPid(targetVersion),
          full_product_name: {
            name: relationship.name,
            product_id: ridGenerator.getPid(uid()),
          },
        })
      })
    })
  })

  return csafRelationships
}
