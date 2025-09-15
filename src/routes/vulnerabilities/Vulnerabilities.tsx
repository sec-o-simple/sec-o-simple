import StatusIndicator from '@/components/StatusIndicator'
import WizardStep from '@/components/WizardStep'
import ComponentList from '@/components/forms/ComponentList'
import VSplit from '@/components/forms/VSplit'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { useListValidation } from '@/utils/validation/useListValidation'
import usePageVisit from '@/utils/validation/usePageVisit'
import { usePrefixValidation } from '@/utils/validation/usePrefixValidation'
import useValidationStore from '@/utils/validation/useValidationStore'
import { Chip } from '@heroui/chip'
import { Alert } from '@heroui/react'
import { Tab, Tabs } from '@heroui/tabs'
import { useTranslation } from 'react-i18next'
import General from './General'
import Notes from './Notes'
import Products from './Products'
import Remediations from './Remediations'
import Scores from './Scores'
import { TVulnerability, getDefaultVulnerability } from './types/tVulnerability'
import useDocumentStore from '@/utils/useDocumentStore'
import Flags from './Flags'
import { useFieldValidation } from '@/utils/validation/useFieldValidation'

export default function Vulnerabilities() {
  const vulnerabilitiesListState = useListState<TVulnerability>({
    generator: getDefaultVulnerability,
  })

  const { t } = useTranslation()
  const hasVisitedPage = usePageVisit()

  useDocumentStoreUpdater({
    localState: vulnerabilitiesListState.data,
    valueField: 'vulnerabilities',
    valueUpdater: 'updateVulnerabilities',
    mergeUpdate: false,
    init: (initialData) => {
      vulnerabilitiesListState.setData(Object.values(initialData))
    },
  })

  const listValidation = useListValidation(
    '/vulnerabilities',
    vulnerabilitiesListState.data,
  )

  return (
    <WizardStep
      title={t('nav.vulnerabilities')}
      progress={3}
      onBack={'/products/management'}
      onContinue={'/tracking'}
    >
      {(hasVisitedPage || listValidation.isTouched) &&
        listValidation.hasErrors && (
          <Alert color="danger">
            {listValidation.errorMessages.map((m) => (
              <p key={m.path}>{m.message}</p>
            ))}
          </Alert>
        )}

      <ComponentList
        listState={vulnerabilitiesListState}
        title="title"
        itemLabel={t('vulnerabilities.vulnerability')}
        content={(vulnerability, index) => (
          <VulnerabilityForm
            vulnerability={vulnerability}
            vulnerabilityIndex={index}
            isTouched={hasVisitedPage}
            onChange={vulnerabilitiesListState.updateDataEntry}
          />
        )}
        startContent={VulnerabilityListStartContent}
      />
    </WizardStep>
  )
}

function VulnerabilityListStartContent({
  item,
  index,
}: {
  item: TVulnerability
  index: number
}) {
  const { hasErrors } = usePrefixValidation(`/vulnerabilities/${index}`)

  return (
    <>
      <StatusIndicator hasErrors={hasErrors} hasVisited={true} />
      <CVEChip vulnerability={item} />
    </>
  )
}

function CVEChip({ vulnerability }: { vulnerability: TVulnerability }) {
  return (
    vulnerability.cve && (
      <Chip color="primary" variant="flat">
        {vulnerability.cve}
      </Chip>
    )
  )
}

function TabTitle({
  title,
  csafPrefix = '',
  csafPaths = [],
  hasError: hasPassedError = false,
}: {
  title: string
  csafPrefix?: string
  csafPaths?: string[]
  hasError?: boolean
}) {
  const messages = useValidationStore((state) => state.messages)
  const errorPaths = messages
    .filter((m) => m.severity === 'error')
    .map((e) => e.path)

  let hasError = false

  if (csafPrefix && csafPrefix.length) {
    hasError = errorPaths.some((path) => path.startsWith(csafPrefix))
  }

  if (!hasError && csafPaths.length > 0) {
    hasError = csafPaths.some((path) => errorPaths.includes(path))
  }

  if (!hasError) {
    hasError = hasPassedError
  }

  return (
    <div className="flex items-center gap-2">
      <StatusIndicator hasErrors={hasError} hasVisited={true} />
      {title}
    </div>
  )
}

function VulnerabilityForm({
  vulnerability,
  vulnerabilityIndex,
  onChange,
  isTouched = false,
}: {
  vulnerability: TVulnerability
  vulnerabilityIndex: number
  isTouched?: boolean
  onChange: (vulnerability: TVulnerability) => void
}) {
  const { t } = useTranslation()
  const tabProps = {
    vulnerability,
    vulnerabilityIndex,
    isTouched,
    onChange,
  }

  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)

  const prefix = `/vulnerabilities/${vulnerabilityIndex}`
  const validation = useFieldValidation(prefix)

  return (
    <VSplit>
      {validation.hasErrors && (
        <Alert color="danger">
          {validation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}
      <Tabs color="primary" radius="lg" className="gap-4 bg-transparent">
        <Tab
          title={
            <TabTitle
              title={t('vulnerabilities.general.')}
              csafPaths={[
                `${prefix}/cve`,
                `${prefix}/cwe/name`,
                `${prefix}/title`,
              ]}
            />
          }
        >
          <General {...tabProps} />
        </Tab>
        <Tab
          title={
            <TabTitle
              title={t('vulnerabilities.notes')}
              csafPrefix={`${prefix}/notes`}
            />
          }
        >
          <Notes {...tabProps} />
        </Tab>
        <Tab
          title={
            <TabTitle
              title={t('vulnerabilities.products.title')}
              csafPrefix={`${prefix}/product_status`}
              csafPaths={[`${prefix}/product_status`]}
            />
          }
        >
          <Products {...tabProps} />
        </Tab>
        {sosDocumentType !== 'VexSoftware' &&
        sosDocumentType !== 'VexImport' &&
        sosDocumentType !== 'VexHardwareSoftware' ? (
          <Tab
            title={
              <TabTitle
                title={t('vulnerabilities.remediations')}
                csafPrefix={`${prefix}/remediations`}
              />
            }
          >
            <Remediations {...tabProps} />
          </Tab>
        ) : (
          <Tab
            title={
              <TabTitle
                title={t('vulnerabilities.flags')}
                csafPrefix={`${prefix}/flags`}
              />
            }
          >
            <Flags {...tabProps} />
          </Tab>
        )}
        <Tab
          title={
            <TabTitle
              title={t('vulnerabilities.scores')}
              csafPrefix={`${prefix}/scores`}
              hasError={vulnerability.scores?.some(
                (score) => !score.cvssVersion,
              )}
            />
          }
        >
          <Scores {...tabProps} />
        </Tab>
      </Tabs>
    </VSplit>
  )
}
