import { Input, Textarea } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import { checkReadOnly, getPlaceholder } from '@/utils/template'
import { Button } from '@heroui/button'
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import { SelectItem } from '@heroui/select'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TProductTreeBranch,
  TProductTreeBranchProductType,
} from '../types/tProductTreeBranch'
import useDocumentType from '@/utils/useDocumentType'

export type PTBEditFormProps = {
  ptb?: TProductTreeBranch
  onSave?: (updatedPtb: TProductTreeBranch) => void
}

export function PTBEditForm({ ptb, onSave }: PTBEditFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(ptb?.name ?? '')
  const [description, setDescription] = useState(ptb?.description ?? '')
  const [type, setType] = useState(ptb?.type)
  const { hasHardware, hasSoftware } = useDocumentType()

  return (
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader>
            {t('modal.edit', {
              label: t(`${ptb?.category}.label`),
            })}
          </ModalHeader>
          <ModalBody>
            <Input
              label={t(`${ptb?.category}.name`)}
              autoFocus
              value={name}
              onValueChange={setName}
              isDisabled={!ptb || checkReadOnly(ptb, 'name')}
              placeholder={ptb ? getPlaceholder(ptb, 'name') : undefined}
            />
            {ptb?.category === 'product_name' && (
              <Textarea
                label={t(`${ptb?.category}.description`)}
                value={description}
                onValueChange={setDescription}
                isDisabled={!ptb || checkReadOnly(ptb, 'description')}
                placeholder={
                  ptb ? getPlaceholder(ptb, 'description') : undefined
                }
              />
            )}
            {ptb?.category === 'product_name' && (
              <Select
                label={t(`${ptb?.category}.type`)}
                selectedKeys={[type ?? '']}
                onChange={(e) => {
                  if (!e.target.value) {
                    return
                  }
                  setType(e.target.value as TProductTreeBranchProductType)
                }}
                isDisabled={!ptb || checkReadOnly(ptb, 'type')}
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
