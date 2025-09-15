import { useConfigStore } from './useConfigStore'

export default function useProductDatabase() {
  const pDB = useConfigStore((state) => state.config?.productDatabase)

  return {
    enabled: !!(pDB?.enabled && pDB?.url && pDB?.apiUrl),
    apiUrl: pDB?.apiUrl ?? '',
    url: pDB?.url ?? '',
  }
}
