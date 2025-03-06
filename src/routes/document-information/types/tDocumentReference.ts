import { uid } from 'uid'

export type TDocumentReference = {
  id: string
  url: string
  summary: string
}

export function getDefaultDocumentReference(): TDocumentReference {
  return {
    id: uid(),
    url: '',
    summary: '',
  }
}
