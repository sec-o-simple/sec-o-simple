import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input, Textarea } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'

export const publisherCategories = [
  'coordinator',
  'discoverer',
  'other',
  'translator',
  'user',
  'vendor',
] as const
export type PublisherCategory = (typeof publisherCategories)[number]

export default function Publisher() {
  return (
    <WizardStep
      title="Document Information - Publisher"
      progress={1.5}
      onBack={'/document-information/notes'}
      onContinue={'/document-information/references'}
    >
      <Input label="Name of publisher" />
      <HSplit>
        <Select label="Category of Publisher">
          {publisherCategories.map((key) => (
            <SelectItem key={key}>{key}</SelectItem>
          ))}
        </Select>
        <Input
          label="Namespace of Publisher"
          placeholder="e.g., https://publisher.example.org/"
        />
      </HSplit>
      <Textarea label="Contact Details" />
      <Textarea label="Issuing Authority" />
    </WizardStep>
  )
}
