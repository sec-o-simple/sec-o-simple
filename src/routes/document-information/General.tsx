import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@/components/forms/Input'
import Select from '@/components/forms/Select'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { SelectItem } from '@heroui/select'
import { useState } from 'react'
import { TDocumentInformation } from './types/tDocumentInformation'
import {
  TGeneralDocumentInformation,
  getDefaultGeneralDocumentInformation,
} from './types/tGeneralDocumentInformation'

export default function General() {
  const [localState, setLocalState] = useState<TGeneralDocumentInformation>(
    getDefaultGeneralDocumentInformation(),
  )

  useDocumentStoreUpdater<TDocumentInformation>({
    localState,
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: setLocalState,
  })

  return (
    <WizardStep
      title="Document Information - General"
      progress={1}
      onContinue={'/document-information/notes'}
    >
      <Input
        label="Title"
        value={localState.title}
        onValueChange={(title) => setLocalState({ ...localState, title })}
      />
      <HSplit>
        <Input
          label="ID"
          value={localState.id}
          onValueChange={(id) => setLocalState({ ...localState, id })}
        />
        <Select
          label="Language"
          selectedKeys={[localState.language]}
          onSelectionChange={(v) =>
            setLocalState({ ...localState, language: [...v][0] as string })
          }
        >
          {['de', 'en'].map((key) => (
            <SelectItem key={key}>{key}</SelectItem>
          ))}
        </Select>
      </HSplit>
    </WizardStep>
  )
}
