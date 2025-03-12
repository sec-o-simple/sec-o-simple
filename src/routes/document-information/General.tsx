import WizardStep from '@/components/WizardStep'
import HSplit from '@/components/forms/HSplit'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { TDocumentInformation } from './types/tDocumentInformation'
import { useState } from 'react'
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
          {['german', 'english'].map((key) => (
            <SelectItem key={key}>{key}</SelectItem>
          ))}
        </Select>
      </HSplit>
    </WizardStep>
  )
}
