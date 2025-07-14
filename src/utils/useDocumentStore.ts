import {
  TDocumentInformation,
  getDefaultDocumentInformation,
} from '@/routes/document-information/types/tDocumentInformation'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { TRelationship } from '@/routes/products/types/tRelationship'
import { TVulnerability } from '@/routes/vulnerabilities/types/tVulnerability'
import { create } from 'zustand'
import { TCSAFDocument } from './csafExport/csafExport'
import { DeepPartial } from './deepPartial'

export const sosDocumentTypes = [
  'Software',
  'HardwareSoftware',
  'HardwareFirmware',
  'VexSoftware',
  'VexHardwareSoftware',
  'VexHardwareFirmware',
  'VexSbom',
] as const

export type TSOSDocumentType = (typeof sosDocumentTypes)[number]

export type TDocumentStore = {
  sosDocumentType: TSOSDocumentType
  setSOSDocumentType: (type: TSOSDocumentType) => void

  documentInformation: TDocumentInformation
  products: TProductTreeBranch[]
  relationships: TRelationship[]
  vulnerabilities: TVulnerability[]

  csafDocument: DeepPartial<TCSAFDocument>
  setCSAFDocument: (update: DeepPartial<TCSAFDocument>) => void

  updateDocumentInformation: (update: TDocumentInformation) => void
  updateProducts: (update: TProductTreeBranch[]) => void
  updateRelationships: (update: TRelationship[]) => void
  updateVulnerabilities: (update: TVulnerability[]) => void

  reset: () => void
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

  relationships: [],
  updateRelationships: (update: TRelationship[]) =>
    set({ relationships: update }),

  vulnerabilities: [],
  updateVulnerabilities: (update: TVulnerability[]) =>
    set({ vulnerabilities: update }),

  csafDocument: {},
  setCSAFDocument: (update: DeepPartial<TCSAFDocument>) =>
    set((state) => ({
      csafDocument: { ...state.csafDocument, ...update },
    })),

  reset: () =>
    set({
      documentInformation: getDefaultDocumentInformation(),
      products: [],
      relationships: [],
      vulnerabilities: [],
    }),
}))

export default useDocumentStore
