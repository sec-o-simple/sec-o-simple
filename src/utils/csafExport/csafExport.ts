import pck from '@/../package.json'
import { TAcknowledgmentOutput } from '@/routes/document-information/types/tDocumentAcknowledgments'
import { TVulnerabilityProduct } from '@/routes/vulnerabilities/types/tVulnerabilityProduct'
import _ from 'lodash'
import { download } from '../download'
import useDocumentStore, { TDocumentStore } from '../useDocumentStore'
import useValidationStore from '../validation/useValidationStore'
import generateRelationships from './generateRelationships'
import { retrieveLatestVersion } from './latestVersion'
import { parseNote } from './parseNote'
import { parseProductTreeBranches } from './parseProductTreeBranches'
import parseScore from './parseScore'
import { PidGenerator } from './pidGenerator'

export type TCSAFDocument = ReturnType<typeof createCSAFDocument>

export function createCSAFDocument(documentStore: TDocumentStore) {
  const pidGenerator = new PidGenerator()
  const currentDate = new Date().toISOString()
  const documentInformation = documentStore.documentInformation
  const revisionHistory = documentInformation.revisionHistory || []

  const filterProductStatus = (
    productList: TVulnerabilityProduct[],
    status: string,
  ) => {
    const products = productList.filter(
      (p) => p.status === status && p.versions.length > 0,
    )
    return products.length > 0
      ? products.flatMap((p) => p.versions.map((v) => pidGenerator.getPid(v)))
      : undefined
  }

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
      notes:
        documentInformation.notes.length > 0
          ? documentInformation.notes.map(parseNote)
          : undefined,
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
      branches: parseProductTreeBranches(
        Object.values(documentStore.products),
        pidGenerator,
      ),
      relationships: documentStore.relationships.length
        ? generateRelationships(documentStore.relationships, pidGenerator)
        : undefined,
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

        return {
          cve: vulnerability.cve || undefined,
          title: vulnerability.title,
          cwe: vulnerability.cwe
            ? {
                id: vulnerability.cwe.id,
                name: vulnerability.cwe.name,
              }
            : undefined,
          notes: vulnerability.notes.map(parseNote),
          product_status: productStatus(),
          remediations: vulnerability.remediations?.map((remediation) => ({
            category: remediation.category,
            date: remediation.date || undefined,
            details: remediation.details,
            url: remediation.url || undefined,
            product_ids: remediation.productIds.map((id) =>
              pidGenerator.getPid(id),
            ),
          })),
          scores: vulnerability.scores.map((score) =>
            parseScore(score, pidGenerator),
          ),
        }
      },
    ),
  }

  return csafDocument
}

export function useCSAFExport() {
  const documentStore = useDocumentStore()
  const { isValid } = useValidationStore()

  const exportCSAFDocument = () => {
    let csafDocument = createCSAFDocument(documentStore)

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
