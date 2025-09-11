import { Autocomplete } from '@/components/forms/Autocomplete'
import { Input } from '@/components/forms/Input'
import {
  checkReadOnly as checkTemplateReadonly,
  getPlaceholder,
} from '@/utils/template'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { Button } from '@heroui/button'
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import { AutocompleteItem } from '@heroui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProductFamilyChains } from '../ProductFamily'
import { TProductFamily } from '../types/tProductTreeBranch'

export type PFCreateEditFormProps = {
  pf?: TProductFamily
  onSave?: (updatedPf: TProductFamily) => void
  families?: TProductFamily[]
}

export function PFCreateEditForm({ pf, onSave }: PFCreateEditFormProps) {
  const { t } = useTranslation()
  const { families } = useProductTreeBranch()
  const { name: pfName, isReadonly } = pf
    ? { name: families.find((f) => f.id === pf.id)?.name, isReadonly: false }
    : { name: '', isReadonly: false }
  const [name, setName] = useState(pf?.name ?? '')
  const [parent, setParent] = useState(pf?.parent ?? null)

  return (
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader>
            {pf?.id
              ? t('modal.edit', {
                  label: t('product_family.label'),
                })
              : t('modal.create', {
                  label: t('product_family.label'),
                })}
          </ModalHeader>
          <ModalBody>
            <Input
              label={t('product_family.name')}
              autoFocus
              value={isReadonly ? (pfName ?? '') : name}
              onValueChange={setName}
              isDisabled={
                pf ? checkTemplateReadonly(pf, 'name') || isReadonly : false
              }
              placeholder={pf ? getPlaceholder(pf, 'name') : undefined}
            />
            <Autocomplete
              labelPlacement="outside"
              label={t('product_family.parent')}
              selectedKey={parent?.id || ''}
              variant="bordered"
              inputProps={{
                classNames: {
                  inputWrapper: 'border-1 shadow-none',
                },
              }}
              onSelectionChange={(key) => {
                if (key === null) {
                  setParent(null)
                  return
                }

                const parentPF = families.find((f) => f.id === key)
                if (parentPF) {
                  setParent(parentPF)
                }
              }}
            >
              {families
                .filter((item) => item.id !== pf?.id)
                .map((item) => (
                  <AutocompleteItem
                    key={item.id.toString()}
                    textValue={item.name}
                  >
                    <ProductFamilyChains item={item} />
                  </AutocompleteItem>
                ))}
            </Autocomplete>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onClose} variant="light">
              {t('common.cancel')}
            </Button>
            <Button
              color="primary"
              onPress={() => {
                onSave?.({
                  ...pf,
                  name,
                  parent,
                } as TProductFamily)
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
