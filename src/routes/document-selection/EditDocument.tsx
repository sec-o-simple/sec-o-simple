import {
  HiddenField,
  JSONObject,
  useCSAFImport,
} from '@/utils/csafImport/csafImport'
import { useSOSImport } from '@/utils/sosDraft'
import { faArrowRight, faEdit } from '@fortawesome/free-solid-svg-icons'
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
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import { t } from 'i18next'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

export default function EditDocument() {
  const navigate = useNavigate()
  const { isSOSDraft, importSOSDocument } = useSOSImport()
  const { isCSAFDocument, isCSAFVersionSupported, importCSAFDocument } =
    useCSAFImport()
  const { isOpen, onOpenChange } = useDisclosure()
  const [hiddenFields, setHiddenFields] = useState<HiddenField[]>([])
  const [jsonObject, setJsonObject] = useState<JSONObject>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  useEffect(() => {
    if (jsonObject) {
      if (!isSOSDraft(jsonObject) && !isCSAFDocument(jsonObject)) {
        setErrorMessage('Not a valid Sec-O-Simple or CSAF file')
        return
      }
      if (isCSAFDocument(jsonObject) && !isCSAFVersionSupported(jsonObject)) {
        setErrorMessage('Unsupported CSAF version')
        return
      }
    }
    setErrorMessage(undefined)
  }, [jsonObject, isSOSDraft, isCSAFDocument, isCSAFVersionSupported])

  const importDocument = () => {
    if (jsonObject && !errorMessage) {
      if (isCSAFDocument(jsonObject)) {
        const hiddenFields = importCSAFDocument(jsonObject)

        if (hiddenFields.length > 0) {
          setHiddenFields(hiddenFields)
          onOpenChange()
          return
        }
      } else {
        importSOSDocument(jsonObject)
      }

      navigate('/document-information/')
    }
  }

  const onConfirm = () => {
    navigate('/document-information/')
  }

  return (
    <motion.div
      className="flex w-96 flex-col gap-6 rounded-xl border-2 bg-content1 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center gap-2 text-xl font-bold">
        <FontAwesomeIcon className="text-primary" icon={faEdit} />
        Edit existing document
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="4xl"
        isDismissable={false}
        isKeyboardDismissDisabled={false}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>{t('hiddenFields.title')}</ModalHeader>

              <ModalBody>
                <p>{t('hiddenFields.description')}</p>
                <Table>
                  <TableHeader>
                    <TableColumn>{t('hiddenFields.column.path')}</TableColumn>
                    <TableColumn>{t('hiddenFields.column.value')}</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {hiddenFields.map((field, index) => (
                      <TableRow key={index}>
                        <TableCell>{field.path}</TableCell>
                        <TableCell>{JSON.stringify(field.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => {
                    setHiddenFields([])
                    onOpenChange()
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button color="primary" onPress={onConfirm}>
                  {t('common.confirm')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div>
        <input
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            if (e.target.files) {
              const file = e.target.files[0]
              const reader = new FileReader()
              reader.onload = function (e) {
                setJsonObject(undefined)
                if (!e.target?.result) {
                  return
                }

                try {
                  const jsonData = JSON.parse(e.target.result as string)
                  setJsonObject(jsonData)
                } catch (err) {
                  console.error('Error parsing JSON:', err)
                }
              }
              reader.readAsText(file)
            }
          }}
          className="w-full rounded-md border p-2 text-sm outline-none focus:border-black"
        />
        {errorMessage && (
          <div className="px-3 text-sm text-danger">{errorMessage}</div>
        )}
      </div>
      <div className="self-end">
        <Button
          color="primary"
          endContent={<FontAwesomeIcon icon={faArrowRight} />}
          onPress={importDocument}
          isDisabled={!jsonObject || !!errorMessage}
        >
          Edit Document
        </Button>
      </div>
    </motion.div>
  )
}
