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
import { Alert, Button } from '@heroui/react'
import { Tab, Tabs } from '@heroui/tabs'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
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
  const [activeTab, setActiveTab] = useState(0)
  const tabProps = {
    vulnerability,
    vulnerabilityIndex,
    isTouched,
    onChange,
  }

  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)

  const prefix = `/vulnerabilities/${vulnerabilityIndex}`
  const validation = useFieldValidation(prefix)

  // Define tabs configuration
  const tabs = [
    {
      key: 'general',
      title: t('vulnerabilities.general.'),
      component: <General {...tabProps} />,
      csafPaths: [`${prefix}/cve`, `${prefix}/cwe/name`, `${prefix}/title`],
    },
    {
      key: 'notes',
      title: t('vulnerabilities.notes'),
      component: <Notes {...tabProps} />,
      csafPrefix: `${prefix}/notes`,
    },
    {
      key: 'products',
      title: t('vulnerabilities.products.title'),
      component: <Products {...tabProps} />,
      csafPrefix: `${prefix}/product_status`,
      csafPaths: [`${prefix}/product_status`],
    },
    sosDocumentType !== 'VexSoftware' &&
    sosDocumentType !== 'VexImport' &&
    sosDocumentType !== 'VexHardwareSoftware'
      ? {
          key: 'remediations',
          title: t('vulnerabilities.remediations'),
          component: <Remediations {...tabProps} />,
          csafPrefix: `${prefix}/remediations`,
        }
      : {
          key: 'flags',
          title: t('vulnerabilities.flags'),
          component: <Flags {...tabProps} />,
          csafPrefix: `${prefix}/flags`,
        },
    {
      key: 'scores',
      title: t('vulnerabilities.scores'),
      component: <Scores {...tabProps} />,
      csafPrefix: `${prefix}/scores`,
      hasError: vulnerability.scores?.some((score) => !score.cvssVersion),
    },
  ]

  const currentTab = tabs[activeTab]
  const prevTab = activeTab > 0 ? tabs[activeTab - 1] : null
  const nextTab = activeTab < tabs.length - 1 ? tabs[activeTab + 1] : null

  const handleTabChange = (key: string) => {
    const index = tabs.findIndex((tab) => tab.key === key)
    if (index !== -1) {
      setActiveTab(index)
    }
  }

  const handlePrevTab = () => {
    if (prevTab) {
      setActiveTab(activeTab - 1)
    }
  }

  const handleNextTab = () => {
    if (nextTab) {
      setActiveTab(activeTab + 1)
    }
  }

  return (
    <VSplit>
      {validation.hasErrors && (
        <Alert color="danger">
          {validation.errorMessages.map((m) => (
            <p key={m.path}>{m.message}</p>
          ))}
        </Alert>
      )}
      <Tabs
        color="primary"
        radius="lg"
        className="gap-2 bg-transparent"
        selectedKey={currentTab.key}
        onSelectionChange={(key) => handleTabChange(key as string)}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            title={
              <TabTitle
                title={tab.title}
                csafPrefix={tab.csafPrefix}
                csafPaths={tab.csafPaths}
                hasError={tab.hasError}
              />
            }
          >
            {tab.component}
          </Tab>
        ))}
      </Tabs>

      <div className="mx-2 flex justify-between">
        <div>
          {prevTab && (
            <Button
              variant="bordered"
              className="bg-content1 border-1"
              onPress={handlePrevTab}
            >
              {t('vulnerabilities.navigation.backTo', {
                tabName: prevTab.title,
              })}
            </Button>
          )}
        </div>
        <div>
          {nextTab && (
            <Button color="primary" tabIndex={1} onPress={handleNextTab}>
              {t('vulnerabilities.navigation.continueTo', {
                tabName: nextTab.title,
              })}
            </Button>
          )}
        </div>
      </div>
    </VSplit>
  )
}
