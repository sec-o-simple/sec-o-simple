import IconButton from '@/components/forms/IconButton'
import WizardStep from '@/components/WizardStep'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { Modal, useDisclosure } from '@heroui/modal'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import InfoCard from './components/InfoCard'
import { PTBEditForm } from './components/PTBEditForm'
import SubMenuHeader from './components/SubMenuHeader'
import {
  TProductTreeBranch,
  getDefaultProductTreeBranch,
  getPTBName,
} from './types/tProductTreeBranch'

export default function Product() {
  const { productId } = useParams()
  const { findProductTreeBranch, updatePTB, deletePTB } = useProductTreeBranch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // modal variables
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [editingPTB, setEditingPTB] = useState<TProductTreeBranch | undefined>()

  const product = findProductTreeBranch(productId ?? '')
  if (!product) {
    return <>404 not found</>
  }

  return (
    <WizardStep noContentWrapper={true}>
      <SubMenuHeader
        title={
          product.name
            ? t('products.product.label') + ' ' + getPTBName(product)
            : t('untitled.product_name')
        }
        backLink={'/product-management'}
        actionTitle={t('common.add', {
          label: t('products.product.version.label'),
        })}
        onAction={() => {
          // add new version
          const newVersion = getDefaultProductTreeBranch('product_version')
          updatePTB({
            ...product,
            subBranches: [...product.subBranches, newVersion],
          })
          // open edit form for newly added version
          setEditingPTB(newVersion)
          onOpen()
        }}
      />
      <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <PTBEditForm ptb={editingPTB} onSave={(ptb) => updatePTB(ptb)} />
      </Modal>
      <div className="font-bold">
        {t('products.relationship.version', {
          count: product.subBranches.length,
        })}{' '}
        ({product.subBranches.length})
      </div>

      {product.subBranches.length === 0 && (
        <div className="text-center text-lg text-neutral-foreground">
          <p>{t('products.product.version.empty')}</p>
        </div>
      )}

      {product.subBranches.map((version) => (
        <InfoCard
          title={getPTBName(version) ?? t('untitled.product_version')}
          linkTo={`/product-management/version/${version.id}`}
          key={version.id}
          variant="boxed"
          onEdit={() => {
            setEditingPTB(version)
            onOpen()
          }}
          onDelete={() => deletePTB(version.id)}
          endContent={
            <IconButton
              icon={faLink}
              tooltip={t('products.relationship.edit', {
                count: 2,
              })}
              onPress={() =>
                navigate(`/product-management/version/${version.id}`)
              }
            />
          }
        >
          {version.description && <div>{version.description}</div>}
        </InfoCard>
      ))}
    </WizardStep>
  )
}
