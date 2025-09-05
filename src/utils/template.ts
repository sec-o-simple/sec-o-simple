import {
  getDefaultDocumentInformation,
  getDocumentInformationTemplateKeys,
} from '@/routes/document-information/types/tDocumentInformation'
import {
  TProductFamily,
  TProductFamilyTemplate,
  TProductTreeBranch,
} from '@/routes/products/types/tProductTreeBranch'
import { TRelationship } from '@/routes/products/types/tRelationship'
import { TVulnerability } from '@/routes/vulnerabilities/types/tVulnerability'
import { useEffect } from 'react'
import { useConfigStore } from './useConfigStore'
import useDocumentStore from './useDocumentStore'
import { UpdatePriority, useStateInitializer } from './useStateInitializer'

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

export function checkDeletable<T extends object>(obj: T): boolean {
  return 'deletable' in obj && obj['deletable'] === true
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

  function getTemplateDefaultObject<T extends object>(key: string): T {
    return getTemplateValue<T>(`${key}.default`, {} as T)
  }

  return {
    getTemplateDefaultObject,
    getTemplateValue,
    getTemplateData,
    isFieldReadonly,
    getFieldPlaceholder,
  }
}

/**
 * Parses hierarchical template family structure into flat array with parent references
 */
export function parseProductFamilies(
  familyTemplates: TProductFamilyTemplate[],
): TProductFamily[] {
  const families: TProductFamily[] = []

  // Recursively process each family template
  function processFamilyTemplate(
    template: TProductFamilyTemplate,
    parent: TProductFamily | null = null,
  ): void {
    // Create the family
    const family: TProductFamily = {
      id: template.id,
      name: template.name,
      parent: parent,
    }

    // Add to our collections
    families.push(family)

    // Process subfamilies recursively
    if (template.subFamily) {
      processFamilyTemplate(template.subFamily, family)
    }
  }

  // Process all root families
  for (const familyTemplate of familyTemplates) {
    processFamilyTemplate(familyTemplate)
  }

  return families
}

export function useTemplateInitializer() {
  const config = useConfigStore((state) => state.config)
  const { updateState: initialize } = useStateInitializer()
  const updateDocumentInformation = useDocumentStore(
    (state) => state.updateDocumentInformation,
  )
  const updateProducts = useDocumentStore((state) => state.updateProducts)
  const updateFamilies = useDocumentStore((state) => state.updateFamilies)
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
        initializeTemplateData()
      })
    }
  }, [config])

  function initializeTemplateData() {
    const documentInformation = getTemplateData(
      getDocumentInformationTemplateKeys(),
      getDefaultDocumentInformation(),
    )
    updateDocumentInformation(documentInformation)
    updateProducts(getTemplateValue<TProductTreeBranch[]>('products', []))
    const families = getTemplateValue<TProductFamilyTemplate[]>(
      'product_families',
      [],
    )
    updateFamilies(parseProductFamilies(families))

    updateRelationships(getTemplateValue<TRelationship[]>('relationships', []))
    updateVulnerabilities(
      getTemplateValue<TVulnerability[]>('vulnerabilities', []),
    )
  }

  return { initializeTemplateData }
}
