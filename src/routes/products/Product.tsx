import Breadcrumbs from '@/components/forms/Breadcrumbs'
import IconButton from '@/components/forms/IconButton'
import WizardStep from '@/components/WizardStep'
import useDocumentStore from '@/utils/useDocumentStore'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { useRelationships } from '@/utils/useRelationships'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { Modal, useDisclosure } from '@heroui/modal'
import { BreadcrumbItem } from '@heroui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import InfoCard from './components/InfoCard'
import { PTBCreateEditForm } from './components/PTBEditForm'
import SubMenuHeader from './components/SubMenuHeader'
import {
  getDefaultProductTreeBranch,
  TProductTreeBranch,
} from './types/tProductTreeBranch'
import {
  getDefaultRelationship,
  TRelationshipCategory,
} from './types/tRelationship'

export default function Product() {
  const { productId } = useParams()
  const { findProductTreeBranchWithParents, updatePTB, deletePTB, getPTBName } =
    useProductTreeBranch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // modal variables
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [editingPTB, setEditingPTB] = useState<TProductTreeBranch | undefined>()

  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)
  const { addOrUpdateRelationship } = useRelationships()

  const product = findProductTreeBranchWithParents(productId ?? '')

  if (!product) return <>404 not found</>

  const { name } = getPTBName(product)

  return (
    <WizardStep progress={2} noContentWrapper={true}>
      <Breadcrumbs>
        <BreadcrumbItem href="/#/product-management">
          {product.parent?.name !== ''
            ? product.parent?.name
            : t('untitled.vendor')}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {name !== '' ? name : t('untitled.product_name')}
        </BreadcrumbItem>
      </Breadcrumbs>

      <SubMenuHeader
        title={
          name !== ''
            ? t('products.product.label') + ' ' + name
            : t('untitled.product_name')
        }
        backLink={'/product-management'}
        actionTitle={t('common.add', {
          label: t('products.product.version.label'),
        })}
        onAction={() => onOpen()}
      />
      <Modal
        size="xl"
        isOpen={isOpen}
        onOpenChange={() => {
          onOpenChange()
          setEditingPTB(undefined)
        }}
      >
        <PTBCreateEditForm
          ptb={editingPTB}
          category="product_version"
          onSave={(ptb) => {
            if (ptb.id) {
              updatePTB(ptb)
            } else {
              const newVersion = {
                ...getDefaultProductTreeBranch('product_version'),
                ...ptb,
              }
              const updatedSubBranches = [...product.subBranches, newVersion]

              const updatedVendors = updatePTB({
                ...product,
                subBranches: updatedSubBranches,
              })

              setEditingPTB(newVersion)
              onOpen()

              // Add relationships for the new version
              if (!['Software', 'Hardware'].includes(product.type ?? '')) return

              const isSoftware = product.type === 'Software'
              const getVersionIds = (branches: TProductTreeBranch[]) =>
                branches.map((b) => b.id)

              updatedVendors.forEach((vendor) => {
                vendor.subBranches.forEach((ptb) => {
                  if (ptb.id === productId) return

                  const source = isSoftware ? product : ptb
                  const target = isSoftware ? ptb : product

                  const sourceVersions = isSoftware
                    ? [newVersion.id]
                    : getVersionIds(ptb.subBranches)
                  const targetVersions = isSoftware
                    ? getVersionIds(ptb.subBranches)
                    : [newVersion.id]

                  if (
                    sourceVersions.length === 0 ||
                    targetVersions.length === 0
                  )
                    return

                  const relationship = {
                    ...getDefaultRelationship(),
                    category: 'installed_on' as TRelationshipCategory,
                    productId1: source.id,
                    product1VersionIds: sourceVersions,
                    productId2: target.id,
                    product2VersionIds: targetVersions,
                  }

                  addOrUpdateRelationship(relationship)
                })
              })
            }
          }}
        />
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
          title={getPTBName(version).name ?? t('untitled.product_version')}
          key={version.id}
          variant="boxed"
          onEdit={() => {
            setEditingPTB(version)
            onOpen()
          }}
          onDelete={() => deletePTB(version.id)}
          linkTo={
            sosDocumentType !== 'Software'
              ? `/product-management/version/${version.id}`
              : undefined
          }
          endContent={
            sosDocumentType !== 'Software' ? (
              <IconButton
                icon={faLink}
                tooltip={t('products.relationship.edit', {
                  count: 2,
                })}
                onPress={() =>
                  navigate(`/product-management/version/${version.id}`)
                }
              />
            ) : undefined
          }
        />
      ))}
    </WizardStep>
  )
}
