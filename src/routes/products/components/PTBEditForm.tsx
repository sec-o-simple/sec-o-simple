import {
  TProductTreeBranch,
  TProductTreeBranchProductType,
  productTreeBranchProductTypes,
} from '../types/tProductTreeBranch'
import { Button } from '@heroui/button'
import { Input, Textarea } from '@/components/forms/Input'
import { useState } from 'react'
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import Select from '@/components/forms/Select'
import { SelectItem } from '@heroui/select'
import useDocumentStore from '@/utils/useDocumentStore'
import { useTranslation } from 'react-i18next'

export type PTBEditFormProps = {
  ptb?: TProductTreeBranch
  onSave?: (updatedPtb: TProductTreeBranch) => void
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'vendor':
      return 'Vendor'
    case 'product_name':
      return 'Product'
    case 'product_version':
      return 'Product Version'
    default:
      return ''
  }
}

export function PTBEditForm({ ptb, onSave }: PTBEditFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(ptb?.name ?? '')
  const [description, setDescription] = useState(ptb?.description ?? '')
  const [type, setType] = useState(ptb?.type ?? 'Software')
  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)

  const categoryLabel = getCategoryLabel(ptb?.category ?? '')

  return (
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader>
            {t('products.modal.edit', {
              label: t(`products.${categoryLabel.toLowerCase()}`),
            })}
          </ModalHeader>
          <ModalBody>
            <Input
              label={t('products.product.name')}
              autoFocus
              value={name}
              onValueChange={setName}
              isDisabled={!ptb || checkReadOnly(ptb, 'name')}
              placeholder={ptb ? getPlaceholder(ptb, 'name') : undefined}
            />
            <Textarea
              label={t('products.product.description')}
              value={description}
              onValueChange={setDescription}
              isDisabled={!ptb || checkReadOnly(ptb, 'description')}
              placeholder={ptb ? getPlaceholder(ptb, 'description') : undefined}
            />
            {ptb?.category === 'product_name' && (
              <Select
                label={t('products.product.type')}
                selectedKeys={[type ?? 'Software']}
                onChange={(e) => {
                  if (!e.target.value) {
                    return
                  }
                  setType(e.target.value as TProductTreeBranchProductType)
                }}
                isDisabled={!ptb || checkReadOnly(ptb, 'type')}
                placeholder={ptb ? getPlaceholder(ptb, 'type') : undefined}
              >
                {productTreeBranchProductTypes
                  .filter((type) => sosDocumentType.includes(type))
                  .map((type) => (
                    <SelectItem key={type}>{type}</SelectItem>
                  ))}
              </Select>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={onClose} variant="light">
              {t('common.cancel')}
            </Button>
            <Button
              color="primary"
              onPress={() => {
                if (ptb) {
                  onSave?.({ ...ptb, name, description, type })
                }
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
