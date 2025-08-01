import { useConfigStore } from './useConfigStore'

export default function useProductDatabase() {
  const productDatabase = useConfigStore(
    (state) => state.config?.productDatabase,
  )

  return {
    enabled: productDatabase?.enabled ?? false,
    apiUrl: productDatabase?.apiUrl ?? '',
    url: productDatabase?.url ?? '',
  }
}
