import WizardStep from '@/components/WizardStep'
import ComponentList from '@/components/forms/ComponentList'
import VSplit from '@/components/forms/VSplit'
import { useListState } from '@/utils/useListState'
import { Tab, Tabs } from '@heroui/tabs'
import { uid } from 'uid'
import General from './General'
import Notes from './Notes'
import { TNote } from '../shared/NotesList'
import { Chip } from '@heroui/chip'
import Products from './Products'
import { Input } from '@heroui/input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export type TVulnerability = {
  id: string
  cve: string
  cwe: string
  title: string
  notes: TNote[]
}

export default function Vulnerabilities() {
  const vulnerabilitiesListState = useListState<TVulnerability>({
    generator: () => ({
      id: uid(),
      cve: '',
      cwe: '',
      title: '',
      notes: [],
    }),
  })

  return (
    <WizardStep title="Vulnerabilities" progress={3} onBack={'/products'}>
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
        content={(vulnerability) => (
          <VulnerabilityForm
            vulnerability={vulnerability}
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
      <Chip color="secondary" variant="flat">
        {vulnerability.cve}
      </Chip>
    )
  )
}

function VulnerabilityForm({
  vulnerability,
  onChange,
}: {
  vulnerability: TVulnerability
  onChange: (vulnerability: TVulnerability) => void
}) {
  return (
    <VSplit>
      <Tabs color="primary">
        <Tab title="General">
          <General vulnerability={vulnerability} onChange={onChange} />
        </Tab>
        <Tab title="Notes">
          <Notes vulnerability={vulnerability} onChange={onChange} />
        </Tab>
        <Tab title="Products">
          <Products />
        </Tab>
      </Tabs>
    </VSplit>
  )
}
