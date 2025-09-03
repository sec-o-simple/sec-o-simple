/* eslint-disable react-hooks/exhaustive-deps */
import AddItemButton from '@/components/forms/AddItemButton'
import ComponentList from '@/components/forms/ComponentList'
import VSplit from '@/components/forms/VSplit'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { Modal, useDisclosure } from '@heroui/modal'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProductCard from './components/ProductCard'
import { PTBCreateEditForm } from './components/PTBEditForm'
import { ProductFamilyChip } from './Product'
import {
  getDefaultProductTreeBranch,
  TProductTreeBranch,
} from './types/tProductTreeBranch'

export default function VendorList() {
  const { t } = useTranslation()
  const { rootBranch, updatePTB, addPTB, deletePTB, getPTBsByCategory } =
    useProductTreeBranch()

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

  const [editingVendor, setEditingVendor] = useState<
    TProductTreeBranch | undefined
  >()
  const [editingProduct, setEditingProduct] = useState<
    TProductTreeBranch | undefined
  >()

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
                <ProductCard
                  key={product.id}
                  product={product}
                  chips={<ProductFamilyChip product={product} />}
                  variant="boxed"
                  onEdit={() => {
                    setEditingProduct(product)
                    onProductOpen()
                  }}
                />
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
                      vendorListState.updateDataEntry({
                        ...vendor,
                        subBranches: [
                          ...vendor.subBranches,
                          {
                            ...getDefaultProductTreeBranch('product_name'),
                            ...ptb,
                          },
                        ],
                      })
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
