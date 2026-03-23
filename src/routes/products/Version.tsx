import Breadcrumbs from '@/components/forms/Breadcrumbs'
import VSplit from '@/components/forms/VSplit'
import WizardStep from '@/components/WizardStep'
import useDocumentStore from '@/utils/useDocumentStore'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { useRelationships } from '@/utils/useRelationships'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Accordion, AccordionItem } from '@heroui/accordion'
import { Chip } from '@heroui/chip'
import { Modal, useDisclosure } from '@heroui/modal'
import { BreadcrumbItem, Tooltip } from '@heroui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import InfoCard from './components/InfoCard'
import RelationshipEditForm from './components/RelationshipEditForm'
import SubMenuHeader from './components/SubMenuHeader'
import TagList from './components/TagList'
import { TRelationship, getDefaultRelationship } from './types/tRelationship'

export default function Version() {
  const { t } = useTranslation()
  const { productVersionId } = useParams()
  const {
    findProductTreeBranch,
    findProductTreeBranchWithParents,
    getPTBName,
  } = useProductTreeBranch()
  const {
    getRelationshipsBySourceVersion,
    sortRelationshipsByCategory,
    addOrUpdateRelationship,
    deleteRelationship,
  } = useRelationships()
  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)

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
  const { name } = getPTBName(productVersion)

  const relationshipsByCategory = Object.entries(
    sortRelationshipsByCategory(
      getRelationshipsBySourceVersion(productVersion.id),
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ).filter(([_, relationships]) => relationships.length > 0)

  return (
    <WizardStep noContentWrapper={true} progress={2}>
      <Breadcrumbs>
        <BreadcrumbItem href="/#/products/management">
          {productVersion.parent?.parent?.name !== ''
            ? productVersion.parent?.parent?.name
            : t('untitled.vendor')}
        </BreadcrumbItem>
        <BreadcrumbItem
          href={`/#/products/management/product/${productVersion.parent?.id}`}
        >
          {productVersion.parent?.name !== ''
            ? productVersion.parent?.name
            : t('untitled.product_name')}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {productVersion?.name !== ''
            ? productVersion.name
            : t('untitled.product_version')}
        </BreadcrumbItem>
      </Breadcrumbs>

      <SubMenuHeader
        title={
          name
            ? `${t('products.product.version.label')} ${name}`
            : t('untitled.product_version')
        }
        backLink={
          productVersion.parent?.id
            ? `/products/management/product/${productVersion.parent?.id}`
            : '/products/management'
        }
        actionTitle={
          sosDocumentType !== 'Software'
            ? t('common.add', {
                label: t('products.relationship.label'),
              })
            : undefined
        }
        onAction={() => {
          // add new relationship
          const newRelationship = getDefaultRelationship()
          newRelationship.productId1 = productVersion.parent?.id ?? ''
          newRelationship.relationships = [
            {
              product1VersionId: productVersion.id,
              product2VersionId: '',
              relationshipId: newRelationship.id,
            },
          ]
          setEditingRelationship(newRelationship)
          onOpen()
        }}
      />
      <Modal
        size="3xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
      >
        <RelationshipEditForm
          relationship={editingRelationship}
          onSave={addOrUpdateRelationship}
        />
      </Modal>
      <div className="font-bold">{t('products.relationship.label')}</div>
      {relationshipsByCategory.length === 0 && (
        <span className="text-neutral-foreground text-center">
          {t('products.relationship.empty')}
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
            title={t(`products.relationship.categories.${category}`)}
            className="border-default-200 border shadow-none"
          >
            <VSplit>
              {relationships.map((rel) => {
                const product = findProductTreeBranch(rel.productId2)

                return product ? (
                  <InfoCard
                    key={rel.id}
                    variant="boxed"
                    linkTo={`/products/management/product/${product.id}`}
                    title={
                      product.name !== '' && product.name
                        ? product.name
                        : t('untitled.product_name')
                    }
                    onEdit={() => {
                      setEditingRelationship(rel)
                      onOpen()
                    }}
                    onDelete={() => deleteRelationship(rel)}
                    startContent={
                      <Chip
                        color="primary"
                        variant="flat"
                        radius="md"
                        size="lg"
                      >
                        {product.type}
                      </Chip>
                    }
                  >
                    {rel.relationships && rel.relationships.length > 0 && (
                      <TagList
                        items={rel.relationships.map(
                          (rel) => rel.product2VersionId,
                        )}
                        linkGenerator={(x) =>
                          `/products/management/version/${x}`
                        }
                        labelGenerator={(x) => {
                          const versionBranch =
                            findProductTreeBranchWithParents(x)

                          if (!versionBranch) {
                            return t('untitled.product_version')
                          }

                          const { name, isReadonly, readonlyReason } =
                            getPTBName(versionBranch)

                          const displayName =
                            name ?? t('untitled.product_version')
                          const readonlyReasonText =
                            isReadonly && readonlyReason
                              ? t(
                                  `product_version.readonly_reason.${readonlyReason}`,
                                )
                              : undefined

                          return (
                            <span className="flex items-center gap-1">
                              <span>{displayName}</span>
                              {readonlyReasonText && (
                                <Tooltip showArrow content={readonlyReasonText}>
                                  <span
                                    className="inline-flex text-zinc-500"
                                    aria-label={readonlyReasonText}
                                  >
                                    <FontAwesomeIcon
                                      icon={faCircleInfo}
                                      size="sm"
                                    />
                                  </span>
                                </Tooltip>
                              )}
                            </span>
                          )
                        }}
                      />
                    )}
                  </InfoCard>
                ) : undefined
              })}
            </VSplit>
          </AccordionItem>
        ))}
      </Accordion>
    </WizardStep>
  )
}
