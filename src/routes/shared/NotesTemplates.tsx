import { useConfigStore } from '@/utils/useConfigStore'
import { ListState } from '@/utils/useListState'
import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/modal'
import { Listbox, ListboxItem } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { uid } from 'uid'
import { TNote } from './NotesList'

export function NotesTemplates({
  notesListState,
  templatePath,
}: {
  notesListState: ListState<TNote>
  templatePath: string
}) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const templates = useConfigStore(
    (state) => state.config?.template?.[templatePath],
  )

  if (!templates) {
    return null
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          onPress={onOpen}
          variant="flat"
          color="primary"
          className="w-auto"
          startContent={<FontAwesomeIcon icon={faAdd} />}
        >
          {t('notesTemplates.addTemplateButton')}
        </Button>
      </div>
      <Modal isOpen={isOpen} size="xl" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {t('notesTemplates.selectTemplateTitle')}
              </ModalHeader>
              <ModalBody>
                <Listbox>
                  {Object.entries(templates || {}).map(([key, template]) => (
                    <ListboxItem
                      key={key}
                      textValue={template.title}
                      description={
                        <p>
                          {template.content.length > 150
                            ? template.content.substring(0, 150) + '...'
                            : template.content}
                        </p>
                      }
                      onClick={() => {
                        notesListState.setData((prev) => [
                          ...prev,
                          {
                            id: uid(),
                            readonly: true,
                            deletable: true,
                            title: template.title,
                            category: template.category,
                            content: template.content,
                          },
                        ])
                        onClose()
                      }}
                    >
                      {template.title}
                    </ListboxItem>
                  ))}
                </Listbox>
              </ModalBody>

              <ModalFooter>
                <Button variant="light" color="primary" onPress={onClose}>
                  {t('common.close')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
