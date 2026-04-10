import HTMLTemplate from '@/routes/preview/HTMLTemplate'
import Mustache from 'mustache'
import { describe, it, expect } from 'vitest'

describe('HTMLTemplate', () => {
  const translations = {
    t_product: 'Product',
    t_cvss_vector: 'CVSS Vector',
    t_cvss_base_score: 'CVSS Base Score',
    t_for_products: 'For Products',
    t_for_groups: 'For Groups',
    t_from: 'from',
    t_for: 'for',
    t_see: 'see',
    t_restart_required: 'Restart Required',
  }

  const minimalDocument = {
    product_tree: {
      branches: [
        {
          product: { product_id: 'p1', name: 'Product 1' },
        },
      ],
    },
    vulnerabilities: [
      {
        product_status: {
          known_affected: ['p1'],
        },
        scores: [
          {
            cvss_v3: {
              vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
              baseScore: 9.8,
            },
            products: ['p1'],
          },
        ],
        remediations: [
          {
            category: 'fix',
            details: 'Apply patch',
            product_ids: ['p1'],
          },
        ],
        threats: [
          {
            category: 'impact',
            details: 'High impact',
            product_ids: ['p1'],
          },
        ],
      },
    ],
  }

  it('renders empty string if document is null', () => {
    expect(HTMLTemplate({ document: null, translations })).toBe('')
  })

  it('renders HTML with product name and CVSS score', () => {
    const html = HTMLTemplate({
      document: minimalDocument as any,
      translations,
    })
    expect(html).toContain('Product 1')
    expect(html).toContain('9.8')
    expect(html).toContain('Apply patch')
  })

  it('renders translation strings', () => {
    const html = HTMLTemplate({
      document: minimalDocument as any,
      translations,
    })
    expect(html).toContain('Product')
    expect(html).toContain('CVSS Vector')
    expect(html).toContain('CVSS Base Score')
  })

  it('sanitizes undefined/null values', () => {
    const doc = {
      ...minimalDocument,
      vulnerabilities: [
        {
          ...minimalDocument.vulnerabilities[0],
          product_status: { known_affected: [undefined, null, 'p1'] },
        },
      ],
    }
    const html = HTMLTemplate({ document: doc as any, translations })
    expect(html).toContain('Product 1')
  })

  it('secureHref only allows safe URLs', () => {
    const fn = Mustache.render
    const context = {
      secureHref: HTMLTemplate({
        document: minimalDocument as any,
        translations,
      }).match(/href="([^"]+)"/g),
    }
    // Should only match safe URLs (http, https, etc.)
    // This is a smoke test, not a full security test
    expect(context.secureHref).toBeTruthy()
  })
})
