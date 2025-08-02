import pck from '@/../package.json'
import { TAcknowledgmentOutput } from '@/routes/document-information/types/tDocumentAcknowledgments'
import { TVulnerabilityProduct } from '@/routes/vulnerabilities/types/tVulnerabilityProduct'
import _ from 'lodash'
import { download } from '../download'
import { TConfig, useConfigStore } from '../useConfigStore'
import useDocumentStore, { TDocumentStore } from '../useDocumentStore'
import { useProductTreeBranch } from '../useProductTreeBranch'
import useValidationStore from '../validation/useValidationStore'
import { retrieveLatestVersion } from './latestVersion'
import { parseNote } from './parseNote'
import { parseNotes } from './parseNotes'
import { parseProductTreeBranches } from './parseProductTreeBranches'
import parseScores from './parseScores'

export type TCSAFDocument = ReturnType<typeof createCSAFDocument>

export function createCSAFDocument(
  documentStore: TDocumentStore,
  getFullProductName: (id: string) => string,
  getRelationshipFullProductName: (
    sourceVersionId: string,
    targetVersionId: string,
    category: string,
  ) => string,
  config?: TConfig,
) {
  const currentDate = new Date().toISOString()
  const documentInformation = documentStore.documentInformation
  const revisionHistory = documentInformation.revisionHistory || []

  const notes = parseNotes(documentStore, config)
  const productTree = parseProductTreeBranches(
    Object.values(documentStore.products),
    getFullProductName,
  )

  const filterProductStatus = (
    productList: TVulnerabilityProduct[],
    status: string,
  ): string[] | undefined => {
    const filteredProducts = productList.filter((p) => p.status === status)

    if (filteredProducts.length === 0) return undefined
    return filteredProducts.flatMap((p) => p.productId)
  }

  const relationships = documentStore.relationships
    .map((relationship) => {
      return relationship.relationships?.map((rel) => ({
        category: relationship.category,
        product_reference: rel.product1VersionId,
        relates_to_product_reference: rel.product2VersionId,
        full_product_name: {
          name: getRelationshipFullProductName(
            rel.product1VersionId,
            rel.product2VersionId,
            relationship.category,
          ),
          product_id: rel.relationshipId,
        },
      }))
    })
    .flat()

  const csafDocument = {
    document: {
      category: 'csaf_security_advisory',
      csaf_version: '2.0',
      tracking: {
        generator: {
          date: currentDate,
          engine: {
            version: pck.version,
            name: 'Sec-O-Simple',
          },
        },
        current_release_date:
          revisionHistory[revisionHistory.length - 1]?.date || currentDate,
        initial_release_date: revisionHistory[0]?.date || currentDate,
        revision_history: revisionHistory.map((entry) => ({
          date: entry.date,
          number: entry.number,
          summary: entry.summary,
        })),
        status: documentStore.documentInformation.status,
        version: documentStore.documentInformation.revisionHistory.length
          ? retrieveLatestVersion(
              documentStore.documentInformation.revisionHistory,
            )
          : '1',
        id: documentInformation.id,
      },
      distribution: {
        tlp: documentInformation.tlp
          ? {
              label: documentInformation.tlp?.label?.toUpperCase() || undefined,
              url: 'https://www.first.org/tlp/',
            }
          : undefined,
      },
      lang: documentInformation.lang,
      title: documentInformation.title,
      publisher: {
        category: documentInformation.publisher.category,
        contact_details: documentInformation.publisher.contactDetails,
        issuing_authority:
          documentInformation.publisher.issuingAuthority || undefined,
        name: documentInformation.publisher.name,
        namespace: documentInformation.publisher.namespace,
      },
      notes: notes.length > 0 ? notes : undefined,
      references:
        documentInformation.references.length > 0
          ? documentInformation.references?.map((reference) => ({
              summary: reference.summary,
              url: reference.url,
              category: reference.category,
            }))
          : undefined,
      acknowledgments:
        documentInformation.acknowledgments.length > 0
          ? documentInformation.acknowledgments.map((ack) => {
              const acknowledgment: TAcknowledgmentOutput = {
                organization: ack.organization || undefined,
                names:
                  ack.names && ack.names?.length > 0
                    ? ack.names?.map((name) => name.name)
                    : undefined,
                summary: ack.summary || undefined,
                urls: ack.url ? [ack.url] : undefined,
              }

              Object.keys(acknowledgment).forEach((key) => {
                const typedKey = key as keyof TAcknowledgmentOutput
                if (acknowledgment[typedKey] === undefined) {
                  delete acknowledgment[typedKey]
                }
              })

              return acknowledgment
            })
          : undefined,
    },
    product_tree: {
      branches: productTree,
      relationships: relationships.length > 0 ? relationships : undefined,
    },
    vulnerabilities: Object.values(documentStore.vulnerabilities).map(
      (vulnerability) => {
        const productStatus = () => {
          const products = vulnerability.products

          const obj = Object.entries({
            known_affected: filterProductStatus(products, 'known_affected'),
            fixed: filterProductStatus(products, 'fixed'),
            first_fixed: filterProductStatus(products, 'first_fixed'),
            first_affected: filterProductStatus(products, 'first_affected'),
            known_not_affected: filterProductStatus(
              products,
              'known_not_affected',
            ),
            last_affected: filterProductStatus(products, 'last_affected'),
            recommended: filterProductStatus(products, 'recommended'),
            under_investigation: filterProductStatus(
              products,
              'under_investigation',
            ),
          }).filter(([, value]) => value !== undefined)
          return obj.length > 0 ? Object.fromEntries(obj) : {}
        }

        const notes = vulnerability.notes.map(parseNote)
        const remediations = vulnerability.remediations?.map((remediation) => ({
          category: remediation.category,
          date: remediation.date || undefined,
          details: remediation.details,
          url: remediation.url || undefined,
          product_ids: remediation.productIds,
        }))
        const cvss4References =
          vulnerability.scores
            ?.filter((score) => score.cvssVersion === '4.0')
            .map((score) => ({
              url: `https://www.first.org/cvss/calculator/4-0#${score.vectorString}`,
              summary: `CVSS v4.0 Score`,
              category: 'external',
            })) || []

        return {
          cve: vulnerability.cve || undefined,
          title: vulnerability.title,
          references: cvss4References.length > 0 ? cvss4References : undefined,
          cwe: vulnerability.cwe
            ? {
                id: vulnerability.cwe.id,
                name: vulnerability.cwe.name,
              }
            : undefined,
          notes,
          product_status: productStatus(),
          remediations: remediations?.length > 0 ? remediations : undefined,
          scores: parseScores(vulnerability.scores),
        }
      },
    ),
  }

  return csafDocument
}

export function useCSAFExport() {
  const documentStore = useDocumentStore()
  const { isValid } = useValidationStore()
  const { getRelationshipFullProductName, getFullProductName } =
    useProductTreeBranch()
  const config = useConfigStore((store) => store.config)

  const exportCSAFDocument = () => {
    let csafDocument = createCSAFDocument(
      documentStore,
      getFullProductName,
      getRelationshipFullProductName,
      config,
    )

    // Merge with existing imported CSAF document if available
    // Our created CSAF document has priority, and is handled as the base
    csafDocument = _.merge({}, documentStore.importedCSAFDocument, csafDocument)

    const suffix = !isValid ? '_invalid' : ''
    const id = documentStore.documentInformation.id || 'csaf_document'
    const filename = id + suffix + '.json'

    download(filename, JSON.stringify(csafDocument, null, 2))
  }

  return { exportCSAFDocument }
}
