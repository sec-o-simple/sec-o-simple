import WizardStep from '@/components/WizardStep'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Input } from '@heroui/input'
import VendorList from './VendorList'

export const productTreeBranchCategories = [
  'vendor',
  'product_name',
  'product_version',
] as const
export type TProductTreeBranchCategory =
  (typeof productTreeBranchCategories)[number]

export type TProductTreeBranch = {
  id: string
  category: TProductTreeBranchCategory
  name: string
  description: string
  subBranches: TProductTreeBranch[]
}

export default function Products() {
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
