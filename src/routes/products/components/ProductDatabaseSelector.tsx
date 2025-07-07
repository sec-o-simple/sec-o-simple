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
import { useDatabaseClient, Product, Vendor as DatabaseVendor } from '@/utils/useDatabaseClient'
import { useConfigStore } from '@/utils/useConfigStore'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type Vendor = DatabaseVendor & {
  products: Product[]
}

export default function ProductDatabaseSelector({ isOpen, onClose }: Props) {
  const client = useDatabaseClient();
  const config = useConfigStore((state) => state.config)
  const { addPTB, updatePTB, rootBranch } = useProductTreeBranch()

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  useEffect(() => {
    async function fetchVendors() {
      const [dbVendors, products] = await Promise.all([
        client.fetchVendors(),
        client.fetchProducts(),
      ])

      setVendors(dbVendors.filter(v => products.map(p => p.vendor_id).includes(v.id)).map((vendor) => {
        return {
          ...vendor,
          products: products.filter((product) => product.vendor_id === vendor.id),
        }
      }));
    }
    fetchVendors()
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const filteredVendors = vendors.filter((vendor) =>
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
      await Promise.allSettled(vendors.map(async (vendor) => {
        const selectedVendorProducts = vendor.products.filter(prodct =>
          selectedProducts.includes(prodct.id)
        )

        // If no products selected for this vendor, skip
        if (selectedVendorProducts.length === 0) return

        // Check if vendor already exists in document
        let existingVendor = rootBranch.find(ptb =>
          ptb.category === 'vendor' && ptb.id === vendor.id
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
        await Promise.allSettled(selectedVendorProducts.map(async (product) => {
          // Check if product already exists under this vendor
          const existingProduct = existingVendor.subBranches.find(ptb =>
            ptb.category === 'product_name' && ptb.id === product.id
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
            subBranches: versions.map(version => (
              {
                id: version.id,
                category: 'product_version',
                name: version.name,
                description: version.description,
                subBranches: [],
              }
            )),
          }

          existingVendor.subBranches.push(productBranch)
        }))

        if (!rootBranch.find(ptb => ptb.id === existingVendor.id)) {
          addPTB(existingVendor)
        } else {
          updatePTB(existingVendor)
        }
      }))
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
              Add from Database
            </ModalHeader>
            <ModalBody>
              <p>
                Choose one or more products from your existing product database
                to add to your document.
              </p>
              <Alert className="mt-2" color="default">
                <p>
                  Changes to the added products will not be persisted. To
                  modify, add, or delete products, please visit the{' '}
                  <Link
                    to={config?.productDatabase?.url || '#'}
                    className="underline"
                    target="_blank"
                  >
                    database
                  </Link>
                  .
                </p>
              </Alert>
              <div className="py-4">
                <Input
                  placeholder="Search vendors and products"
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
                    No vendors found in the database. Please add vendors and
                    products to the database before using this feature.
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
                              ? 'selected all products'
                              : 'selected ' +
                              selectedProductCount +
                              ' product' +
                              (selectedProductCount !== 1 ? 's' : '')
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
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={submitting}
                onPress={handleAddProducts}
                isDisabled={selectedProducts.length === 0}
              >
                Add {selectedProducts.length} Product
                {selectedProducts.length !== 1 ? 's' : ''}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
