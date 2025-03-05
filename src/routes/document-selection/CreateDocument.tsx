import { motion } from 'motion/react'
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
import { useNavigate } from 'react-router'
import { useState } from 'react'

type TDocumentType = {
  label: string
  key: string
  active?: boolean
  default?: boolean
}

export default function CreateDocument() {
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onCreate = (_: string) => {
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
          { label: 'Software', key: 'software', active: true, default: true },
          { label: 'Hardware and Software', key: 'hardware_software' },
          { label: 'Hardware and Firmware', key: 'hardware_firmware' },
        ]}
        onCreate={onCreate}
      />
      <DocumentType
        label="VEX Document"
        icon={faFileInvoice}
        options={[
          { label: 'Software', key: 'vex_software' },
          { label: 'Hardware and Software', key: 'vex_hardware_software' },
          { label: 'Hardware and Firmware', key: 'vex_hardware_firmware' },
          { label: 'using SBOM', key: 'vex_sbom' },
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
  onCreate?: (selectedOption: string) => void
}) {
  const [type, setType] = useState<TDocumentType | undefined>(
    options.find((x) => x.default),
  )

  return (
    <div className="relative flex w-96 flex-col gap-6 rounded-xl bg-content1 p-6 shadow shadow-neutral-border">
      <div className="flex items-center gap-2 text-xl font-bold">
        {icon && <FontAwesomeIcon className="text-primary" icon={icon} />}
        {label}
      </div>
      <div className="grow">
        <RadioGroup
          value={type?.key}
          onValueChange={(v) => setType(options.find((x) => x.key === v))}
        >
          {options.map((option) => (
            <Radio
              value={option.key}
              key={option.key}
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
          onPress={() => onCreate?.('todo')}
          isDisabled={type === undefined}
        >
          Create Document
        </Button>
      </div>
    </div>
  )
}
