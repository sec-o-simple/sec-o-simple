export type TGeneralDocumentInformation = {
  title: string
  id: string
  language: string
}

export function getDefaultGeneralDocumentInformation() {
  return {
    title: '',
    id: '',
    language: '',
  }
}
