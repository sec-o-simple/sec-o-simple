import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'

const documentCategories = [
  'csaf_base',
  'csaf_security_incident_response',
  'csaf_informational_advisory',
  'csaf_security_advisory',
  'csaf_vex',
]

export default function General() {
  return (
    <WizardStep
      title="Document Information - General"
      progress={1}
      onContinue={'/document-information/notes'}
    >
      <HSplit>
        <Select label="Category">
          {documentCategories.map((key) => (
            <SelectItem key={key}>{key}</SelectItem>
          ))}
        </Select>
        <Select label="Language">
          {['german', 'english'].map((key) => (
            <SelectItem key={key}>{key}</SelectItem>
          ))}
        </Select>
      </HSplit>
      <Input label="Title" />
    </WizardStep>
  )
}
