import { Input } from '@/components/forms/Input'
import { useConfigStore } from '@/utils/useConfigStore'
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
import { useState } from 'react'
import { Link } from 'react-router'

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface Product {
  id: string
  name: string
}

interface Vendor {
  id: string
  name: string
  products: Product[]
}

export default function ProductDatabaseSelector({ isOpen, onClose }: Props) {
  const config = useConfigStore((state) => state.config)

  const vendors: Vendor[] = [
    {
      id: 'vendor1',
      name: 'Vendor 1',
      products: [
        { id: 'product1', name: 'Product A' },
        { id: 'product2', name: 'Product B' },
      ],
    },
    {
      id: 'vendor2',
      name: 'Vendor 2',
      products: [
        { id: 'product3', name: 'Product C' },
        { id: 'product4', name: 'Product D' },
        { id: 'product5', name: 'Product E' },
      ],
    },
  ]

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

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
                    to={config?.productDatabase.url || '#'}
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
                  className="mb-2"
                  startContent={
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-neutral-foreground"
                    />
                  }
                />

                <Accordion variant="shadow">
                  {vendors.map((vendor) => {
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
                onPress={onClose}
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
