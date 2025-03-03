import { motion } from 'motion/react'
import {
  faAdd,
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
        options={['Software', 'Hardware and Software', 'Hardware and Firmware']}
        onCreate={onCreate}
      />
      <DocumentType
        label="VEX Document"
        icon={faFileInvoice}
        options={[
          'Software',
          'Hardware and Software',
          'Hardware and Firmware',
          'using SBOM',
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
  options: string[]
  icon?: FontAwesomeIconProps['icon']
  onCreate?: (selectedOption: string) => void
}) {
  return (
    <div className="relative flex w-96 flex-col gap-6 rounded-xl bg-content1 p-6 shadow shadow-neutral-border">
      <div className="flex items-center gap-2 text-xl font-bold">
        {icon && <FontAwesomeIcon className="text-primary" icon={icon} />}
        {label}
      </div>
      <div className="grow">
        <RadioGroup>
          {options.map((option) => (
            <Radio value={option} key={option}>
              {option}
            </Radio>
          ))}
        </RadioGroup>
      </div>
      <div className="self-end">
        <Button color="primary" onPress={() => onCreate?.('todo')}>
          <FontAwesomeIcon icon={faAdd} />
          Create Document
        </Button>
      </div>
    </div>
  )
}
