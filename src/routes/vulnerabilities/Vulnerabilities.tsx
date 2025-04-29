import WizardStep from '@/components/WizardStep'
import ComponentList from '@/components/forms/ComponentList'
import VSplit from '@/components/forms/VSplit'
import useDocumentStoreUpdater from '@/utils/useDocumentStoreUpdater'
import { useListState } from '@/utils/useListState'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Chip } from '@heroui/chip'
import { Input } from '@/components/forms/Input'
import { Tab, Tabs } from '@heroui/tabs'
import General from './General'
import Notes from './Notes'
import Products from './Products'
import { TVulnerability, getDefaultVulnerability } from './types/tVulnerability'
import { Alert } from '@heroui/react'
import { useListValidation } from '@/utils/useListValidation'
import usePageVisit from '@/utils/usePageVisit'

export default function Vulnerabilities() {
  const vulnerabilitiesListState = useListState<TVulnerability>({
    generator: getDefaultVulnerability,
  })

  const hasVisitedPage = usePageVisit()

  useDocumentStoreUpdater({
    localState: vulnerabilitiesListState.data,
    valueField: 'vulnerabilities',
    valueUpdater: 'updateVulnerabilities',
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
      title="Vulnerabilities"
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
      {/* show search input */}
      <Input
        placeholder="Search vulnerabilities"
        startContent={
          <FontAwesomeIcon
            icon={faSearch}
            className="text-neutral-foreground"
          />
        }
      />
      <ComponentList
        listState={vulnerabilitiesListState}
        title="title"
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
  const tabProps = {
    vulnerability,
    vulnerabilityIndex,
    isTouched,
    onChange,
  }

  return (
    <VSplit>
      <Tabs color="primary" radius="lg" className="gap-4 bg-transparent">
        <Tab title="General">
          <General {...tabProps} />
        </Tab>
        <Tab title="Notes">
          <Notes {...tabProps} />
        </Tab>
        <Tab title="Products">
          <Products {...tabProps} />
        </Tab>
      </Tabs>
    </VSplit>
  )
}
