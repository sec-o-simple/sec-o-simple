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
import { default as secOSimpleScheme } from './scheme'

export const supportedCSAFVersions = ['2.0']

type JSONValue = string | number | boolean | null | JSONObject | JSONArray
export interface JSONObject {
  [key: string]: JSONValue
}
interface JSONArray extends Array<JSONValue> {}

export interface HiddenField {
  path: string
  value: JSONValue
}

/**
 * Recursively checks a document against a schema and collects unknown fields (missing in schema).
 * @param schema Expected structure of the document
 * @param doc Imported document to check
 * @param path Current field path during recursion
 * @returns Array of unknown field paths
 */
function getGroupedHiddenFields(
  schema: JSONValue,
  doc: JSONValue,
  path: string = '',
  groupMap: Map<string, HiddenField> = new Map(),
): HiddenField[] {
  if (Array.isArray(doc)) {
    const schemaItem = Array.isArray(schema) ? schema[0] : undefined

    doc.forEach((item, index) => {
      const arrayPath = `${path}/*`
      if (schemaItem === undefined) {
        const groupKey = `${arrayPath}`
        if (!groupMap.has(groupKey)) {
          groupMap.set(groupKey, { path: groupKey, value: item })
        }
      } else {
        getGroupedHiddenFields(schemaItem, item, `${path}/${index}`, groupMap)
      }
    })
  } else if (isObject(doc)) {
    const schemaKeys = isObject(schema) ? Object.keys(schema) : []

    for (const key of Object.keys(doc)) {
      const currentPath = `${path}/${key}`
      const generalizedPath = currentPath.replace(/\/\d+(?=\/|$)/g, '/*')

      if (!schemaKeys.includes(key)) {
        if (!groupMap.has(generalizedPath)) {
          groupMap.set(generalizedPath, {
            path: generalizedPath,
            value: doc[key],
          })
        }
      } else {
        getGroupedHiddenFields(
          (schema as JSONObject)[key],
          (doc as JSONObject)[key],
          currentPath,
          groupMap,
        )
      }
    }
  }

  return Array.from(groupMap.values())
}

function isObject(value: JSONValue): value is JSONObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseCSAFDocument(
  csafDocument: DeepPartial<TCSAFDocument>,
): SOSDraft | undefined {
  const idGenerator = new IdGenerator()
  // TODO: generate type dynamically
  const sosDocumentType: TSOSDocumentType = 'HardwareSoftware'

  const defaultDocumentInformation = getDefaultDocumentInformation()
  const defaultRevisionHistoryEntry = getDefaultRevisionHistoryEntry()

  const csafDoc = csafDocument.document
  const documentInformation: TDocumentInformation = {
    id: csafDoc?.tracking?.id || defaultDocumentInformation.id,
    lang: csafDoc?.lang ?? defaultDocumentInformation.lang,
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

  const importCSAFDocument = (csafDocument: JSONObject): HiddenField[] => {
    const sosDocument = parseCSAFDocument(csafDocument)
    if (sosDocument) {
      importSOSDraft(sosDocument)
      return getGroupedHiddenFields(secOSimpleScheme, csafDocument)
    }
    return []
  }

  return {
    isCSAFDocument,
    isCSAFVersionSupported,
    importCSAFDocument,
  }
}
