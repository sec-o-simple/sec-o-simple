import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'

export default function General() {
  return (
    <WizardStep
      title="Document Information - General"
      progress={1}
      onContinue={'/document-information/notes'}
    >
      <Input label="Title" />
      <HSplit>
        <Input label="ID" />
        <Select label="Language">
          {['german', 'english'].map((key) => (
            <SelectItem key={key}>{key}</SelectItem>
          ))}
        </Select>
      </HSplit>
    </WizardStep>
  )
}
