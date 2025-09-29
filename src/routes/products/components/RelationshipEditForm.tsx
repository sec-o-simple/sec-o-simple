import { Input } from '@/components/forms/Input'
import PTBSelect from '@/components/forms/PTBSelect'
import Select from '@/components/forms/Select'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import { SelectItem } from '@heroui/select'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPTBName } from '../types/tProductTreeBranch'
import {
  TRelationship,
  TRelationshipCategory,
  getDefaultRelationship,
  relationshipCategories,
} from '../types/tRelationship'

// Local type for the dialog that includes selected version arrays
type TRelationshipEditForm = TRelationship & {
  selectedSourceVersionIds: string[]
  selectedTargetVersionIds: string[]
}

export type RelationshipEditFormProps = {
  relationship?: TRelationship
  onSave?: (updatedPtb: TRelationship) => void
}

export default function RelationshipEditForm({
  relationship,
  onSave,
}: RelationshipEditFormProps) {
  const { t } = useTranslation()
  const { findProductTreeBranch } = useProductTreeBranch()

  const convertToEditForm = (rel: TRelationship): TRelationshipEditForm => {
    const sourceVersionIds = [
      ...new Set(rel.relationships?.map((r) => r.product1VersionId) ?? []),
    ].filter((id) => id !== '')

    const targetVersionIds = [
      ...new Set(rel.relationships?.map((r) => r.product2VersionId) ?? []),
    ].filter((id) => id !== '')

    return {
      ...rel,
      selectedSourceVersionIds: sourceVersionIds,
      selectedTargetVersionIds: targetVersionIds,
    }
  }

  // Helper function to convert TRelationshipEditForm to TRelationship
  const convertFromEditForm = (
    editForm: TRelationshipEditForm,
  ): TRelationship => {
    const relationships = editForm.selectedSourceVersionIds.flatMap(
      (sourceId) =>
        editForm.selectedTargetVersionIds.length > 0
          ? editForm.selectedTargetVersionIds.map((targetId) => ({
              product1VersionId: sourceId,
              product2VersionId: targetId,
              relationshipId: editForm.id,
            }))
          : [
              {
                product1VersionId: sourceId,
                product2VersionId: '',
                relationshipId: editForm.id,
              },
            ],
    )

    return {
      id: editForm.id,
      category: editForm.category,
      productId1: editForm.productId1,
      productId2: editForm.productId2,
      relationships,
      name: editForm.name,
    }
  }

  const [updatedRelationship, setUpdateRelationship] =
    useState<TRelationshipEditForm>(
      convertToEditForm(
        relationship ?? {
          ...getDefaultRelationship(),
          category: 'installed_on',
        },
      ),
    )

  const canBeSaved = useMemo(() => {
    if (!updatedRelationship.name) return false
    if (!updatedRelationship.productId1 || !updatedRelationship.productId2) {
      return false
    }
    if (
      updatedRelationship.selectedSourceVersionIds.length === 0 ||
      updatedRelationship.selectedTargetVersionIds.length === 0
    ) {
      return false
    }
    return true
  }, [updatedRelationship])

  return (
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">
            {t('modal.edit', {
              label: t('products.relationship.label'),
            })}
          </ModalHeader>
          <ModalBody className="gap-4">
            <div className="flex flex-row gap-2">
              <PTBSelect
                label={t('products.relationship.sourceProduct')}
                className="w-2/3"
                selectionCategory="product_name"
                selectedId={updatedRelationship.productId1}
                onSelect={(ptb) =>
                  setUpdateRelationship({
                    ...updatedRelationship,
                    productId1: ptb.id,
                    selectedSourceVersionIds: [], // Reset source versions when product changes
                  })
                }
                isDisabled={
                  relationship && checkReadOnly(relationship, 'productId1')
                }
                placeholder={
                  relationship
                    ? getPlaceholder(relationship, 'productId1')
                    : undefined
                }
              />

              <PTBSelect
                label={t('products.relationship.version')}
                className="w-1/3"
                selectionCategory="product_version"
                selectionMode="multiple"
                allowedIds={findProductTreeBranch(
                  updatedRelationship.productId1,
                )?.subBranches.map((x) => x.id)}
                selectedIds={updatedRelationship.selectedSourceVersionIds}
                onSelect={(sourceVersions) => {
                  setUpdateRelationship({
                    ...updatedRelationship,
                    selectedSourceVersionIds: sourceVersions.map((sv) => sv.id),
                  })
                }}
                isDisabled={
                  !updatedRelationship.productId1 ||
                  (relationship &&
                    checkReadOnly(relationship, 'product1VersionIds'))
                }
                placeholder={
                  relationship
                    ? getPlaceholder(relationship, 'product1VersionIds')
                    : undefined
                }
              />
            </div>

            <div className="flex flex-row gap-2">
              <PTBSelect
                label={t('products.relationship.targetProduct')}
                className="w-2/3"
                selectionCategory="product_name"
                selectedId={updatedRelationship.productId2}
                onSelect={(ptb) =>
                  setUpdateRelationship({
                    ...updatedRelationship,
                    productId2: ptb.id,
                    selectedTargetVersionIds: [], // Reset target versions when product changes
                  })
                }
                isDisabled={
                  relationship && checkReadOnly(relationship, 'productId2')
                }
                placeholder={
                  relationship
                    ? getPlaceholder(relationship, 'productId2')
                    : undefined
                }
              />

              <PTBSelect
                label={t('products.relationship.version')}
                className="w-1/3"
                selectionCategory="product_version"
                selectionMode="multiple"
                allowedIds={findProductTreeBranch(
                  updatedRelationship.productId2,
                )?.subBranches.map((x) => x.id)}
                selectedIds={updatedRelationship.selectedTargetVersionIds}
                onSelect={(targetVersions) => {
                  setUpdateRelationship({
                    ...updatedRelationship,
                    selectedTargetVersionIds: targetVersions.map((tv) => tv.id),
                  })
                }}
                isDisabled={
                  !updatedRelationship.productId2 ||
                  (relationship &&
                    checkReadOnly(relationship, 'product2VersionIds'))
                }
                placeholder={
                  relationship
                    ? getPlaceholder(relationship, 'product2VersionIds')
                    : undefined
                }
              />
            </div>

            <Select
              label={t('products.relationship.category')}
              selectedKeys={[updatedRelationship.category]}
              onSelectionChange={(selected) => {
                const category = [...selected][0] as string
                setUpdateRelationship({
                  ...updatedRelationship,
                  category: category as TRelationshipCategory,
                })
              }}
              isDisabled={
                relationship && checkReadOnly(relationship, 'category')
              }
              placeholder={
                relationship
                  ? getPlaceholder(relationship, 'category')
                  : t('products.relationship.categoryPlaceholder')
              }
            >
              {relationshipCategories.map((category) => (
                <SelectItem key={category}>
                  {t(`products.relationship.categories.${category}`)}
                </SelectItem>
              ))}
            </Select>

            <Input
              label={t('products.relationship.name')}
              className="w-full"
              type="text"
              value={updatedRelationship.name}
              onValueChange={(name) =>
                setUpdateRelationship({ ...updatedRelationship, name })
              }
              isDisabled={relationship && checkReadOnly(relationship, 'name')}
              placeholder={
                relationship
                  ? getPlaceholder(relationship, 'name')
                  : t('products.relationship.namePlaceholder')
              }
            />

            <div className="flex flex-row items-center justify-around gap-2 rounded-md bg-gray-100 p-4">
              <ProductBox
                product={
                  findProductTreeBranch(updatedRelationship.productId1)?.name
                }
                versions={updatedRelationship.selectedSourceVersionIds
                  .map((versionId) => {
                    const version = findProductTreeBranch(versionId)
                    return version ? (getPTBName(version) ?? '') : ''
                  })
                  .filter((name) => name !== '')}
              />

              <div className="flex flex-col items-center space-y-2">
                <FontAwesomeIcon
                  icon={faArrowRight}
                  size="xl"
                  className="text-primary"
                />
                <p className="text-sm text-zinc-500">
                  {t(
                    `products.relationship.categories.${updatedRelationship.category}`,
                  )}
                </p>
                {updatedRelationship.selectedSourceVersionIds.length > 0 &&
                  updatedRelationship.selectedTargetVersionIds.length > 0 && (
                    <p className="text-xs text-zinc-400">
                      {t('products.relationship.relationshipCount', {
                        count:
                          updatedRelationship.selectedSourceVersionIds.length *
                          updatedRelationship.selectedTargetVersionIds.length,
                      })}
                    </p>
                  )}
              </div>

              <ProductBox
                product={
                  findProductTreeBranch(updatedRelationship.productId2)?.name
                }
                versions={updatedRelationship.selectedTargetVersionIds
                  .map((versionId) => {
                    const version = findProductTreeBranch(versionId)
                    return version ? (getPTBName(version) ?? '') : ''
                  })
                  .filter((name) => name !== '')}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              color="primary"
              isDisabled={!canBeSaved}
              onPress={() => {
                onSave?.(convertFromEditForm(updatedRelationship))
                onClose()
              }}
            >
              {t('common.save')}
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  )
}

function ProductBox({
  product,
  versions,
}: {
  product: string | undefined
  versions: string[]
}) {
  const { t } = useTranslation()
  return (
    <div>
      {versions.length > 0 && (
        <div className="border-default-200 flex flex-col items-center rounded-lg border bg-white p-2 px-4">
          <div className="flex flex-col gap-1">
            <p key={product}>
              {product && product !== '' ? product : t('untitled.product_name')}
            </p>
          </div>

          <p className="text-sm text-zinc-500">
            {t('products.relationship.version', {
              count: versions.length,
            })}
            : {versions.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
