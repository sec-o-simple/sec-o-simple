import { Input } from '@/components/forms/Input'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { parseProductTree } from '@/utils/csafImport/parseProductTree'
import { parseRelationships } from '@/utils/csafImport/parseRelationships'
import { useConfigStore } from '@/utils/useConfigStore'
import {
  Vendor as DatabaseVendor,
  Product,
  ProductVersion,
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
    if (selectedProducts.length === 0) return
    setSubmitting(true)
    try {
      // Start from existing tree
      const updatedProducts: TProductTreeBranch[] = [...products]

      // Attempt to fetch CSAF document (optional enrichment)
      let csafDocument: TProductDatabaseCSAFProducttree | undefined
      try {
        csafDocument = await client.fetchCSAFProducts(selectedProducts)
      } catch (e) {
        console.error('Error fetching CSAF document:', e)
      }

      // Parse CSAF product tree if available
      if (csafDocument) {
        try {
          const productTreeResult = parseProductTree(csafDocument)
          const importedFamilies = productTreeResult.families
          // Merge families (dedupe by id)
          for (const fam of importedFamilies) {
            if (!families.some((f) => f.id === fam.id)) {
              families.push(fam)
            }
          }
        } catch (e) {
          console.error('Failed to parse CSAF product tree:', e)
        }
        // Relationships (optional)
        if (csafDocument.product_tree?.relationships) {
          try {
            const importedRelationships = parseRelationships(
              csafDocument.product_tree.relationships,
              updatedProducts,
            )
            if (importedRelationships.length) {
              updateRelationships([...relationships, ...importedRelationships])
            }
          } catch (e) {
            console.error('Failed to parse CSAF relationships:', e)
          }
        }
      }

      // Build vendor/product/version structure from database for selected products
      for (const productId of selectedProducts) {
        const vendorWithProduct = vendors.find((v) =>
          v.products.some((p) => p.id === productId),
        )
        if (!vendorWithProduct) continue

        // Find or create vendor branch
        let vendorBranch = updatedProducts.find(
          (b) => b.category === 'vendor' && b.id === vendorWithProduct.id,
        )
        if (!vendorBranch) {
          vendorBranch = {
            id: vendorWithProduct.id,
            category: 'vendor',
            name: vendorWithProduct.name,
            description: vendorWithProduct.description || '',
            subBranches: [],
          }
          updatedProducts.push(vendorBranch)
        }

        // Skip if product already exists
        const dbProduct = vendorWithProduct.products.find(
          (p) => p.id === productId,
        )
        if (!dbProduct) continue
        const existingProduct = vendorBranch.subBranches.find(
          (sb) => sb.category === 'product_name' && sb.id === productId,
        )
        if (existingProduct) continue

        let versions: ProductVersion[] = []
        try {
          versions = await client.fetchProductVersions(productId)
        } catch (e) {
          console.error('Failed to process product', e)
        }

        // Build version branches
        const versionBranches: TProductTreeBranch[] = []
        for (const version of versions) {
          try {
            const helpers = await client.fetchIdentificationHelpers(version.id)
            const mappedHelpers = helpers.map((h) => {
              const metadata = JSON.parse(h.metadata)
              switch (h.category) {
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
                    hashes: metadata.file_hashes?.map(
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
            })
            const identificationHelper =
              mappedHelpers.length > 0
                ? Object.assign({}, ...mappedHelpers)
                : undefined

            versionBranches.push({
              id: version.id,
              category: 'product_version',
              name: version.name,
              description: version.description || '',
              subBranches: [],
              identificationHelper,
            })
          } catch (e) {
            console.error(
              `Failed to create version branch for ${version.name}:`,
              e,
            )
          }
        }

        // Create product branch
        const productBranch: TProductTreeBranch = {
          id: dbProduct.id,
          category: 'product_name',
          name: dbProduct.name,
          description: dbProduct.description || '',
          type: dbProduct.type === 'software' ? 'Software' : 'Hardware',
          subBranches: versionBranches,
        }
        vendorBranch.subBranches.push(productBranch)
      }

      updateProducts(updatedProducts)
      updateFamilies(families)
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
