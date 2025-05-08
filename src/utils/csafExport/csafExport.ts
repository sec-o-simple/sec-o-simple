import { download } from '../download'
import useDocumentStore, { TDocumentStore } from '../useDocumentStore'
import { getFilename } from './helpers'
import { parseNote } from './parseNote'
import { parseProductTreeBranches } from './parseProductTreeBranches'
import { PidGenerator } from './pidGenerator'

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
        revision_history: [
          {
            date: currentDate,
            number: '1',
            summary: 'Initial revision',
          },
        ],
        status: 'final',
        version: '1',
        id: documentStore.documentInformation.id,
      },
      lang: documentStore.documentInformation.language,
      title: documentStore.documentInformation.title,
      publisher: {
        category: documentStore.documentInformation.publisher.category,
        contact_details:
          documentStore.documentInformation.publisher.contactDetails,
        issuing_authority:
          documentStore.documentInformation.publisher.issuingAuthority,
        name: documentStore.documentInformation.publisher.name,
        namespace: documentStore.documentInformation.publisher.namespace,
      },
      notes: documentStore.documentInformation.notes.map(parseNote),
      references: documentStore.documentInformation.references.map(
        (reference) => ({
          summary: reference.summary,
          url: reference.url,
        }),
      ),
    },
    product_tree: {
      branches: parseProductTreeBranches(
        Object.values(documentStore.products),
        pidGenerator,
      ),
    },
    vulnerabilities: Object.values(documentStore.vulnerabilities).map(
      (vulnerability) => ({
        cve: vulnerability.cve,
        title: vulnerability.title,
        cwe: {
          // TODO: add further CWE support
          id: 'not supported by sec-o-simple yet',
          name: vulnerability.cwe,
        },
        notes: vulnerability.notes.map(parseNote),
        product_status: {
          known_affected: vulnerability.products.map((p) =>
            pidGenerator.getPid(p.firstAffectedVersionId),
          ),
          fixed: vulnerability.products.map((p) =>
            pidGenerator.getPid(p.firstFixedVersionId),
          ),
        },
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
