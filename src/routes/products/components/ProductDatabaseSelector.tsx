import { Input } from '@/components/forms/Input'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal'
import { Accordion, AccordionItem, Alert, Checkbox } from '@heroui/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  useDatabaseClient,
  Product,
  Vendor as DatabaseVendor,
} from '@/utils/useDatabaseClient'
import { useConfigStore } from '@/utils/useConfigStore'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { useTranslation } from 'react-i18next'
import useDocumentStore from '@/utils/useDocumentStore'

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

  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) {
      return
    }

    setSubmitting(true)

    try {
      let updatedProducts: TProductTreeBranch[] = products.slice()

      await Promise.allSettled(
        vendors.map(async (vendor) => {
          const selectedVendorProducts = vendor.products.filter((prodct) =>
            selectedProducts.includes(prodct.id),
          )

          // If no products selected for this vendor, skip
          if (selectedVendorProducts.length === 0) return

          // Check if vendor already exists in document
          let existingVendor = products.find(
            (ptb) => ptb.category === 'vendor' && ptb.id === vendor.id,
          )

          // If not, create a new vendor branch
          if (!existingVendor) {
            existingVendor = {
              id: vendor.id,
              category: 'vendor',
              name: vendor.name,
              description: vendor.description || '',
              subBranches: [],
            }
          }

          // Add products to vendor
          await Promise.allSettled(
            selectedVendorProducts.map(async (product) => {
              // Check if product already exists under this vendor
              const existingProduct = existingVendor.subBranches.find(
                (ptb) =>
                  ptb.category === 'product_name' && ptb.id === product.id,
              )

              if (existingProduct) return

              const versions = await client.fetchProductVersions(product.id)

              // Create new product branch with a default version
              const productBranch: TProductTreeBranch = {
                id: product.id,
                category: 'product_name',
                name: product.name,
                description: product.description || '',
                type: product.type === 'software' ? 'Software' : 'Hardware',
                subBranches: versions.map((version) => ({
                  id: version.id,
                  category: 'product_version',
                  name: version.name,
                  description: version.description,
                  subBranches: [],
                })),
              }

              existingVendor.subBranches.push(productBranch)
            }),
          )

          if (!products.find((ptb) => ptb.id === existingVendor.id)) {
            updatedProducts.push(existingVendor)
          } else {
            updatedProducts = products.map((ptb) =>
              ptb.id === existingVendor.id ? existingVendor : ptb,
            )
          }
        }),
      )

      updateProducts(updatedProducts)
    } finally {
      setSubmitting(false)
      setSelectedProducts([])
      setSearchQuery('')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
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
