import { useCSAFExport } from '@/utils/csafExport/csafExport'
import useDocumentStore from '@/utils/useDocumentStore'
import useValidationStore from '@/utils/validation/useValidationStore'
import {
  faAdd,
  faCircleExclamation,
  faEye,
  faFileExport,
  faShieldHalved,
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
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate } from 'react-router'
import ConfirmButton from '../forms/ConfirmButton'

function ValidationErrorList() {
  const { t } = useTranslation()
  const { messages } = useValidationStore()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button
        color="danger"
        variant="light"
        onPress={onOpen}
        isDisabled={messages.length === 0}
      >
        <FontAwesomeIcon icon={faCircleExclamation} /> {messages.length}{' '}
        {t('validation.error', {
          count: messages.length,
        })}
      </Button>

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
                {t('validation.errors.title')}
              </ModalHeader>
              <ModalBody>
                <Table>
                  <TableHeader>
                    <TableColumn>
                      {t('validation.errors.column.path')}
                    </TableColumn>
                    <TableColumn>
                      {t('validation.errors.column.message')}
                    </TableColumn>
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
                <Button color="primary" onPress={onClose}>
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

export default function TopBarLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { exportCSAFDocument } = useCSAFExport()
  const {
    isValid,
    messages,
    isValidating,
    reset: resetValidation,
  } = useValidationStore()
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
            confirmText={t('confirm.newDocument.body')}
            confirmTitle={t('confirm.newDocument.title')}
            onConfirm={() => {
              reset()
              resetValidation()
              navigate('/')
            }}
          >
            <FontAwesomeIcon icon={faAdd} />
            {t('newDocument')}
          </ConfirmButton>
        </div>

        <div className="flex gap-3">
          <Button color="secondary" isDisabled={true}>
            <FontAwesomeIcon icon={faEye} />
            {t('preview')}
          </Button>
          <Tooltip
            content={t('export.error', {
              errorCount: messages.length,
            })}
            isDisabled={isValid && !isValidating}
          >
            <div>
              <ConfirmButton
                confirmText={t('export.invalidExportConfirm')}
                confirmTitle={t('export.invalidExport')}
                onConfirm={exportCSAFDocument}
                skipConfirm={isValid && !isValidating}
                color="primary"
                fullWidth={false}
              >
                <FontAwesomeIcon icon={faFileExport} />
                {t('export.csaf')}
              </ConfirmButton>
            </div>
          </Tooltip>
          <ValidationErrorList />
        </div>
      </div>
      <Outlet />
    </div>
  )
}
