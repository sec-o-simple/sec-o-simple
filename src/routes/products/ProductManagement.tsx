import { Input } from '@/components/forms/Input'
import HSplit from '@/components/forms/HSplit'
import WizardStep from '@/components/WizardStep'
import { faAdd, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Tab, Tabs } from '@heroui/tabs'
import { useState } from 'react'
import VendorList from './VendorList'
import useDocumentStore from '@/utils/useDocumentStore'
import ProductList from './ProductList'

export default function ProductManagement() {
  const [selectedTab, setSelectedTab] = useState<string>('vendors')
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
        <HSplit>
          <Input
            placeholder="Search vendors, products or versions"
            className="bg-content1"
            startContent={
              <FontAwesomeIcon
                icon={faSearch}
                className="text-neutral-foreground"
              />
            }
          />
          <Button
            color="primary"
            className="w-40"
            startContent={<FontAwesomeIcon icon={faAdd} />}
          >
            {/* TODO: add onclick action */}
            Add {selectedTab === 'vendors' ? 'Vendor' : 'Product'}
          </Button>
        </HSplit>
      </HSplit>

      <Tabs
        variant="underlined"
        color="primary"
        className="gap-4 bg-transparent"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab key="vendors" title="Vendors">
          <VendorList />
        </Tab>
        {sosDocumentType.includes('Software') && (
          <Tab key="software" title="Software">
            <ProductList filter={(product) => product.type === 'Software'} />
          </Tab>
        )}
        {sosDocumentType.includes('Hardware') && (
          <Tab key="hardware" title="Hardware">
            <ProductList filter={(product) => product.type === 'Hardware'} />
          </Tab>
        )}
      </Tabs>
    </WizardStep>
  )
}
