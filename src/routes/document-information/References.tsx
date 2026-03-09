import WizardStep from '@/components/WizardStep'
import { ReferencesList } from '@/routes/shared/ReferencesList'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useListValidation } from '@/utils/validation/useListValidation'
import usePageVisit from '@/utils/validation/usePageVisit'
import { Alert } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { TDocumentInformation } from './types/tDocumentInformation'
import {
  TDocumentReference,
  getDefaultDocumentReference,
} from './types/tDocumentReference'

export default function References() {
  const referencesListState = useListState<TDocumentReference>({
    generator: getDefaultDocumentReference,
  })

  const { t } = useTranslation()
  usePageVisit()

  useDocumentStoreUpdater<TDocumentInformation>({
    localState: [
      referencesListState.data,
      () => ({
        references: referencesListState.data,
      }),
    ],
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: (initialData) => referencesListState.setData(initialData.references),
  })

  const listValidation = useListValidation(
    `/document/references`,
    referencesListState.data,
  )

  return (
    <WizardStep
      title={t('nav.documentInformation.references')}
      progress={1.6}
      onBack={'/document-information/publisher'}
      onContinue="/document-information/aliases"
    >
      {listValidation.isTouched && listValidation.hasErrors && (
        <Alert color="danger">
          {listValidation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}
      <ReferencesList
        referencesListState={referencesListState}
        csafPath="/document/references"
      />
    </WizardStep>
  )
}
