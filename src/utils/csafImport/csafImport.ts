import {
  TDocumentInformation,
  getDefaultDocumentInformation,
} from '@/routes/document-information/types/tDocumentInformation'
import { SOSDraft, useSOSImport } from '../sosDraft'
import { TSOSDocumentType } from '../useDocumentStore'
import { TCSAFDocument } from '../csafExport/csafExport'
import {
  TDocumentPublisher,
  TPublisherCategory,
} from '@/routes/document-information/types/tDocumentPublisher'
import { DeepPartial } from '../deepPartial'
import {
  TDocumentReference,
  getDefaultDocumentReference,
} from '@/routes/document-information/types/tDocumentReference'
import { parseNote } from './parseNote'
import { TNote } from '@/routes/shared/NotesList'
import { TParsedNote } from '../csafExport/parseNote'
import { IdGenerator } from './idGenerator'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { parseProductTree } from './parseProductTree'
import { parseVulnerabilities } from './parseVulnerabilities'
import {
  CSAFRelationship,
  TRelationship,
} from '@/routes/products/types/tRelationship'
import { TVulnerability } from '@/routes/vulnerabilities/types/tVulnerability'
import { parseRelationships } from './parseRelationships'

export const supportedCSAFVersions = ['2.0']

export function parseCSAFDocument(
  csafDocument: DeepPartial<TCSAFDocument>,
): SOSDraft | undefined {
  const idGenerator = new IdGenerator()
  // TODO: generate type dynamically
  const sosDocumentType: TSOSDocumentType = 'HardwareSoftware'

  const defaultDocumentInformation = getDefaultDocumentInformation()
  const csafDoc = csafDocument.document
  const documentInformation: TDocumentInformation = {
    id: csafDoc?.tracking?.id || defaultDocumentInformation.id,
    language: csafDoc?.lang ?? defaultDocumentInformation.language,
    title: csafDoc?.title ?? defaultDocumentInformation.title,
    publisher: {
      name:
        csafDoc?.publisher?.name ?? defaultDocumentInformation.publisher.name,
      category:
        (csafDoc?.publisher?.category as TPublisherCategory) ??
        defaultDocumentInformation.publisher.category,
      namespace:
        csafDoc?.publisher?.namespace ??
        defaultDocumentInformation.publisher.namespace,
      contactDetails:
        csafDoc?.publisher?.contact_details ??
        defaultDocumentInformation.publisher.contactDetails,
      issuingAuthority:
        csafDoc?.publisher?.issuing_authority ??
        defaultDocumentInformation.publisher.issuingAuthority,
    } as TDocumentPublisher,
    notes:
      csafDoc?.notes?.map((note) => parseNote(note as TParsedNote)) ??
      ([] as TNote[]),
    references:
      csafDoc?.references?.map((reference) => {
        const defaultReference = getDefaultDocumentReference()
        return {
          id: defaultReference.id,
          summary: reference?.summary ?? defaultReference.summary,
          url: reference?.url ?? defaultReference.url,
        } as TDocumentReference
      }) ?? ([] as TDocumentReference[]),
  }

  const products: TProductTreeBranch[] = parseProductTree(
    csafDocument as TCSAFDocument,
    idGenerator,
  )

  const relationships: TRelationship[] = parseRelationships(
    (csafDocument.product_tree?.relationships ?? []) as CSAFRelationship[],
    idGenerator,
    products,
  )

  const vulnerabilities: TVulnerability[] = parseVulnerabilities(
    csafDocument as TCSAFDocument,
    idGenerator,
    products,
  )

  return {
    sosDocumentType,
    documentInformation,
    products,
    relationships,
    vulnerabilities,
  }
}

export function useCSAFImport() {
  const { importSOSDraft } = useSOSImport()

  const getCSAFDocumentVersion = (
    documentObject: object,
  ): string | undefined => {
    if (
      'document' in documentObject &&
      documentObject.document !== null &&
      typeof documentObject.document === 'object' &&
      'csaf_version' in documentObject.document &&
      typeof documentObject.document.csaf_version === 'string'
    ) {
      return documentObject.document.csaf_version
    }
  }

  const isCSAFDocument = (documentObject: object): boolean => {
    return getCSAFDocumentVersion(documentObject) !== undefined
  }

  const isCSAFVersionSupported = (documentObject: object): boolean => {
    return supportedCSAFVersions.includes(
      getCSAFDocumentVersion(documentObject) ?? 'NaV',
    )
  }

  const importCSAFDocument = (csafDocument: object): boolean => {
    const sosDocument = parseCSAFDocument(csafDocument)
    if (sosDocument) {
      importSOSDraft(sosDocument)
      return true
    }
    return false
  }

  return { isCSAFDocument, isCSAFVersionSupported, importCSAFDocument }
}
