import useDocumentStore from './useDocumentStore'

export default function useDocumentType() {
  const sosDocumentType = useDocumentStore((state) => state.sosDocumentType)

  return {
    type: sosDocumentType,
    hasSoftware: ['Software', 'Import', 'HardwareSoftware'].includes(
      sosDocumentType,
    ),
    hasHardware: ['Hardware', 'Import', 'HardwareSoftware'].includes(
      sosDocumentType,
    ),
  }
}
