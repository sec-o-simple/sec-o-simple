import {
  TRelationship,
  relationshipCategories,
} from '@/routes/products/types/tRelationship'
import useDocumentStore from './useDocumentStore'

export function useRelationships() {
  const globalRelationships = useDocumentStore((store) => store.relationships)
  const updateRelationships = useDocumentStore(
    (store) => store.updateRelationships,
  )

  const getRelationshipsBySourceVersion = (
    sourceVersionId: string,
  ): TRelationship[] => {
    return globalRelationships.filter((relationship) =>
      relationship.relationships?.some(
        (rel) => rel.product1VersionId === sourceVersionId,
      ),
    )
  }

  const getRelationshipsByTargetVersion = (
    targetVersionId: string,
  ): TRelationship[] => {
    return globalRelationships.filter((relationship) =>
      relationship.relationships?.some(
        (rel) => rel.product2VersionId === targetVersionId,
      ),
    )
  }

  const sortRelationshipsByCategory = (
    relationships?: TRelationship[],
  ): { [k: string]: TRelationship[] } => {
    const list = relationships ?? globalRelationships
    const categorized = Object.fromEntries(
      relationshipCategories.map((category) => [
        category,
        [] as TRelationship[],
      ]),
    )
    list.forEach((relationship) =>
      categorized[relationship.category].push(relationship),
    )
    return categorized
  }

  const addOrUpdateRelationship = (relationship: TRelationship) => {
    relationship

    if (globalRelationships.find((x) => x.id === relationship.id)) {
      updateRelationships(
        globalRelationships.map((x) =>
          x.id === relationship.id ? relationship : x,
        ),
      )
    } else {
      updateRelationships([...globalRelationships, relationship])
    }
  }

  const deleteRelationship = (relationship: TRelationship) => {
    updateRelationships(
      globalRelationships.filter((x) => x.id !== relationship.id),
    )
  }

  return {
    getRelationshipsBySourceVersion,
    getRelationshipsByTargetVersion,
    sortRelationshipsByCategory,
    addOrUpdateRelationship,
    deleteRelationship,
  }
}
