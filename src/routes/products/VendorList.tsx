/* eslint-disable react-hooks/exhaustive-deps */
import AddItemButton from '@/components/forms/AddItemButton'
import ComponentList from '@/components/forms/ComponentList'
import VSplit from '@/components/forms/VSplit'
import useDocumentStore from '@/utils/useDocumentStore'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { useRelationships } from '@/utils/useRelationships'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { Modal, useDisclosure } from '@heroui/modal'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uid } from 'uid'
import ProductCard from './components/ProductCard'
import { PTBCreateEditForm } from './components/PTBEditForm'
import { ProductFamilyChip } from './components/ProductFamilyChip'
import {
  getDefaultProductTreeBranch,
  TProductTreeBranch,
} from './types/tProductTreeBranch'
import {
  getDefaultRelationship,
  TRelationshipCategory,
} from './types/tRelationship'

export default function VendorList() {
  const { t } = useTranslation()
  const { rootBranch, updatePTB, addPTB, deletePTB, getPTBsByCategory } =
    useProductTreeBranch()
  const { addOrUpdateRelationship } = useRelationships()
  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)

  const vendorListState = useListState<TProductTreeBranch>({
    generator: () => getDefaultProductTreeBranch('vendor'),
    onRemove: (entry) => deletePTB(entry.id),
  })

  const vendorPTBs = useMemo(
    () => getPTBsByCategory('vendor'),
    [JSON.stringify(rootBranch)],
  )

  useEffect(() => {
    vendorListState.setData(vendorPTBs)
  }, [vendorPTBs])

  useDocumentStoreUpdater({
    localState: vendorListState.data,
    valueField: 'products',
    valueUpdater: 'updateProducts',
    mergeUpdate: true,
    init: (initialData) => {
      vendorListState.setData(
        getPTBsByCategory('vendor', Object.values(initialData)),
      )
    },
    // update PTBs manually to not overwrite root level items that are no vendors
    shouldUpdate: () => true,
  })

  // modal variables
  const {
    isOpen: isVendorOpen,
    onOpen: onVendorOpen,
    onOpenChange: onVendorOpenChange,
  } = useDisclosure()
  const {
    isOpen: isProductOpen,
    onOpen: onProductOpen,
    onOpenChange: onProductOpenChange,
  } = useDisclosure()
  const {
    isOpen: isVersionOpen,
    onOpen: onVersionOpen,
    onOpenChange: onVersionOpenChange,
  } = useDisclosure()

  const [editingVendor, setEditingVendor] = useState<
    TProductTreeBranch | undefined
  >()
  const [editingProduct, setEditingProduct] = useState<
    TProductTreeBranch | undefined
  >()
  const [editingVersion, setEditingVersion] = useState<
    TProductTreeBranch | undefined
  >()
  const [selectedProductForVersion, setSelectedProductForVersion] = useState<
    TProductTreeBranch | undefined
  >()
  const [newlyCreatedProductId, setNewlyCreatedProductId] = useState<
    string | undefined
  >()

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
    <>
      <Modal
        size="xl"
        isOpen={isVendorOpen}
        onOpenChange={() => {
          onVendorOpenChange()
          setEditingVendor(undefined)
        }}
      >
        <PTBCreateEditForm
          ptb={editingVendor}
          onSave={(ptb) => {
            if (ptb.id) {
              updatePTB(ptb)
            } else {
              const vendor = { ...vendorListState.addDataEntry(), ...ptb }
              vendorListState.updateDataEntry(vendor)
              addPTB(vendor)
            }
          }}
          category="vendor"
        />
      </Modal>

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

      <ComponentList
        listState={vendorListState}
        itemLabel={t('products.vendor.label')}
        title="name"
        titleProps={{ className: 'font-bold' }}
        addEntry={() => onVendorOpen()}
        customActions={[
          {
            icon: faEdit,
            tooltip: t('products.vendor.edit'),
            onClick: (ptb) => {
              setEditingVendor(ptb)
              onVendorOpen()
            },
          },
        ]}
        content={(vendor) => {
          return (
            <VSplit>
              {vendor.subBranches.map((product) => (
                <div key={product.id} className="flex flex-col gap-2">
                  <ProductCard
                    product={product}
                    chips={<ProductFamilyChip product={product} />}
                    variant="boxed"
                    showProductPageLink={false}
                    showVersionTags={false}
                    showVersionPanel
                    initiallyExpandVersions={
                      newlyCreatedProductId === product.id
                    }
                    showVersionRelationshipAction={
                      sosDocumentType !== 'Software'
                    }
                    showAddVersionButton
                    versionsHeaderLabel={t(
                      'products.product.version.label_plural',
                    )}
                    onEdit={() => {
                      setEditingProduct(product)
                      onProductOpen()
                    }}
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
                </div>
              ))}

              <AddItemButton
                fullWidth
                label={t('common.add', {
                  label: t('products.product.label'),
                })}
                onPress={() => onProductOpen()}
              />

              <Modal
                size="xl"
                isOpen={isProductOpen}
                onOpenChange={() => {
                  onProductOpenChange()
                  setEditingProduct(undefined)
                }}
              >
                <PTBCreateEditForm
                  ptb={editingProduct}
                  category="product_name"
                  onSave={(ptb) => {
                    if (ptb.id) {
                      updatePTB(ptb)
                    } else {
                      const newProduct = {
                        ...getDefaultProductTreeBranch('product_name'),
                        ...ptb,
                      }
                      vendorListState.updateDataEntry({
                        ...vendor,
                        subBranches: [...vendor.subBranches, newProduct],
                      })
                      setNewlyCreatedProductId(newProduct.id)
                    }
                  }}
                />
              </Modal>
            </VSplit>
          )
        }}
      />
    </>
  )
}
