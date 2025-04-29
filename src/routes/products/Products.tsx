import { Input } from '@/components/forms/Input'
import WizardStep from '@/components/WizardStep'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import VendorList from './VendorList'
import usePageVisit from '@/utils/usePageVisit'

export default function Products() {
  usePageVisit()

  return (
    <WizardStep
      title="Product Management"
      progress={2}
      onBack={'/document-information/references'}
      onContinue={'/vulnerabilities'}
    >
      <Input
        placeholder="Search vendors, products or versions"
        startContent={
          <FontAwesomeIcon
            icon={faSearch}
            className="text-neutral-foreground"
          />
        }
      />
      <VendorList />
    </WizardStep>
  )
}
