import { TDocumentInformation } from '@/routes/document-information/types/tDocumentInformation'
import {
  TProductFamily,
  TProductTreeBranch,
} from '@/routes/products/types/tProductTreeBranch'
import { TRelationship } from '@/routes/products/types/tRelationship'
import { TVulnerability } from '@/routes/vulnerabilities/types/tVulnerability'
import { getFilename } from './csafExport/helpers'
import { download } from './download'
import useDocumentStore, {
  TSOSDocumentType,
  sosDocumentTypes,
} from './useDocumentStore'

export type SOSDraft = {
  sosDocumentType: TSOSDocumentType
  documentInformation: TDocumentInformation
  products: TProductTreeBranch[]
  families: TProductFamily[]
  relationships: TRelationship[]
  vulnerabilities: TVulnerability[]
}

export function useSOSExport() {
  const documentStore = useDocumentStore()

  const exportSOSDocument = () => {
    download(
      `${getFilename(documentStore.documentInformation.id)}.sos.json`,
      JSON.stringify(documentStore, null, 2),
    )
  }

  return { exportSOSDocument }
}

export function useSOSImport() {
  const setSOSDocumentType = useDocumentStore(
    (state) => state.setSOSDocumentType,
  )
  const updateDocumentInformation = useDocumentStore(
    (state) => state.updateDocumentInformation,
  )
  const updateProducts = useDocumentStore((state) => state.updateProducts)
  const updateFamilies = useDocumentStore((state) => state.updateFamilies)
  const updateRelationships = useDocumentStore(
    (state) => state.updateRelationships,
  )
  const updateVulnerabilities = useDocumentStore(
    (state) => state.updateVulnerabilities,
  )

  const getSOSDraft = (jsonObject: object): SOSDraft | undefined => {
    if (
      !('sosDocumentType' in jsonObject) ||
      typeof jsonObject.sosDocumentType !== 'string' ||
      !sosDocumentTypes.includes(jsonObject.sosDocumentType as TSOSDocumentType)
    ) {
      return
    }

    if (
      !('documentInformation' in jsonObject) ||
      typeof jsonObject.documentInformation !== 'object'
    ) {
      return
    }

    if (
      !('products' in jsonObject) ||
      !(jsonObject.products instanceof Array)
    ) {
      return
    }

    if (
      !('families' in jsonObject) ||
      !(jsonObject.families instanceof Array)
    ) {
      return
    }

    if (
      !('relationships' in jsonObject) ||
      typeof jsonObject.relationships !== 'object'
    ) {
      return
    }

    if (
      !('vulnerabilities' in jsonObject) ||
      typeof jsonObject.vulnerabilities !== 'object'
    ) {
      return
    }

    return {
      sosDocumentType: jsonObject.sosDocumentType,
      documentInformation: jsonObject.documentInformation,
      products: jsonObject.products,
      families: jsonObject.families,
      relationships: jsonObject.relationships,
      vulnerabilities: jsonObject.vulnerabilities,
    } as SOSDraft
  }

  const isSOSDraft = (jsonObject: object): boolean => {
    return !!getSOSDraft(jsonObject)
  }

  const importSOSDocument = (jsonObject: object): boolean => {
    const sosDraft = getSOSDraft(jsonObject)
    if (sosDraft) {
      importSOSDraft(sosDraft)
      return true
    }
    return false
  }

  const importSOSDraft = (sosDraft: SOSDraft) => {
    setSOSDocumentType(sosDraft.sosDocumentType)
    updateDocumentInformation(sosDraft.documentInformation)
    updateProducts(sosDraft.products)
    updateFamilies(sosDraft.families)
    updateRelationships(sosDraft.relationships)
    updateVulnerabilities(sosDraft.vulnerabilities)
  }

  return { isSOSDraft, importSOSDocument, importSOSDraft }
}
