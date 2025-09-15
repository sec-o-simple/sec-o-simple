import useDocumentStore from './useDocumentStore'

export default function useDocumentType() {
  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)

  return {
    type: sosDocumentType,
    hasSoftware: [
      'Software',
      'VexSoftware',
      'Import',
      'VexImport',
      'HardwareSoftware',
      'VexHardwareSoftware',
    ].includes(sosDocumentType),
    hasHardware: [
      'Hardware',
      'VexHardware',
      'Import',
      'VexImport',
      'HardwareSoftware',
      'VexHardwareSoftware',
    ].includes(sosDocumentType),
  }
}
