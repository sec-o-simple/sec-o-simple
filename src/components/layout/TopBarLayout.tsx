import { useCSAFExport } from '@/utils/csafExport/csafExport'
import { useSOSExport } from '@/utils/sosDraft'
import useDocumentStore from '@/utils/useDocumentStore'
import useValidationStore from '@/utils/useValidationStore'
import {
  faAdd,
  faEye,
  faFileExport,
  faSave,
  faShieldHalved,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from '@heroui/react'
import { Outlet, useNavigate } from 'react-router'
import ConfirmButton from '../forms/ConfirmButton'

function ValidationErrorList() {
  const { messages } = useValidationStore()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="full"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Validation Errors
              </ModalHeader>
              <ModalBody>
                <Table aria-label="Example static collection table">
                  <TableHeader>
                    <TableColumn>PATH</TableColumn>
                    <TableColumn>MESSAGE</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message, index) => (
                      <TableRow key={index}>
                        <TableCell>{message.path}</TableCell>
                        <TableCell>
                          <pre>{message.message}</pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Button
        color="danger"
        variant="light"
        onPress={onOpen}
        isDisabled={messages.length === 0}
      >
        <FontAwesomeIcon icon={faCircleExclamation} /> {messages.length} Error
        {messages.length !== 1 ? 's' : ''}
      </Button>
    </>
  )
}

export default function TopBarLayout() {
  const navigate = useNavigate()
  const { exportSOSDocument } = useSOSExport()
  const { exportCSAFDocument } = useCSAFExport()
  const { isValid, isValidating, reset: resetValidation } = useValidationStore()
  const { reset } = useDocumentStore()

  return (
    <div className="flex h-screen flex-col">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <span className="flex items-center gap-4">
            <FontAwesomeIcon icon={faShieldHalved} className="text-primary" />
            <p>Sec-o-simple</p>
          </span>

          <ConfirmButton
            className="ml-4"
            fullWidth={false}
            color="secondary"
            confirmText="Are you sure you want to create a new document? This will reset the current document."
            confirmTitle="Create New Document"
            onConfirm={() => {
              reset()
              resetValidation()
              navigate('/')
            }}
          >
            <FontAwesomeIcon icon={faAdd} />
            New Document
          </ConfirmButton>
        </div>
        <div className="flex gap-3">
          <Button color="secondary" isDisabled={true}>
            <FontAwesomeIcon icon={faEye} />
            Preview
          </Button>
          <Button color="secondary" onPress={exportSOSDocument}>
            <FontAwesomeIcon icon={faSave} />
            Export Draft
          </Button>
          <Tooltip
            content="There are some errors in the document. Please fix them before exporting."
            isDisabled={isValid && !isValidating}
          >
            <div>
              <Button
                color="primary"
                onPress={exportCSAFDocument}
                isDisabled={!isValid || isValidating}
              >
                <FontAwesomeIcon icon={faFileExport} />
                Export CSAF
              </Button>
            </div>
          </Tooltip>
          <ValidationErrorList />
        </div>
      </div>
      <Outlet />
    </div>
  )
}
