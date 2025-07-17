import { uid } from 'uid'

export type TAcknowledgmentName = {
  id: string
  name: string
}

export type TAcknowledgment = {
  id: string
  summary?: string
  organization?: string
  names?: TAcknowledgmentName[]
  url?: string
}

export type TAcknowledgmentOutput = {
  summary?: string
  organization?: string
  names?: string[]
  urls?: string[]
}

export function getDefaultDocumentAcknowledgment(): TAcknowledgment {
  return {
    id: uid(),
  }
}

export function getDefaultDocumentAcknowledgmentName(): TAcknowledgmentName {
  return {
    id: uid(),
    name: '',
  }
}
