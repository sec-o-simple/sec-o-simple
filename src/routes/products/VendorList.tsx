/* eslint-disable react-hooks/exhaustive-deps */
import { useListState } from '@/utils/useListState'
import ComponentList from '@/components/forms/ComponentList'
import {
  TProductTreeBranch,
  getDefaultProductTreeBranch,
} from './types/tProductTreeBranch'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import ProductCard from './components/ProductCard'
import { useEffect, useMemo, useState } from 'react'
import { PTBEditForm } from './components/PTBEditForm'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { Modal, useDisclosure } from '@heroui/modal'
import { faAdd, faEdit } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

export default function VendorList() {
  const { t } = useTranslation()
  const { rootBranch, updatePTB, deletePTB, getPTBsByCategory } =
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
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [editingPTB, setEditingPTB] = useState<TProductTreeBranch | undefined>()

  return (
    <>
      <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <PTBEditForm ptb={editingPTB} onSave={(ptb) => updatePTB(ptb)} />
      </Modal>
      <ComponentList
        listState={vendorListState}
        itemLabel={t('products.vendor.label')}
        title="name"
        titleProps={{ className: 'font-bold' }}
        endContent={(item) => (
          <div className="text-neutral-foreground">{item.description}</div>
        )}
        customActions={[
          {
            icon: faAdd,
            onClick: (vendor) => {
              vendorListState.updateDataEntry({
                ...vendor,
                subBranches: [
                  ...vendor.subBranches,
                  getDefaultProductTreeBranch('product_name'),
                ],
              })
            },
          },
          {
            icon: faEdit,
            onClick: (ptb) => {
              setEditingPTB(ptb)
              onOpen()
            },
          },
        ]}
        content={(vendor) =>
          vendor.subBranches.map((product) => (
            <ProductCard
              key={product.id}
              className="border-t py-2"
              product={product}
              variant="plain"
            />
          ))
        }
      />
    </>
  )
}
