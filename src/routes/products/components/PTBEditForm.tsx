import { Autocomplete } from '@/components/forms/Autocomplete'
import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import {
  checkReadOnly as checkTemplateReadonly,
  getPlaceholder,
} from '@/utils/template'
import useDocumentType from '@/utils/useDocumentType'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { Button } from '@heroui/button'
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import { AutocompleteItem } from '@heroui/react'
import { SelectItem } from '@heroui/select'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProductFamilyChains } from '../ProductFamily'
import {
  TProductTreeBranch,
  TProductTreeBranchCategory,
  TProductTreeBranchProductType,
} from '../types/tProductTreeBranch'

export type PTBCreateEditFormProps = {
  ptb?: TProductTreeBranch
  onSave?: (updatedPtb: TProductTreeBranch) => void
  category?: TProductTreeBranchCategory
}

export function PTBCreateEditForm({
  ptb,
  onSave,
  category,
}: PTBCreateEditFormProps) {
  const { t } = useTranslation()
  const { getPTBName, families } = useProductTreeBranch()
  const { name: ptbName, isReadonly } = ptb
    ? getPTBName(ptb)
    : { name: '', isReadonly: false }
  const [name, setName] = useState(ptb?.name ?? '')
  const [description, setDescription] = useState(ptb?.description ?? '')
  const [type, setType] = useState(ptb?.type ?? 'Software')
  const [family, setFamily] = useState(ptb?.familyId ?? null)
  const { hasHardware, hasSoftware } = useDocumentType()

  return (
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader>
            {ptb?.id
              ? t('modal.edit', {
                  label: t(`${category}.label`),
                })
              : t('modal.create', {
                  label: t(`${category}.label`),
                })}
          </ModalHeader>
          <ModalBody>
            <Input
              label={t(`${category}.name`)}
              autoFocus
              value={isReadonly ? (ptbName ?? '') : name}
              onValueChange={setName}
              isDisabled={
                ptb ? checkTemplateReadonly(ptb, 'name') || isReadonly : false
              }
              placeholder={ptb ? getPlaceholder(ptb, 'name') : undefined}
            />
            {category === 'product_name' && (
              <Textarea
                label={t(`${category}.description`)}
                value={description}
                onValueChange={setDescription}
                isDisabled={
                  ptb ? checkTemplateReadonly(ptb, 'description') : false
                }
                placeholder={
                  ptb ? getPlaceholder(ptb, 'description') : undefined
                }
              />
            )}
            {category === 'product_name' && (
              <Select
                label={t(`${category}.type`)}
                selectedKeys={[type ?? '']}
                onChange={(e) => {
                  if (!e.target.value) {
                    return
                  }
                  setType(e.target.value as TProductTreeBranchProductType)
                }}
                isDisabled={ptb ? checkTemplateReadonly(ptb, 'type') : false}
                placeholder={ptb ? getPlaceholder(ptb, 'type') : undefined}
              >
                {hasSoftware ? (
                  <SelectItem key="Software">Software</SelectItem>
                ) : null}
                {hasHardware ? (
                  <SelectItem key="Hardware">Hardware</SelectItem>
                ) : null}
              </Select>
            )}

            {category === 'product_name' && (
              <Autocomplete
                labelPlacement="outside"
                label={t(`product_family.parent`)}
                selectedKey={family || ''}
                variant="bordered"
                inputProps={{
                  classNames: {
                    inputWrapper: 'border-1 shadow-none',
                  },
                }}
                onSelectionChange={(key) => {
                  if (key === null) {
                    setFamily(null)
                    return
                  }
                  const family = families.find((f) => f.id === key)
                  setFamily(family?.id ?? null)
                }}
              >
                {families.map((item) => (
                  <AutocompleteItem
                    key={item.id.toString()}
                    textValue={item.name}
                  >
                    <ProductFamilyChains item={item} />
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={onClose} variant="light">
              {t('common.cancel')}
            </Button>
            <Button
              color="primary"
              onPress={() => {
                onSave?.({
                  ...ptb,
                  name,
                  description,
                  type,
                  familyId: family,
                } as TProductTreeBranch)

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
