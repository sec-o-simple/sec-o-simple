import { useCSAFImport } from '@/utils/csafImport/csafImport'
import { useSOSImport } from '@/utils/sosDraft'
import { faArrowRight, faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

export default function EditDocument() {
  const navigate = useNavigate()
  const { isSOSDraft, importSOSDocument } = useSOSImport()
  const { isCSAFDocument, isCSAFVersionSupported, importCSAFDocument } =
    useCSAFImport()
  const [jsonObject, setJsonObject] = useState<object | undefined>()
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
        importCSAFDocument(jsonObject)
      } else {
        importSOSDocument(jsonObject)
      }
      navigate('/document-information/')
    }
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
