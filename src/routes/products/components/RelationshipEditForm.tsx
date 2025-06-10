import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import {
  TRelationship,
  TRelationshipCategory,
  getDefaultRelationship,
  relationshipCategories,
} from '../types/tRelationship'
import Select from '@/components/forms/Select'
import { useState } from 'react'
import { Button } from '@heroui/button'
import PTBSelect from '@/components/forms/PTBSelect'
import { getPTBName } from '../types/tProductTreeBranch'
import { SelectItem } from '@heroui/select'
import { Input } from '@/components/forms/Input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { checkReadOnly, getPlaceholder } from '@/utils/template'

export type RelationshipEditFormProps = {
  relationship?: TRelationship
  onSave?: (updatedPtb: TRelationship) => void
}

export default function RelationshipEditForm({
  relationship,
  onSave,
}: RelationshipEditFormProps) {
  const { findProductTreeBranch } = useProductTreeBranch()

  const [updatedRelationship, setUpdateRelationship] = useState<TRelationship>({
    ...(relationship ?? getDefaultRelationship()),
  })

  return (
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">
            Edit Relationship
          </ModalHeader>
          <ModalBody className="gap-4">
            <div className="flex flex-row gap-2">
              <PTBSelect
                label="Source Product"
                className="w-2/3"
                selectionCategory="product_name"
                selectedId={updatedRelationship.productId1}
                onSelect={(ptb) =>
                  setUpdateRelationship({
                    ...updatedRelationship,
                    productId1: ptb.id,
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
                label="Version"
                className="w-1/3"
                selectionCategory="product_version"
                selectionMode="multiple"
                allowedIds={findProductTreeBranch(
                  updatedRelationship.productId1,
                )?.subBranches.map((x) => x.id)}
                selectedIds={updatedRelationship.product1VersionIds}
                onSelect={(ptbs) =>
                  setUpdateRelationship({
                    ...updatedRelationship,
                    product1VersionIds: ptbs.map((x) => x.id),
                  })
                }
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
                label="Target Product"
                className="w-2/3"
                selectionCategory="product_name"
                selectedId={updatedRelationship.productId2}
                onSelect={(ptb) =>
                  setUpdateRelationship({
                    ...updatedRelationship,
                    productId2: ptb.id,
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
                label="Version"
                className="w-1/3"
                selectionCategory="product_version"
                selectionMode="multiple"
                allowedIds={findProductTreeBranch(
                  updatedRelationship.productId2,
                )?.subBranches.map((x) => x.id)}
                selectedIds={updatedRelationship.product2VersionIds}
                onSelect={(ptbs) =>
                  setUpdateRelationship({
                    ...updatedRelationship,
                    product2VersionIds: ptbs.map((x) => x.id),
                  })
                }
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
              label="Relationship Type"
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
                  : 'Select a type'
              }
            >
              {relationshipCategories.map((category) => (
                <SelectItem key={category}>{category}</SelectItem>
              ))}
            </Select>

            <Input
              label="Description"
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
                  : 'Enter the description...'
              }
            />

            <div className="flex flex-row items-center justify-around gap-2 rounded-md bg-gray-100 p-4">
              <ProductBox
                product={
                  findProductTreeBranch(updatedRelationship.productId1)?.name ??
                  ''
                }
                versions={updatedRelationship.product1VersionIds.map((id) => {
                  const version = findProductTreeBranch(id)
                  return version ? getPTBName(version) : ''
                })}
              />

              <div className="flex flex-col items-center space-y-2">
                <FontAwesomeIcon
                  icon={faArrowRight}
                  size="xl"
                  className="text-primary"
                />
                <p className="text-sm text-zinc-500">
                  {updatedRelationship.category}
                </p>
              </div>

              <ProductBox
                product={
                  findProductTreeBranch(updatedRelationship.productId2)?.name ??
                  ''
                }
                versions={updatedRelationship.product2VersionIds.map((id) => {
                  const version = findProductTreeBranch(id)
                  return version ? getPTBName(version) : ''
                })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={() => {
                onSave?.(updatedRelationship)
                onClose()
              }}
            >
              Save
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
  product: string
  versions: string[]
}) {
  return (
    <div>
      {versions.length > 0 && (
        <div className="flex flex-col items-center rounded-lg border border-gray bg-white p-2 px-4">
          <div className="flex flex-col gap-1">
            <p key={product}>{product}</p>
          </div>

          <p className="text-sm text-zinc-500">
            Versions: {versions.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
