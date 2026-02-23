import { describe, expect, it, vi } from 'vitest'
import { parseNotes } from '../../../src/utils/csafExport/parseNotes'
import { TDocumentStore } from '../../../src/utils/useDocumentStore'

vi.mock('i18next', () => ({
  default: {
    t: (key: string, options?: any) => {
      if (key === 'export.productDescriptionPrefix') {
        return options?.lng === 'de' ? 'Produktbeschreibung für' : 'Product description for'
      }
      return key
    },
  },
}))

describe('parseNotes', () => {
  const mockDocumentStore: TDocumentStore = {
    documentInformation: {
      lang: 'en',
      notes: [],
    },
    products: {
      key1: {
        id: 'vendor1',
        name: 'Vendor 1',
        subBranches: [
          {
            id: 'product1',
            name: 'Product 1',
            description: 'Description 1',
          },
        ],
      },
    },
  } as any

  it('should use default translation when no config is provided', () => {
    const result = parseNotes(mockDocumentStore)
    expect(result).toContainEqual(
      expect.objectContaining({
        title: 'Product description for Product 1',
      }),
    )
  })

  it('should use config override when provided', () => {
    const config: any = {
      exportTexts: {
        productDescription: {
          en: 'Custom prefix',
        },
      },
    }
    const result = parseNotes(mockDocumentStore, config)
    expect(result).toContainEqual(
      expect.objectContaining({
        title: 'Custom prefix Product 1',
      }),
    )
  })

  it('should fallback to translation if config is provided but language is missing', () => {
    const config: any = {
      exportTexts: {
        productDescription: {
          de: 'Custom prefix',
        },
      },
    }
    const result = parseNotes(mockDocumentStore, config)
    expect(result).toContainEqual(
      expect.objectContaining({
        title: 'Product description for Product 1',
      }),
    )
  })

  it('should handle German language', () => {
    const germanStore = {
      ...mockDocumentStore,
      documentInformation: {
        ...mockDocumentStore.documentInformation,
        lang: 'de',
      },
    } as any
    const result = parseNotes(germanStore)
    expect(result).toContainEqual(
      expect.objectContaining({
        title: 'Produktbeschreibung für Product 1',
      }),
    )
  })
})
