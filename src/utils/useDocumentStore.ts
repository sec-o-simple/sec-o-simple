import {
  TDocumentInformation,
  getDefaultDocumentInformation,
} from '@/routes/document-information/types/tDocumentInformation'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { TVulnerability } from '@/routes/vulnerabilities/types/tVulnerability'
import { create } from 'zustand'

export type TDocumentStore = {
  documentInformation: TDocumentInformation
  products: TProductTreeBranch[]
  vulnerabilities: TVulnerability[]

  updateDocumentInformation: (update: TDocumentInformation) => void
  updateProducts: (update: TProductTreeBranch[]) => void
  updateVulnerabilities: (update: TVulnerability[]) => void
}

const useDocumentStore = create<TDocumentStore>((set) => ({
  documentInformation: getDefaultDocumentInformation(),
  updateDocumentInformation: (update: TDocumentInformation) =>
    set({ documentInformation: update }),

  products: [],
  updateProducts: (update: TProductTreeBranch[]) => set({ products: update }),

  vulnerabilities: [],
  updateVulnerabilities: (update: TVulnerability[]) =>
    set({ vulnerabilities: update }),
}))

export default useDocumentStore
