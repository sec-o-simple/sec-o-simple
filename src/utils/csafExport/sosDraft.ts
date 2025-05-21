import { TDocumentInformation } from '@/routes/document-information/types/tDocumentInformation'
import { download } from '../download'
import useDocumentStore, {
  TSOSDocumentType,
  sosDocumentTypes,
} from '../useDocumentStore'
import { getFilename } from './helpers'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { TVulnerability } from '@/routes/vulnerabilities/types/tVulnerability'

export type SOSDraft = {
  sosDocumentType: TSOSDocumentType
  documentInformation: TDocumentInformation
  products: TProductTreeBranch[]
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
      !('vulnerabilities' in jsonObject) ||
      typeof jsonObject.vulnerabilities !== 'object'
    ) {
      return
    }

    return {
      sosDocumentType: jsonObject.sosDocumentType,
      documentInformation: jsonObject.documentInformation,
      products: jsonObject.products,
      vulnerabilities: jsonObject.vulnerabilities,
    } as SOSDraft
  }

  const isSOSDraft = (jsonObject: object): boolean => {
    return !!getSOSDraft(jsonObject)
  }

  const importSOSDocument = (jsonObject: object): boolean => {
    const sosDraft = getSOSDraft(jsonObject)
    if (sosDraft) {
      console.log(sosDraft)
      setSOSDocumentType(sosDraft.sosDocumentType)
      updateDocumentInformation(sosDraft.documentInformation)
      updateProducts(sosDraft.products)
      updateVulnerabilities(sosDraft.vulnerabilities)
      return true
    }
    return false
  }

  return { isSOSDraft, importSOSDocument }
}
