import WizardStep from '@/components/WizardStep'
import { Tab, Tabs } from '@heroui/tabs'
import { useState } from 'react'
import VendorList from './VendorList'
import useDocumentStore from '@/utils/useDocumentStore'
import ProductList from './ProductList'
import { useTranslation } from 'react-i18next'
import usePageVisit from '@/utils/validation/usePageVisit'
import ProductDatabaseSelector from './components/ProductDatabaseSelector'
import { Button } from '@heroui/button'
import { useConfigStore } from '@/utils/useConfigStore'

export default function ProductManagement() {
  usePageVisit()
  const { t } = useTranslation()

  const [selectedTab, setSelectedTab] = useState<string>('Vendors')
  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)
  const [modalOpen, setModalOpen] = useState(false)
  const config = useConfigStore((state) => state.config)

  const productDbEnabled =
    config?.productDatabase?.enabled && config?.productDatabase?.url

  return (
    <WizardStep
      progress={2}
      onBack={'/document-information/references'}
      onContinue={'/vulnerabilities'}
      noContentWrapper
    >
      {productDbEnabled && (
        <ProductDatabaseSelector
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
      <div className="flex w-full items-center justify-between rounded-lg border-1 border-default-200 bg-white p-8">
        <p className="text-xl font-semibold">{t('products.manage')}</p>

        {productDbEnabled && (
          <Button
            variant="solid"
            color="primary"
            onPress={() => setModalOpen(true)}
          >
            {t('products.import.title')}
          </Button>
        )}
      </div>

      <div className="px-6">
        <Tabs
          className="w-full"
          color="primary"
          variant="light"
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
        >
          <Tab key="Vendors" title={t('products.vendors')}>
            <VendorList />
          </Tab>
          {sosDocumentType.includes('Software') && (
            <Tab key="Software" title={t('products.software')}>
              <ProductList productType="Software" />
            </Tab>
          )}
          {sosDocumentType.includes('Hardware') && (
            <Tab key="Hardware" title={t('products.hardware')}>
              <ProductList productType="Hardware" />
            </Tab>
          )}
        </Tabs>
      </div>
    </WizardStep>
  )
}
