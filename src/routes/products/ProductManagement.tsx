import { Input } from '@/components/forms/Input'
import HSplit from '@/components/forms/HSplit'
import WizardStep from '@/components/WizardStep'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tab, Tabs } from '@heroui/tabs'
import { useState } from 'react'
import VendorList from './VendorList'
import useDocumentStore from '@/utils/useDocumentStore'
import ProductList from './ProductList'
import usePageVisit from '@/utils/usePageVisit'

export default function ProductManagement() {
  usePageVisit()
  const [selectedTab, setSelectedTab] = useState<string>('Vendors')
  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)

  return (
    <WizardStep
      progress={2}
      onBack={'/document-information/references'}
      onContinue={'/vulnerabilities'}
      noContentWrapper
    >
      <HSplit className="items-center justify-between">
        <div className="mb-2 text-xl font-semibold">Product Management</div>
        <Input
          placeholder="Search vendors, products or versions"
          className="w-96 bg-content1"
          startContent={
            <FontAwesomeIcon
              icon={faSearch}
              className="text-neutral-foreground"
            />
          }
        />
      </HSplit>

      <Tabs
        variant="underlined"
        color="primary"
        className="gap-4 bg-transparent"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab key="Vendors" title="Vendors">
          <VendorList />
        </Tab>
        {sosDocumentType.includes('Software') && (
          <Tab key="Software" title="Software">
            <ProductList productType="Software" />
          </Tab>
        )}
        {sosDocumentType.includes('Hardware') && (
          <Tab key="Hardware" title="Hardware">
            <ProductList productType="Hardware" />
          </Tab>
        )}
      </Tabs>
    </WizardStep>
  )
}
