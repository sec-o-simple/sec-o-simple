import { Button, ButtonProps } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'

type ConfirmButtonProps = {
  confirmText: string
  confirmTitle: string
  onConfirm: () => void
  skipConfirm?: boolean
} & ButtonProps

export default function ConfirmButton({
  confirmText,
  confirmTitle,
  onConfirm,
  skipConfirm = false,
  ...props
}: ConfirmButtonProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button onPress={skipConfirm ? onConfirm : onOpen} fullWidth {...props}>
        {props?.children || 'Confirm'}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {confirmTitle || 'Confirm'}
              </ModalHeader>
              <ModalBody className="gap-4">
                <p>{confirmText}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onConfirm()
                    onClose()
                  }}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
