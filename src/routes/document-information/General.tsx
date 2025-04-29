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
import { useTemplate } from '@/utils/template'
import usePageVisit from '@/utils/usePageVisit'

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

  const hasVisitedPage = usePageVisit()
  const { isFieldReadonly } = useTemplate()

  return (
    <WizardStep
      title="Document Information - General"
      progress={1}
      onContinue={'/document-information/notes'}
    >
      <Input
        label="Title"
        csafPath="/document/title"
        isTouched={hasVisitedPage}
        value={localState.title}
        onValueChange={(title) => setLocalState({ ...localState, title })}
        isDisabled={isFieldReadonly('document-information.title')}
      />
      <HSplit className="items-start">
        <Input
          label="ID"
          csafPath="/document/tracking/id"
          isTouched={hasVisitedPage}
          value={localState.id}
          onValueChange={(id) => setLocalState({ ...localState, id })}
          isDisabled={isFieldReadonly('document-information.id')}
        />
        <Select
          label="Language"
          csafPath="/document/lang"
          isTouched={hasVisitedPage}
          selectedKeys={[localState.language]}
          onSelectionChange={(v) =>
            setLocalState({ ...localState, language: [...v][0] as string })
          }
          isDisabled={isFieldReadonly('document-information.language')}
        >
          {['de', 'en'].map((key) => (
            <SelectItem key={key}>{key}</SelectItem>
          ))}
        </Select>
      </HSplit>
    </WizardStep>
  )
}
