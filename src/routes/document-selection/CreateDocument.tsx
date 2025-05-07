import useDocumentStore, { TSOSDocumentType } from '@/utils/useDocumentStore'
import {
  faArrowRight,
  faFileInvoice,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Radio, RadioGroup } from '@heroui/react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

type TDocumentType = {
  label: string
  type: TSOSDocumentType
  active?: boolean
  default?: boolean
}

export default function CreateDocument() {
  const navigate = useNavigate()
  const setSOSDocumentType = useDocumentStore(
    (state) => state.setSOSDocumentType,
  )

  const onCreate = (type: TSOSDocumentType) => {
    setSOSDocumentType(type)
    navigate('/document-information/')
  }

  return (
    <motion.div
      className="flex justify-between gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DocumentType
        label="Security Advisory"
        icon={faShieldHalved}
        options={[
          { label: 'Software', type: 'Software', active: true, default: true },
          {
            label: 'Hardware and Software',
            active: true,
            type: 'HardwareSoftware',
          },
          { label: 'Hardware and Firmware', type: 'HardwareFirmware' },
        ]}
        onCreate={onCreate}
      />
      <DocumentType
        label="VEX Document"
        icon={faFileInvoice}
        options={[
          { label: 'Software', type: 'VexSoftware' },
          { label: 'Hardware and Software', type: 'VexHardwareSoftware' },
          { label: 'Hardware and Firmware', type: 'VexHardwareFirmware' },
          { label: 'using SBOM', type: 'VexSbom' },
        ]}
        onCreate={onCreate}
      />
    </motion.div>
  )
}

function DocumentType({
  label,
  options,
  icon,
  onCreate,
}: {
  label: string
  options: TDocumentType[]
  icon?: FontAwesomeIconProps['icon']
  onCreate?: (documentType: TSOSDocumentType) => void
}) {
  const [type, setType] = useState<TDocumentType | undefined>(
    options.find((x) => x.default),
  )

  return (
    <div className="relative flex w-96 flex-col gap-6 rounded-xl border-2 bg-content1 p-6">
      <div className="flex items-center gap-2 text-xl font-bold">
        {icon && <FontAwesomeIcon className="text-primary" icon={icon} />}
        {label}
      </div>
      <div className="grow">
        <RadioGroup
          value={type?.type}
          onValueChange={(v) => setType(options.find((x) => x.type === v))}
        >
          {options.map((option) => (
            <Radio
              value={option.type}
              key={option.type}
              isDisabled={!option.active}
            >
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
      </div>
      <div className="self-end">
        <Button
          color="primary"
          endContent={<FontAwesomeIcon icon={faArrowRight} />}
          onPress={() => onCreate?.(type?.type ?? 'Software')}
          isDisabled={type === undefined}
        >
          Create Document
        </Button>
      </div>
    </div>
  )
}
