import {
  TDocumentInformation,
  getDefaultDocumentInformation,
} from '@/routes/document-information/types/tDocumentInformation'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { TRelationship } from '@/routes/products/types/tRelationship'
import { TVulnerability } from '@/routes/vulnerabilities/types/tVulnerability'
import { create } from 'zustand'

export type TSOSDocumentType =
  | 'Software'
  | 'HardwareSoftware'
  | 'HardwareFirmware'
  | 'VexSoftware'
  | 'VexHardwareSoftware'
  | 'VexHardwareFirmware'
  | 'VexSbom'

export type TDocumentStore = {
  sosDocumentType: TSOSDocumentType
  setSOSDocumentType: (type: TSOSDocumentType) => void

  documentInformation: TDocumentInformation
  products: TProductTreeBranch[]
  relationships: TRelationship[]
  vulnerabilities: TVulnerability[]

  updateDocumentInformation: (update: TDocumentInformation) => void
  updateProducts: (update: TProductTreeBranch[]) => void
  updateRelationships: (update: TRelationship[]) => void
  updateVulnerabilities: (update: TVulnerability[]) => void
}

const useDocumentStore = create<TDocumentStore>((set) => ({
  sosDocumentType: 'Software',
  setSOSDocumentType: (type: TSOSDocumentType) =>
    set({ sosDocumentType: type }),

  documentInformation: getDefaultDocumentInformation(),
  updateDocumentInformation: (update: TDocumentInformation) =>
    set({ documentInformation: update }),

  products: [],
  updateProducts: (update: TProductTreeBranch[]) => set({ products: update }),

  // TODO: add this in sosDraftExport/Import after that was merged
  relationships: [],
  updateRelationships: (update: TRelationship[]) =>
    set({ relationships: update }),

  vulnerabilities: [],
  updateVulnerabilities: (update: TVulnerability[]) =>
    set({ vulnerabilities: update }),
}))

export default useDocumentStore
