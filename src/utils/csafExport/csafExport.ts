import { calculateBaseScore, calculateQualScore } from 'cvss4'
import { download } from '../download'
import useDocumentStore, { TDocumentStore } from '../useDocumentStore'
import generateRelationships from './generateRelationships'
import { getFilename } from './helpers'
import { retrieveLatestVersion } from './latestVersion'
import { parseNote } from './parseNote'
import { parseProductTreeBranches } from './parseProductTreeBranches'
import { PidGenerator } from './pidGenerator'

export type TCSAFDocument = ReturnType<typeof createCSAFDocument>

export function createCSAFDocument(documentStore: TDocumentStore) {
  const pidGenerator = new PidGenerator()
  const currentDate = new Date().toISOString()

  const csafDocument = {
    document: {
      category: 'csaf_security_advisory',
      csaf_version: '2.0',
      tracking: {
        generator: {
          date: currentDate,
          engine: {
            version: '0.0.1',
            name: 'Sec-O-Simple',
          },
        },
        current_release_date: currentDate,
        initial_release_date: currentDate,
        revision_history: documentStore.documentInformation.revisionHistory.map(
          (entry) => ({
            date: entry.date,
            number: entry.number,
            summary: entry.summary,
          }),
        ),
        status: documentStore.documentInformation.status,
        version: documentStore.documentInformation.revisionHistory.length
          ? retrieveLatestVersion(
              documentStore.documentInformation.revisionHistory,
            )
          : '1',
        id: documentStore.documentInformation.id,
      },
      lang: documentStore.documentInformation.language,
      title: documentStore.documentInformation.title,
      publisher: {
        category: documentStore.documentInformation.publisher.category,
        contact_details:
          documentStore.documentInformation.publisher.contactDetails,
        issuing_authority:
          documentStore.documentInformation.publisher.issuingAuthority ||
          undefined,
        name: documentStore.documentInformation.publisher.name,
        namespace: documentStore.documentInformation.publisher.namespace,
      },
      notes: documentStore.documentInformation.notes.map(parseNote),
      references: documentStore.documentInformation.references.map(
        (reference) => ({
          summary: reference.summary,
          url: reference.url,
          category: reference.category,
        }),
      ),
    },
    product_tree: {
      branches: parseProductTreeBranches(
        Object.values(documentStore.products),
        pidGenerator,
      ),
      relationships: generateRelationships(
        documentStore.relationships,
        pidGenerator,
      ),
    },
    vulnerabilities: Object.values(documentStore.vulnerabilities).map(
      (vulnerability) => ({
        cve: vulnerability.cve || undefined,
        title: vulnerability.title,
        cwe: vulnerability.cwe
          ? {
              id: vulnerability.cwe.id,
              name: vulnerability.cwe.name,
            }
          : undefined,
        notes: vulnerability.notes.map(parseNote),
        product_status: {
          known_affected: vulnerability.products.map((p) =>
            pidGenerator.getPid(p.firstAffectedVersionId),
          ),
          fixed: vulnerability.products.map((p) =>
            pidGenerator.getPid(p.firstFixedVersionId),
          ),
        },
        remediations: vulnerability.remediations.map((remediation) => ({
          category: remediation.category,
          date: remediation.date,
          details: remediation.details,
          url: remediation.url,
          product_ids: remediation.productIds.map((id) =>
            pidGenerator.getPid(id),
          ),
        })),
        scores: vulnerability.scores.map((score) => {
          let baseScore = 0
          let baseSeverity = ''

          try {
            baseScore = calculateBaseScore(score.vectorString)
            baseSeverity = calculateQualScore(baseScore).toUpperCase()
          } catch {
            // If the score is invalid, we leave baseScore and baseSeverity as defaults
            // as there will be errors already in the vectorString
          }

          return {
            ['cvss_v3']: {
              version: '3.1',
              vectorString: score.vectorString,
              baseScore,
              baseSeverity,
            },
            products: score.productIds.map((id) => pidGenerator.getPid(id)),
          }
        }),
      }),
    ),
  }

  return csafDocument
}

export function useCSAFExport() {
  const documentStore = useDocumentStore()

  const exportCSAFDocument = () => {
    const csafDocument = createCSAFDocument(documentStore)

    download(
      `${getFilename(documentStore.documentInformation.id)}.json`,
      JSON.stringify(csafDocument, null, 2),
    )
  }

  return { exportCSAFDocument }
}
