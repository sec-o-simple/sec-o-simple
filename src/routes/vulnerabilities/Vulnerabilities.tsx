import WizardStep from '@/components/WizardStep'
import ComponentList from '@/components/forms/ComponentList'
import VSplit from '@/components/forms/VSplit'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { Chip } from '@heroui/chip'
import { Tab, Tabs } from '@heroui/tabs'
import General from './General'
import Notes from './Notes'
import Products from './Products'
import { TVulnerability, getDefaultVulnerability } from './types/tVulnerability'
import { Alert } from '@heroui/react'
import { useListValidation } from '@/utils/useListValidation'
import usePageVisit from '@/utils/usePageVisit'
import Scores from './Scores'
import Remediations from './Remediations'
import { useTranslation } from 'react-i18next'

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
      onBack={'/product-management'}
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
        startContent={(vulnerability) => (
          <CVEChip vulnerability={vulnerability} />
        )}
      />
    </WizardStep>
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

  return (
    <VSplit>
      <Tabs color="primary" radius="lg" className="gap-4 bg-transparent">
        <Tab title={t('vulnerabilities.general')}>
          <General {...tabProps} />
        </Tab>
        <Tab title={t('vulnerabilities.notes')}>
          <Notes {...tabProps} />
        </Tab>
        <Tab title={t('vulnerabilities.products')}>
          <Products {...tabProps} />
        </Tab>
        <Tab title={t('vulnerabilities.remediations')}>
          <Remediations {...tabProps} />
        </Tab>
        <Tab title={t('vulnerabilities.scores')}>
          <Scores {...tabProps} />
        </Tab>
      </Tabs>
    </VSplit>
  )
}
