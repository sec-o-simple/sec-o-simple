import { Input } from '@/components/forms/Input'
import { parseProductTree } from '@/utils/csafImport/parseProductTree'
import { parseRelationships } from '@/utils/csafImport/parseRelationships'
import { useConfigStore } from '@/utils/useConfigStore'
import {
  Vendor as DatabaseVendor,
  Product,
  TProductDatabaseCSAFProducttree,
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
import { TProductTreeBranch } from '../types/tProductTreeBranch'

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
  const products = Object.values(useDocumentStore((state) => state.products))
  const {
    updateProducts,
    families,
    updateFamilies,
    relationships,
    updateRelationships,
  } = useDocumentStore()

  const { t } = useTranslation()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [dbProducts, setDBProducts] = useState<Product[]>([])

  useEffect(() => {
    async function fetchVendors() {
      const [dbVendors, products] = await Promise.all([
        client.fetchVendors(),
        client.fetchProducts(),
      ])

      setDBProducts(products)

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
    if (selectedProducts.length === 0) return
    setSubmitting(true)
    try {
      // Attempt to fetch CSAF document
      let csafDocument: TProductDatabaseCSAFProducttree | undefined
      try {
        csafDocument = await client.fetchCSAFProducts(selectedProducts)
      } catch (e) {
        console.error('Error fetching CSAF document:', e)
      }

      const { products: importedPTB, families: importedFamilies } =
        parseProductTree({
          product_tree: csafDocument?.product_tree,
        })

      // Filter out existing products to avoid ID conflicts, and avoid duplicate vendors too
      // We identify vendors by their names, because Vendor-IDs are not within the CSAF standard
      const mergedPTB = [...products]
      importedPTB.forEach((importedVendor) => {
        const existingVendorIndex = mergedPTB.findIndex(
          (v) => v.name === importedVendor.name,
        )

        // Enrich products with type from database
        const importedProducts: TProductTreeBranch[] =
          importedVendor.subBranches.map((p) => ({
            ...p,
            type:
              dbProducts.find((dbP) => dbP.id === p.id)?.type === 'hardware'
                ? 'Hardware'
                : 'Software',
          }))

        if (existingVendorIndex >= 0) {
          // Vendor exists, merge products
          const existingVendor = mergedPTB[existingVendorIndex]
          const mergedSubBranches = [
            ...existingVendor.subBranches.filter((existingProduct) => {
              return !importedProducts.find(
                (impProduct) => impProduct.id === existingProduct.id,
              )
            }),
            ...importedProducts,
          ]
          mergedPTB[existingVendorIndex] = {
            ...existingVendor,
            subBranches: mergedSubBranches,
          }
        } else {
          // New vendor, add directly
          mergedPTB.push({
            ...importedVendor,
            subBranches: importedProducts,
          })
        }
      })
      updateProducts(mergedPTB)

      // Merge relationships, avoiding duplicates
      if (csafDocument?.product_tree?.relationships) {
        const newRelationships = parseRelationships(
          csafDocument?.product_tree?.relationships,
          mergedPTB,
        )
        const mergedRelationships = [
          ...relationships.filter((rel) => {
            return !newRelationships.find(
              (newRel) =>
                newRel.productId1 === rel.productId1 &&
                newRel.productId2 === rel.productId2 &&
                newRel.category === rel.category,
            )
          }),
          ...newRelationships,
        ]
        updateRelationships(mergedRelationships)
      }

      // Filter out existing families to avoid ID conflicts
      const mergedFamilies = [
        ...families.filter((family) => {
          return !importedFamilies.find(
            (impFamily) => impFamily.id === family.id,
          )
        }),
        ...importedFamilies,
      ]
      updateFamilies(mergedFamilies)
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
                      className="text-slate-500"
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
