import { describe, it, expect, vi } from 'vitest'
import {
  createHTMLTemplateTranslations,
  HTMLTemplateTranslations,
} from '../../../src/routes/preview/htmlTemplateTranslations'

describe('HTMLTemplateTranslations', () => {
  const mockTranslationFunction = vi.fn(
    (key: string, defaultValue?: string) => {
      const translations: Record<string, string> = {
        'products.product.label': 'Product',
        'vulnerabilities.score.cvss': 'CVSS',
        'vulnerabilities.score.baseScore': 'Base Score',
        'vulnerabilities.remediation.productsDescription':
          'For products and versions',
        'vulnerabilities.products.groups': 'Groups',
        'vulnerabilities.remediation.restartRequired': 'Restart Required',
        'nav.documentInformation.publisher': 'Publisher',
        'document.publisher.category': 'Category',
        'document.engine': 'Engine',
        'document.initialReleaseDate': 'Initial Release Date',
        'document.currentReleaseDate': 'Current Release Date',
        'document.buildDate': 'Build Date',
        'document.general.revisionHistory.version': 'Version',
        'document.general.state': 'Status',
        'document.title': 'Title',
        'document.general.csaf_version': 'CSAF Version',
        'document.notes': 'Notes',
        'document.references': 'References',
        'document.acknowledgments': 'Acknowledgments',
        'document.distribution': 'Distribution',
        'vulnerabilities.title': 'Vulnerability',
        'vulnerabilities.notes': 'Vulnerability Notes',
        'vulnerabilities.references': 'Vulnerability References',
        'vulnerabilities.acknowledgments': 'Vulnerability Acknowledgments',
        'vulnerabilities.cve': 'CVE',
        'vulnerabilities.cwe': 'CWE',
        'vulnerabilities.discovery_date': 'Discovery Date',
        'vulnerabilities.release_date': 'Release Date',
        'vulnerabilities.involvements': 'Involvements',
        'vulnerabilities.remediations': 'Remediations',
        'vulnerabilities.threats': 'Threats',
        'vulnerabilities.scores': 'Scores',
        'vulnerabilities.flags': 'Flags',
        'vulnerabilities.ids': 'IDs',
        product_tree: 'Product Tree',
      }
      return translations[key] || defaultValue || key
    },
  )

  it('should create translations object with required keys', () => {
    const result = createHTMLTemplateTranslations(mockTranslationFunction)

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')

    // Check essential translation keys
    expect(result.t_product).toBe('Product')
    expect(result.t_cvss_vector).toBe('CVSS-Vector')
    expect(result.t_cvss_base_score).toBe('Base Score')
    expect(result.t_publisher).toBe('Publisher')
    expect(result.t_document_category).toBe('Category')
    expect(result.t_engine).toBe('Engine')
  })

  it('should handle products description correctly', () => {
    const result = createHTMLTemplateTranslations(mockTranslationFunction)

    // Should take first two words from 'For products and versions'
    expect(result.t_for_products).toBe('For products')
  })

  it('should call translation function for each key', () => {
    createHTMLTemplateTranslations(mockTranslationFunction)

    // Verify that the translation function was called
    expect(mockTranslationFunction).toHaveBeenCalledWith(
      'products.product.label',
    )
    expect(mockTranslationFunction).toHaveBeenCalledWith(
      'vulnerabilities.score.cvss',
    )
    expect(mockTranslationFunction).toHaveBeenCalledWith(
      'vulnerabilities.score.baseScore',
    )
    expect(mockTranslationFunction).toHaveBeenCalledWith(
      'vulnerabilities.remediation.productsDescription',
    )
    expect(mockTranslationFunction).toHaveBeenCalledWith(
      'vulnerabilities.products.groups',
    )
    expect(mockTranslationFunction).toHaveBeenCalledWith(
      'vulnerabilities.remediation.restartRequired',
    )
    expect(mockTranslationFunction).toHaveBeenCalledWith(
      'nav.documentInformation.publisher',
    )
    expect(mockTranslationFunction).toHaveBeenCalledWith(
      'document.publisher.category',
    )
    expect(mockTranslationFunction).toHaveBeenCalledWith('document.engine')
  })

  it('should handle missing translation gracefully', () => {
    const fallbackTranslation = vi.fn((key: string, defaultValue?: string) => {
      return defaultValue || `missing_${key}`
    })

    const result = createHTMLTemplateTranslations(fallbackTranslation)

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')

    // Should contain fallback values
    expect(result.t_product).toContain('missing_')
  })

  it('should create consistent keys between multiple calls', () => {
    const result1 = createHTMLTemplateTranslations(mockTranslationFunction)
    const result2 = createHTMLTemplateTranslations(mockTranslationFunction)

    const keys1 = Object.keys(result1)
    const keys2 = Object.keys(result2)

    expect(keys1).toEqual(keys2)
    expect(keys1.length).toBeGreaterThan(0)
  })

  it('should handle all required translation keys', () => {
    const result = createHTMLTemplateTranslations(mockTranslationFunction)

    const requiredKeys = [
      't_product',
      't_cvss_vector',
      't_cvss_base_score',
      't_for_products',
      't_for_groups',
      't_restart_required',
      't_publisher',
      't_document_category',
      't_engine',
      't_initial_release_date',
      't_current_release_date',
      't_build_date',
      't_current_version',
      't_status',
    ]

    for (const key of requiredKeys) {
      expect(result[key]).toBeDefined()
      expect(typeof result[key]).toBe('string')
      expect(result[key].length).toBeGreaterThan(0)
    }
  })

  it('should handle translation function with default values', () => {
    const translationWithDefaults = vi.fn(
      (key: string, defaultValue?: string) => {
        if (key === 'unknown.key') {
          return defaultValue || 'fallback'
        }
        return mockTranslationFunction(key, defaultValue)
      },
    )

    const result = createHTMLTemplateTranslations(translationWithDefaults)

    expect(result).toBeDefined()
    expect(result.t_product).toBe('Product')
  })

  it('should create proper CVSS vector format', () => {
    const result = createHTMLTemplateTranslations(mockTranslationFunction)

    expect(result.t_cvss_vector).toBe('CVSS-Vector')
    expect(result.t_cvss_vector).toContain('CVSS')
    expect(result.t_cvss_vector).toContain('-')
  })

  it('should handle empty or null translation results', () => {
    const emptyTranslation = vi.fn(() => '')
    const result = createHTMLTemplateTranslations(emptyTranslation)

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')

    // All values should be strings (even if empty)
    Object.values(result).forEach((value) => {
      expect(typeof value).toBe('string')
    })
  })
})
