import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import useDocumentStore from '@/utils/useDocumentStore'
import { useRelationships } from '@/utils/useRelationships'
import { Modal, useDisclosure } from '@heroui/modal'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uid } from 'uid'
import ProductCard from './components/ProductCard'
import { PTBCreateEditForm } from './components/PTBEditForm'
import { ProductFamilyChip } from './components/ProductFamilyChip'
import {
  getDefaultProductTreeBranch,
  TProductTreeBranch,
  TProductTreeBranchProductType,
} from './types/tProductTreeBranch'
import {
  getDefaultRelationship,
  TRelationshipCategory,
} from './types/tRelationship'

export type ProductListProps = {
  productType: TProductTreeBranchProductType
}

export default function ProductList({ productType }: ProductListProps) {
  const { t } = useTranslation()
  const { getPTBsByCategory, updatePTB, deletePTB } = useProductTreeBranch()
  const { addOrUpdateRelationship } = useRelationships()
  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)

  const {
    isOpen: isVersionOpen,
    onOpen: onVersionOpen,
    onOpenChange: onVersionOpenChange,
  } = useDisclosure()
  const [editingVersion, setEditingVersion] = useState<
    TProductTreeBranch | undefined
  >()
  const [selectedProductForVersion, setSelectedProductForVersion] = useState<
    TProductTreeBranch | undefined
  >()

  const products = getPTBsByCategory('product_name').filter(
    (product) => product.type === productType,
  )

  const addVersionRelationships = (
    product: TProductTreeBranch,
    newVersionId: string,
    updatedVendors: TProductTreeBranch[],
  ) => {
    if (!['Software', 'Hardware'].includes(product.type ?? '')) return

    const isSoftware = product.type === 'Software'
    const getVersionIds = (branches: TProductTreeBranch[]) =>
      branches.map((b) => b.id)

    updatedVendors.forEach((vendor) => {
      vendor.subBranches.forEach((ptb) => {
        if (ptb.id === product.id) return

        const source = isSoftware ? product : ptb
        const target = isSoftware ? ptb : product

        const sourceVersions = isSoftware
          ? [newVersionId]
          : getVersionIds(ptb.subBranches)
        const targetVersions = isSoftware
          ? getVersionIds(ptb.subBranches)
          : [newVersionId]

        if (sourceVersions.length === 0 || targetVersions.length === 0) return

        addOrUpdateRelationship({
          ...getDefaultRelationship(),
          category: 'installed_on' as TRelationshipCategory,
          productId1: source.id,
          productId2: target.id,
          relationships: sourceVersions.flatMap((v1) =>
            targetVersions.map((v2) => ({
              product1VersionId: v1,
              product2VersionId: v2,
              relationshipId: uid(),
            })),
          ),
        })
      })
    })
  }

  return (
    <div className="flex flex-col items-stretch gap-2">
      <Modal
        size="xl"
        isOpen={isVersionOpen}
        onOpenChange={() => {
          onVersionOpenChange()
          setEditingVersion(undefined)
          setSelectedProductForVersion(undefined)
        }}
      >
        <PTBCreateEditForm
          ptb={editingVersion}
          category="product_version"
          onSave={(ptb) => {
            if (ptb.id) {
              updatePTB(ptb)
              return
            }

            if (!selectedProductForVersion) {
              return
            }

            const newVersion = {
              ...getDefaultProductTreeBranch('product_version'),
              ...ptb,
            }

            const updatedVendors = updatePTB({
              ...selectedProductForVersion,
              subBranches: [
                ...selectedProductForVersion.subBranches,
                newVersion,
              ],
            })

            addVersionRelationships(
              selectedProductForVersion,
              newVersion.id,
              updatedVendors,
            )
          }}
        />
      </Modal>

      {products.length === 0 && (
        <div className="text-neutral-foreground text-center text-lg">
          <p>
            {t('products.empty', {
              type: productType,
            })}
          </p>
        </div>
      )}
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          chips={<ProductFamilyChip product={product} />}
          showProductPageLink={false}
          showVersionPanel
          showVersionTags={false}
          versionsHeaderLabel={t('products.product.version.label_plural')}
          showVersionRelationshipAction={sosDocumentType !== 'Software'}
          showAddVersionButton
          onEditVersion={(version) => {
            setEditingVersion(version)
            setSelectedProductForVersion(product)
            onVersionOpen()
          }}
          onDeleteVersion={(version) => deletePTB(version.id)}
          onAddVersion={() => {
            setSelectedProductForVersion(product)
            setEditingVersion(undefined)
            onVersionOpen()
          }}
        />
      ))}
    </div>
  )
}
