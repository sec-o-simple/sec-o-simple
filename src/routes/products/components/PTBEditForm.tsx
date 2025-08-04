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
import { SelectItem } from '@heroui/select'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TProductTreeBranch,
  TProductTreeBranchProductType,
} from '../types/tProductTreeBranch'

export type PTBCreateEditFormProps = {
  ptb?: TProductTreeBranch
  onSave?: (updatedPtb: TProductTreeBranch) => void
  category?: string
}

export function PTBCreateEditForm({
  ptb,
  onSave,
  category,
}: PTBCreateEditFormProps) {
  const { t } = useTranslation()
  const { getPTBName } = useProductTreeBranch()
  const { name: ptbName, isReadonly } = ptb
    ? getPTBName(ptb)
    : { name: '', isReadonly: false }
  const [name, setName] = useState(ptb?.name ?? '')
  const [description, setDescription] = useState(ptb?.description ?? '')
  const [type, setType] = useState(ptb?.type ?? 'Software')
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
              value={isReadonly ? ptbName ?? '' : name}
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
