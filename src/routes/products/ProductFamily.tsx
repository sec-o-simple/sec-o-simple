import AddItemButton from '@/components/forms/AddItemButton'
import WizardStep from '@/components/WizardStep'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import usePageVisit from '@/utils/validation/usePageVisit'
import { Modal, useDisclosure } from '@heroui/modal'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import InfoCard from './components/InfoCard'
import { PFCreateEditForm } from './components/PFEditForm'
import {
  getDefaultProductFamily,
  TProductFamily,
} from './types/tProductTreeBranch'

export const getFamilyChain = (item: TProductFamily) => {
  const chain = [] as TProductFamily[]
  let current = item

  // Build the chain from item up to root
  while (current) {
    chain.unshift(current)
    current = current.parent as TProductFamily
  }

  return chain.length > 0 ? chain : [item]
}

export const getFamilyChainString = (item: TProductFamily): string => {
  const chain = getFamilyChain(item)
  return chain.map((f) => f.name).join(' / ')
}

export function ProductFamilyChains({
  item,
}: {
  item: TProductFamily
}): ReactElement {
  return (
    <div className="flex gap-1" key={item.id}>
      {getFamilyChain(item)
        .slice(0, -1)
        .map((parent) => (
          <p key={parent.id} className="text-zinc-400">
            {parent.name} /
          </p>
        ))}
      <p className="font-bold">{item.name}</p>
    </div>
  )
}

export default function ProductFamily() {
  usePageVisit()
  const { t } = useTranslation()

  const { updateFamily, deleteFamily, families, addProductFamily } =
    useProductTreeBranch()

  const pfamListState = useListState<TProductFamily>({
    generator: () => getDefaultProductFamily(),
    onRemove: (entry) => deleteFamily(entry.id),
  })

  useDocumentStoreUpdater({
    localState: pfamListState.data,
    valueField: 'families',
    valueUpdater: 'updateFamilies',
    mergeUpdate: true,
    init: (initialData) => {
      pfamListState.setData(Object.values(initialData))
    },
    shouldUpdate: () => true,
  })

  const {
    isOpen: isProductOpen,
    onOpen: onProductOpen,
    onOpenChange: onProductOpenChange,
  } = useDisclosure()

  const [editingProductFamily, setEditingProductFamily] =
    useState<TProductFamily>()

  return (
    <WizardStep
      title={t('nav.productManagement.productFamilies')}
      subtitle={t('nav.productManagement.productFamiliesSubtitle')}
      progress={2.0}
      onBack={'/document-information/acknowledgments'}
      onContinue={'/products/management'}
    >
      {families.map((pfam) => (
        <InfoCard
          title={getFamilyChainString(pfam)}
          key={pfam.id}
          variant="boxed"
          onEdit={() => {
            setEditingProductFamily(pfam)
            onProductOpen()
          }}
          onDelete={() => pfamListState.removeDataEntry(pfam)}
        />
      ))}

      <Modal
        size="xl"
        isOpen={isProductOpen}
        onOpenChange={() => {
          onProductOpenChange()
          setEditingProductFamily(undefined)
        }}
      >
        <PFCreateEditForm
          pf={editingProductFamily}
          families={families}
          onSave={(pf) => {
            if (pf.id) {
              updateFamily(pf)
            } else {
              const pfam = { ...pfamListState.addDataEntry(), ...pf }
              pfamListState.updateDataEntry(pfam)
              addProductFamily(pfam)
            }
          }}
        />
      </Modal>

      <AddItemButton
        label={t('common.add', {
          label: 'Product Family',
        })}
        onPress={() => {
          onProductOpen()
        }}
      />
    </WizardStep>
  )
}
