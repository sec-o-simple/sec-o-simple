import { Input } from '@/components/forms/Input'
import { faArrowRight, faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router'

export default function EditDocument() {
  const navigate = useNavigate()

  return (
    <motion.div
      className="flex w-96 flex-col gap-6 rounded-xl bg-content1 p-6 border-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center gap-2 text-xl font-bold">
        <FontAwesomeIcon className="text-primary" icon={faEdit} />
        Edit existing document
      </div>
      <div>
        <Input type="file" />
      </div>
      <div className="self-end">
        <Button
          color="primary"
          endContent={<FontAwesomeIcon icon={faArrowRight} />}
          onPress={() => navigate('/document-information/')}
        >
          Edit Document
        </Button>
      </div>
    </motion.div>
  )
}
