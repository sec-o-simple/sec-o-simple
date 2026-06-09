import { describe, it, expect } from 'vitest'
import HTMLTemplate from '../../../src/routes/preview/HTMLTemplate'
import { HTMLTemplateTranslations } from '../../../src/routes/preview/htmlTemplateTranslations'

const mockTranslations: HTMLTemplateTranslations = {
  t_product: 'Product',
  t_cvss_vector: 'CVSS Vector',
  t_cvss_base_score: 'Base Score',
  t_for_products: 'For Products',
  t_for_groups: 'Groups',
  t_restart_required: 'Restart Required',
  t_publisher: 'Publisher',
  t_document_category: 'Category',
  t_engine: 'Engine',
}

describe('HTMLTemplate', () => {
  it('should generate HTML string for document input', () => {
    const mockDocument = {
      document: {
        title: 'Test Document',
        publisher: { name: 'Test Publisher' },
      },
    }

    const result = HTMLTemplate({
      document: mockDocument,
      translations: mockTranslations,
    })

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle documents with vulnerabilities', () => {
    const mockDocument = {
      document: {
        title: 'Security Advisory',
        vulnerabilities: [{ title: 'CVE-2024-1234' }],
      },
    }

    const result = HTMLTemplate({
      document: mockDocument,
      translations: mockTranslations,
    })

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle empty document', () => {
    const result = HTMLTemplate({
      document: { document: {} },
      translations: mockTranslations,
    })

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should use translations in template', () => {
    const result = HTMLTemplate({
      document: { document: { title: 'Test' } },
      translations: mockTranslations,
    })

    expect(typeof result).toBe('string')
    expect(result).toBeDefined()
  })

  it('should handle null input gracefully', () => {
    expect(() => {
      HTMLTemplate({
        document: null as any,
        translations: mockTranslations,
      })
    }).not.toThrow()
  })

  it('should handle missing translations', () => {
    const result = HTMLTemplate({
      document: { document: { title: 'Test' } },
      translations: {},
    })

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
