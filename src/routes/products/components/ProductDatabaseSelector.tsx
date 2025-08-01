import { Input } from '@/components/forms/Input'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { useConfigStore } from '@/utils/useConfigStore'
import {
  Vendor as DatabaseVendor,
  IdentificationHelper,
  Product,
  ProductVersion,
  useDatabaseClient,
} from '@/utils/useDatabaseClient'
import useDocumentStore from '@/utils/useDocumentStore'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal'
import { Accordion, AccordionItem, Alert, Checkbox } from '@heroui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type Vendor = DatabaseVendor & {
  products: Product[]
}

export default function ProductDatabaseSelector({ isOpen, onClose }: Props) {
  const client = useDatabaseClient()
  const config = useConfigStore((state) => state.config)
  const products = Object.values(useDocumentStore((store) => store.products))
  const updateProducts = useDocumentStore((store) => store.updateProducts)

  const { t } = useTranslation()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  useEffect(() => {
    async function fetchVendors() {
      const [dbVendors, products] = await Promise.all([
        client.fetchVendors(),
        client.fetchProducts(),
      ])

      setVendors(
        dbVendors
          .filter((v) => products.map((p) => p.vendor_id).includes(v.id))
          .map((vendor) => {
            return {
              ...vendor,
              products: products.filter(
                (product) => product.vendor_id === vendor.id,
              ),
            }
          }),
      )
    }
    fetchVendors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.products.some((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  )

  const [submitting, setSubmitting] = useState(false)

  // Helper function to map database identification helpers to CSAF format
  const mapIdentificationHelper = (helper: IdentificationHelper) => {
    const metadata = JSON.parse(helper.metadata)

    switch (helper.category) {
      case 'cpe':
        return { cpe: metadata.cpe }
      case 'models':
        return { model_numbers: metadata.models }
      case 'sbom':
        return { sbom_urls: metadata.sbom_urls }
      case 'sku':
        return { skus: metadata.skus }
      case 'uri':
        return { x_generic_uris: metadata.uris }
      case 'hashes':
        return {
          hashes: metadata.file_hashes.map(
            (hash: {
              items: { algorithm: string; value: string }[]
              filename: string
            }) => ({
              file_hashes: hash.items,
              filename: hash.filename,
            }),
          ),
        }
      case 'purl':
        return { purl: metadata.purl }
      case 'serial':
        return { serial_numbers: metadata.serial_numbers }
      default:
        return {}
    }
  }

  // Helper function to create a product version branch
  const createProductVersionBranch = async (
    version: ProductVersion,
  ): Promise<TProductTreeBranch | null> => {
    try {
      const helpers = await client.fetchIdentificationHelpers(version.id)
      const mappedHelpers = helpers.map(mapIdentificationHelper)
      const identificationHelper =
        mappedHelpers.length > 0
          ? Object.assign({}, ...mappedHelpers)
          : undefined

      return {
        id: version.id,
        category: 'product_version',
        name: version.name,
        description: '',
        subBranches: [],
        identificationHelper,
      }
    } catch (error) {
      console.error(
        `Failed to create version branch for ${version.name}:`,
        error,
      )
      return null
    }
  }

  // Helper function to create a product branch with its versions
  const createProductBranch = async (
    product: Product,
  ): Promise<TProductTreeBranch> => {
    const versions = await client.fetchProductVersions(product.id)
    const versionResults = await Promise.allSettled(
      versions.map(createProductVersionBranch),
    )

    const validVersionBranches = versionResults
      .filter(
        (result): result is PromiseFulfilledResult<TProductTreeBranch> =>
          result.status === 'fulfilled' && result.value !== null,
      )
      .map((result) => result.value)

    return {
      id: product.id,
      category: 'product_name',
      name: product.name,
      description: product.description || '',
      type: product.type === 'software' ? 'Software' : 'Hardware',
      subBranches: validVersionBranches,
    }
  }

  // Helper function to find or create a vendor branch
  const getOrCreateVendorBranch = (vendor: Vendor): TProductTreeBranch => {
    const existingVendor = products.find(
      (branch) => branch.category === 'vendor' && branch.id === vendor.id,
    )

    return (
      existingVendor || {
        id: vendor.id,
        category: 'vendor',
        name: vendor.name,
        description: vendor.description || '',
        subBranches: [],
      }
    )
  }

  // Helper function to process products for a vendor
  const processVendorProducts = async (
    vendor: Vendor,
  ): Promise<TProductTreeBranch | null> => {
    const selectedVendorProducts = vendor.products.filter((product) =>
      selectedProducts.includes(product.id),
    )

    if (selectedVendorProducts.length === 0) {
      return null
    }

    const vendorBranch = getOrCreateVendorBranch(vendor)

    // Process each selected product
    for (const product of selectedVendorProducts) {
      // Skip if product already exists under this vendor
      const productExists = vendorBranch.subBranches.some(
        (branch) =>
          branch.category === 'product_name' && branch.id === product.id,
      )

      if (productExists) {
        continue
      }

      try {
        const productBranch = await createProductBranch(product)
        vendorBranch.subBranches.push(productBranch)
      } catch (error) {
        console.error(`Failed to process product ${product.name}:`, error)
      }
    }

    return vendorBranch
  }

  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) {
      return
    }

    setSubmitting(true)

    try {
      let updatedProducts: TProductTreeBranch[] = [...products]

      // Process all vendors in parallel
      const vendorResults = await Promise.allSettled(
        vendors.map(processVendorProducts),
      )

      // Update the products list with processed vendors
      for (const result of vendorResults) {
        if (result.status === 'fulfilled' && result.value) {
          const processedVendor = result.value
          const existingVendorIndex = updatedProducts.findIndex(
            (branch) => branch.id === processedVendor.id,
          )

          if (existingVendorIndex >= 0) {
            updatedProducts[existingVendorIndex] = processedVendor
          } else {
            updatedProducts.push(processedVendor)
          }
        }
      }

      updateProducts(updatedProducts)
    } catch (error) {
      console.error('Failed to add products:', error)
    } finally {
      setSubmitting(false)
      setSelectedProducts([])
      setSearchQuery('')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t('products.import.title')}
            </ModalHeader>
            <ModalBody>
              <p>{t('products.import.description')}</p>
              <Alert className="mt-2" color="default">
                <p>
                  {t('products.import.warning')}{' '}
                  <Link
                    to={config?.productDatabase?.url || '#'}
                    className="underline"
                    target="_blank"
                  >
                    {t('products.import.database')}
                  </Link>
                </p>
              </Alert>
              <div className="py-4">
                <Input
                  placeholder={t('products.import.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                  startContent={
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-neutral-foreground"
                    />
                  }
                />

                {vendors.length === 0 && (
                  <Alert color="warning">
                    {t('products.import.noVendors')}
                  </Alert>
                )}

                <Accordion variant="shadow">
                  {filteredVendors.map((vendor) => {
                    const vendorProducts = vendor.products.map(
                      (product) => product.id,
                    )
                    const selectedProductCount = selectedProducts.filter((id) =>
                      vendorProducts.includes(id),
                    ).length
                    const selectedAllProducts =
                      selectedProductCount === vendor.products.length

                    return (
                      <AccordionItem
                        key={vendor.id}
                        title={vendor.name}
                        subtitle={
                          selectedProductCount
                            ? selectedAllProducts
                              ? t('products.import.selectedAll')
                              : t('products.import.selected', {
                                  count: selectedProductCount,
                                })
                            : ''
                        }
                        startContent={
                          <Checkbox
                            isSelected={selectedAllProducts}
                            onChange={() => {
                              setSelectedProducts((prev) => {
                                if (selectedAllProducts) {
                                  return prev.filter(
                                    (id) => !vendorProducts.includes(id),
                                  )
                                } else {
                                  return [...prev, ...vendorProducts]
                                }
                              })
                            }}
                          />
                        }
                      >
                        <div className="ml-4 flex flex-col gap-2 pb-4">
                          {vendor.products.map((product) => (
                            <Checkbox
                              key={product.id}
                              isSelected={selectedProducts.includes(product.id)}
                              onChange={(e) => {
                                const isChecked = e.target.checked
                                setSelectedProducts((prev) =>
                                  isChecked
                                    ? [...prev, product.id]
                                    : prev.filter((id) => id !== product.id),
                                )
                              }}
                            >
                              {product.name}
                            </Checkbox>
                          ))}
                        </div>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                {t('common.cancel')}
              </Button>
              <Button
                color="primary"
                isLoading={submitting}
                onPress={handleAddProducts}
                isDisabled={selectedProducts.length === 0}
              >
                {t('products.import.add', { count: selectedProducts.length })}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
