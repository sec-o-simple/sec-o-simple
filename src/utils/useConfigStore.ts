import { create } from 'zustand'
import { useEffect } from 'react'

const CONFIG_NAME = 'io.github.sec-o-simple.json'

const DEFAULT_CONFIG: TConfig = {
  template: {},
  productDatabase: {
    enabled: false,
  }
}

export type TConfig = {
  productDatabase: {
    enabled: boolean
    url?: string
    apiUrl?: string
  },
  template: { [key: string]: unknown }
}

export type TConfigStore = {
  config?: TConfig
  updateConfig: (update: TConfig) => void
}

export const useConfigStore = create<TConfigStore>((set) => {
  return {
    config: undefined,
    updateConfig: (update: TConfig) => set({ config: update }),
  }
})

export function useConfigInitializer() {
  const updateConfig = useConfigStore((state) => state.updateConfig)

  const loadConfig = async () => {
    await fetch(`.well-known/appspecific/${CONFIG_NAME}`)
      .then((res) => {
        return res.json() as Promise<TConfig>
      })
      .then((configJSON) => updateConfig(configJSON))
      .catch((err) => {
        console.error(
          'Failed to parse sec-o-simple configuration. Falling back to default configuration',
          err,
        )
        updateConfig(DEFAULT_CONFIG)
      })
  }

  useEffect(() => {
    loadConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
