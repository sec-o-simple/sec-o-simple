import {
  TAcknowledgment,
  TAcknowledgmentName,
} from '@/routes/document-information/types/tDocumentAcknowledgments'
import {
  TDocumentInformation,
  getDefaultDocumentInformation,
} from '@/routes/document-information/types/tDocumentInformation'
import {
  TDocumentPublisher,
  TPublisherCategory,
} from '@/routes/document-information/types/tDocumentPublisher'
import {
  TDocumentReference,
  getDefaultDocumentReference,
} from '@/routes/document-information/types/tDocumentReference'
import { getDefaultRevisionHistoryEntry } from '@/routes/document-information/types/tRevisionHistoryEntry'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import {
  CSAFRelationship,
  TRelationship,
} from '@/routes/products/types/tRelationship'
import { TNote } from '@/routes/shared/NotesList'
import { TVulnerability } from '@/routes/vulnerabilities/types/tVulnerability'
import { uid } from 'uid'
import { TCSAFDocument } from '../csafExport/csafExport'
import { TParsedNote } from '../csafExport/parseNote'
import { DeepPartial } from '../deepPartial'
import { SOSDraft, useSOSImport } from '../sosDraft'
import { TSOSDocumentType } from '../useDocumentStore'
import { IdGenerator } from './idGenerator'
import { parseNote } from './parseNote'
import { parseProductTree } from './parseProductTree'
import { parseRelationships } from './parseRelationships'
import { parseVulnerabilities } from './parseVulnerabilities'

export const supportedCSAFVersions = ['2.0']

const secOSimpleScheme = {
  document: {
    lang: 'string',
    tracking: {
      status: 'string',
      revision_history: [
        {
          date: 'string',
        },
      ],
    },
  },
}

function findMismatchesWithExtras(data, schema, path = '') {
  const mismatches = []

  const allKeys = new Set([...Object.keys(data), ...Object.keys(schema)])

  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key

    if (!(key in schema)) {
      mismatches.push(`Extra field: ${currentPath}`)
      continue
    }

    if (!(key in data)) {
      mismatches.push(`Missing field: ${currentPath}`)
      continue
    }

    if (typeof schema[key] === 'object' && schema[key] !== null) {
      if (typeof data[key] !== 'object' || data[key] === null) {
        mismatches.push(`Type mismatch at ${currentPath}: expected object`)
      } else {
        mismatches.push(
          ...findMismatchesWithExtras(data[key], schema[key], currentPath),
        )
      }
    } else {
      const expectedType = schema[key]
      const actualType = typeof data[key]

      if (actualType !== expectedType) {
        mismatches.push(
          `Type mismatch at ${currentPath}: expected ${expectedType}, got ${actualType}`,
        )
      }
    }
  }

  return mismatches
}

export function parseCSAFDocument(
  csafDocument: DeepPartial<TCSAFDocument>,
): SOSDraft | undefined {
  console.log(findMismatchesWithExtras(csafDocument, secOSimpleScheme))
  const idGenerator = new IdGenerator()
  // TODO: generate type dynamically
  const sosDocumentType: TSOSDocumentType = 'HardwareSoftware'

  const defaultDocumentInformation = getDefaultDocumentInformation()
  const defaultRevisionHistoryEntry = getDefaultRevisionHistoryEntry()

  const csafDoc = csafDocument.document
  const documentInformation: TDocumentInformation = {
    id: csafDoc?.tracking?.id || defaultDocumentInformation.id,
    language: csafDoc?.lang ?? defaultDocumentInformation.language,
    status:
      (csafDoc?.tracking?.status as TDocumentInformation['status']) ??
      defaultDocumentInformation.status,
    title: csafDoc?.title ?? defaultDocumentInformation.title,
    revisionHistory:
      csafDoc?.tracking?.revision_history?.map((revision) => ({
        id: uid(),
        date: revision?.date ?? defaultRevisionHistoryEntry.date,
        number: revision?.number ?? defaultRevisionHistoryEntry.number,
        summary: revision?.summary ?? defaultRevisionHistoryEntry.summary,
      })) ?? defaultDocumentInformation.revisionHistory,
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
          category:
            (reference?.category as TDocumentReference['category']) ??
            defaultReference.category,
        } as TDocumentReference
      }) ?? ([] as TDocumentReference[]),
    acknowledgments:
      csafDoc?.acknowledgments?.map((ack) => {
        return {
          id: uid(),
          organization: ack?.organization,
          summary: ack?.summary ?? '',
          names:
            ack?.names?.map((name) => {
              return {
                id: uid(),
                name: name,
              } as TAcknowledgmentName
            }) ?? ([] as TAcknowledgmentName[]),
        } as TAcknowledgment
      }) ?? ([] as TAcknowledgment[]),
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
