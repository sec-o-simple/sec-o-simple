import WizardStep from '@/components/WizardStep'
import { useParams } from 'react-router'
import SubMenuHeader from './components/SubMenuHeader'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { Modal, useDisclosure } from '@heroui/modal'
import { getPTBName } from './types/tProductTreeBranch'
import { useState } from 'react'
import { TRelationship, getDefaultRelationship } from './types/tRelationship'
import RelationshipEditForm from './components/RelationshipEditForm'
import { useRelationships } from '@/utils/useRelationships'
import { Accordion, AccordionItem } from '@heroui/accordion'
import InfoCard from './components/InfoCard'
import TagList from './components/TagList'
import { Chip } from '@heroui/chip'

export default function Version() {
  const { productVersionId } = useParams()
  const { findProductTreeBranch, findProductTreeBranchWithParents } =
    useProductTreeBranch()
  const {
    getRelationshipsBySourceVersion,
    sortRelationshipsByCategory,
    addOrUpdateRelationship,
    deleteRelationship,
  } = useRelationships()

  // modal variables
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [editingRelationship, setEditingRelationship] = useState<
    TRelationship | undefined
  >()

  const productVersion = findProductTreeBranchWithParents(
    productVersionId ?? '',
  )
  if (!productVersion) {
    return <>404 not found</>
  }

  const relationshipsByCategory = Object.entries(
    sortRelationshipsByCategory(
      getRelationshipsBySourceVersion(productVersion.id),
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ).filter(([_, relationships]) => relationships.length > 0)

  return (
    <WizardStep noContentWrapper={true}>
      <SubMenuHeader
        title={'Productversion ' + getPTBName(productVersion)}
        backLink={
          `/product-management/product/${productVersion.parent?.id}` ??
          '/product-management'
        }
        actionTitle="Add Relationship"
        onAction={() => {
          // add new relationship
          const newRelationship = getDefaultRelationship()
          newRelationship.productId1 = productVersion.parent?.id ?? ''
          newRelationship.product1VersionIds = [productVersion.id]
          setEditingRelationship(newRelationship)
          onOpen()
        }}
      />
      <Modal
        size="xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
      >
        <RelationshipEditForm
          relationship={editingRelationship}
          onSave={addOrUpdateRelationship}
        />
      </Modal>
      <div className="font-bold">Relationships</div>
      {relationshipsByCategory.length === 0 && (
        <span className="text-center text-neutral-foreground">
          No relationships added yet
        </span>
      )}
      <Accordion
        variant="splitted"
        selectionMode="multiple"
        defaultSelectedKeys="all"
        className="px-0"
        itemClasses={{
          heading: 'font-bold',
        }}
      >
        {relationshipsByCategory.map(([category, relationships]) => (
          <AccordionItem
            key={category}
            aria-label={category}
            title={category.replaceAll('_', ' ')}
            className="border shadow-none"
          >
            {relationships.map((relationship) => {
              const product = findProductTreeBranch(relationship.productId2)
              return product ? (
                <InfoCard
                  key={relationship.id}
                  variant="plain"
                  title={product.name}
                  className="border-t py-2"
                  onEdit={() => {
                    setEditingRelationship(relationship)
                    onOpen()
                  }}
                  onDelete={() => deleteRelationship(relationship)}
                  startContent={
                    <Chip color="primary" variant="flat" radius="md" size="lg">
                      {product.type}
                    </Chip>
                  }
                >
                  {relationship.product2VersionIds.length > 0 && (
                    <TagList
                      items={relationship.product2VersionIds}
                      labelGenerator={(x) =>
                        getPTBName(findProductTreeBranch(x))
                      }
                    />
                  )}
                </InfoCard>
              ) : undefined
            })}
          </AccordionItem>
        ))}
      </Accordion>
    </WizardStep>
  )
}
