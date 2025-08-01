import { uid } from 'uid'

export const relationshipCategories = [
  'default_component_of',
  'external_component_of',
  'installed_on',
  'installed_with',
  'optional_component_of',
] as const

export type TRelationshipCategory = (typeof relationshipCategories)[number]

export type TRelationship = {
  id: string
  category: TRelationshipCategory
  productId1: string
  productId2: string
  relationships?: {
    product1VersionId: string
    product2VersionId: string
    relationshipId: string
  }[]
  name: string
}

export function getDefaultRelationship(): TRelationship {
  return {
    id: uid(),
    category: 'installed_on',
    productId1: '',
    productId2: '',
    relationships: [],
    name: '',
  }
}

export type CSAFRelationship = {
  category: TRelationshipCategory
  product_reference: string
  relates_to_product_reference: string
  full_product_name: {
    name: string
    product_id: string
  }
}
