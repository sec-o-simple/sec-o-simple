import { useEffect } from 'react'
import { useConfigStore } from './useConfigStore'
import { UpdatePriority, useStateInitializer } from './useStateInitializer'
import useDocumentStore from './useDocumentStore'
import {
  getDefaultDocumentInformation,
  getDocumentInformationTemplateKeys,
} from '@/routes/document-information/types/tDocumentInformation'
import { TProductTreeBranch } from '@/routes/products/types/tProductTreeBranch'
import { TVulnerability } from '@/routes/vulnerabilities/types/tVulnerability'
import { TRelationship } from '@/routes/products/types/tRelationship'

export type TemplateKeys<T> = {
  [K in keyof T]: string | TemplateKeys<T[K]>
}

export function checkReadOnly<T extends object>(
  obj: T,
  field?: string,
): boolean {
  const fieldKey = `${field}.readonly`
  return (
    ('readonly' in obj && obj['readonly'] === true && !(fieldKey in obj)) ||
    (fieldKey in obj && obj[fieldKey as keyof typeof obj] === true)
  )
}

export function getPlaceholder<T extends object>(
  obj: T,
  field?: string,
): string | undefined {
  const fieldKey = `${field}.placeholder`
  if (fieldKey in obj) {
    return obj[fieldKey as keyof typeof obj] as string
  }
}

export function useTemplate() {
  const config = useConfigStore((state) => state.config)

  function getTemplateValue<T>(key: string, defaultValue: T): T {
    if (config && config.template) {
      if (key in config.template) {
        return config.template[key] as T
      }
    }
    return defaultValue
  }

  const getTemplateData = <T extends object>(
    templateKeys: TemplateKeys<T>,
    defaultValue: T,
  ): T => {
    return Object.fromEntries(
      Object.entries(defaultValue).map(([k, v]) => {
        const templateKey = templateKeys[k as keyof typeof templateKeys]
        const value =
          typeof templateKey === 'string'
            ? getTemplateValue(templateKey, v)
            : getTemplateData(templateKey, v)
        return [k, value]
      }),
    ) as T
  }

  function isFieldReadonly(key: string): boolean {
    const parts = key.split('.')
    const validKeyList = [...Array(parts.length)].map((_, i) =>
      parts.slice(0, parts.length - i).join('.'),
    )
    for (const validKey of validKeyList) {
      const value = getTemplateValue<boolean | undefined>(
        `${validKey}.readonly`,
        undefined,
      )
      if (value !== undefined) {
        return value
      }
    }
    return false
  }

  function getFieldPlaceholder(key: string): string | undefined {
    const value = getTemplateValue<string | undefined>(
      `${key}.placeholder`,
      undefined,
    )
    return value
  }

  return {
    getTemplateValue,
    getTemplateData,
    isFieldReadonly,
    getFieldPlaceholder,
  }
}

export function useTemplateInitializer() {
  const config = useConfigStore((state) => state.config)
  const { updateState: initialize } = useStateInitializer()
  const updateDocumentInformation = useDocumentStore(
    (state) => state.updateDocumentInformation,
  )
  const updateProducts = useDocumentStore((state) => state.updateProducts)
  const updateRelationships = useDocumentStore(
    (state) => state.updateRelationships,
  )
  const updateVulnerabilities = useDocumentStore(
    (state) => state.updateVulnerabilities,
  )
  const { getTemplateValue, getTemplateData } = useTemplate()

  // apply template to document state
  useEffect(() => {
    if (config) {
      initialize(UpdatePriority.Low, () => {
        const documentInformation = getTemplateData(
          getDocumentInformationTemplateKeys(),
          getDefaultDocumentInformation(),
        )
        updateDocumentInformation(documentInformation)
        updateProducts(getTemplateValue<TProductTreeBranch[]>('products', []))
        updateRelationships(
          getTemplateValue<TRelationship[]>('relationships', []),
        )
        updateVulnerabilities(
          getTemplateValue<TVulnerability[]>('vulnerabilities', []),
        )
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])
}
