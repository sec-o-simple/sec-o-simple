import StatusIndicator from '@/components/StatusIndicator'
import WizardStep from '@/components/WizardStep'
import ComponentList from '@/components/forms/ComponentList'
import { Input } from '@/components/forms/Input'
import VSplit from '@/components/forms/VSplit'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useFieldValidation } from '@/utils/validation/useFieldValidation'
import { useListValidation } from '@/utils/validation/useListValidation'
import usePageVisit from '@/utils/validation/usePageVisit'
import useValidationStore from '@/utils/validation/useValidationStore'
import { Alert } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { uid } from 'uid'
import { TDocumentInformation } from './types/tDocumentInformation'

type AliasWrapper = {
  id: string
  alias: string
}

export default function Aliases() {
  const aliasesListState = useListState<AliasWrapper>({
    generator: () => ({ id: uid(), alias: '' }),
  })

  const { t } = useTranslation()
  usePageVisit()

  useDocumentStoreUpdater<TDocumentInformation>({
    localState: [
      aliasesListState.data,
      () => ({
        aliases: aliasesListState.data.map((wrapper) => wrapper.alias),
      }),
    ],
    valueField: 'documentInformation',
    valueUpdater: 'updateDocumentInformation',
    init: (initialData) =>
      aliasesListState.setData(
        initialData.aliases?.map((alias) => ({ id: uid(), alias })) ?? [],
      ),
  })

  const listValidation = useListValidation(
    '/document/tracking/aliases',
    aliasesListState.data,
  )

  return (
    <WizardStep
      title={t('nav.documentInformation.aliases')}
      progress={1.7}
      onBack={'/document-information/references'}
      onContinue="/document-information/acknowledgments"
    >
      {listValidation.isTouched && listValidation.hasErrors && (
        <Alert color="danger">
          {listValidation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}
      <ComponentList
        listState={aliasesListState}
        title="alias"
        itemLabel={t('document.general.alias')}
        itemBgColor="bg-zinc-50"
        startContent={StartContent}
        content={(wrapper, index) => (
          <AliasForm
            aliasIndex={index}
            wrapper={wrapper}
            onChange={aliasesListState.updateDataEntry}
          />
        )}
      />
    </WizardStep>
  )
}

function StartContent({ index }: { index: number }) {
  const { hasErrors } = useFieldValidation(
    `/document/tracking/aliases/${index}`,
  )

  return <StatusIndicator hasErrors={hasErrors} hasVisited={true} />
}

function AliasForm({
  wrapper,
  aliasIndex,
  onChange,
}: {
  wrapper: AliasWrapper
  aliasIndex: number
  onChange: (wrapper: AliasWrapper) => void
}) {
  const { t } = useTranslation()
  const message = useValidationStore((state) => state.messages).filter(
    (m) => m.path === `/document/aliases/${aliasIndex}`,
  )?.[0]

  return (
    <VSplit>
      {message?.severity === 'error' && (
        <Alert color="danger" className="mb-4">
          <p>{message.message}</p>
        </Alert>
      )}

      <Input
        label={t('document.general.alias')}
        csafPath={`/document/tracking/aliases/${aliasIndex}`}
        value={wrapper.alias}
        onValueChange={(val) => onChange({ ...wrapper, alias: val })}
      />
    </VSplit>
  )
}
