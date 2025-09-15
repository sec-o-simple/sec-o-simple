import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  remediationCategories,
  TRemediationCategory,
  TRemediation,
  useRemediationGenerator,
} from '../../../../src/routes/vulnerabilities/types/tRemediation'

// Mock the dependencies
vi.mock('@/utils/template')
vi.mock('uid')

import { useTemplate } from '../../../../src/utils/template'
import { uid } from 'uid'

const mockUseTemplate = vi.mocked(useTemplate)
const mockUid = vi.mocked(uid)

describe('tRemediation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('remediationCategories', () => {
    it('should contain all expected remediation categories', () => {
      expect(remediationCategories).toEqual([
        'mitigation',
        'no_fix_planned',
        'none_available',
        'vendor_fix',
        'workaround',
      ])
    })

    it('should be a readonly array', () => {
      expect(remediationCategories).toBeInstanceOf(Array)
      expect(remediationCategories).toHaveLength(5)
    })

    it('should have all valid string values', () => {
      remediationCategories.forEach((category) => {
        expect(typeof category).toBe('string')
        expect(category).toBeTruthy()
      })
    })
  })

  describe('TRemediationCategory', () => {
    it('should accept all valid remediation categories', () => {
      // Test that all categories in remediationCategories are valid TRemediationCategory types
      const testCategory: TRemediationCategory = 'mitigation'
      expect(testCategory).toBe('mitigation')

      // Test each category individually
      const categories: TRemediationCategory[] = [
        'mitigation',
        'no_fix_planned',
        'none_available',
        'vendor_fix',
        'workaround',
      ]
      
      categories.forEach((category) => {
        expect(remediationCategories).toContain(category)
      })
    })
  })

  describe('TRemediation', () => {
    it('should define correct interface with required fields', () => {
      const remediation: TRemediation = {
        id: 'test-id',
        category: 'mitigation',
        productIds: ['prod1', 'prod2'],
      }

      expect(remediation.id).toBe('test-id')
      expect(remediation.category).toBe('mitigation')
      expect(remediation.productIds).toEqual(['prod1', 'prod2'])
    })

    it('should support all optional fields', () => {
      const remediation: TRemediation = {
        id: 'test-id',
        category: 'vendor_fix',
        details: 'Detailed remediation information',
        date: '2025-09-15',
        url: 'https://example.com/fix',
        productIds: ['prod1'],
      }

      expect(remediation.details).toBe('Detailed remediation information')
      expect(remediation.date).toBe('2025-09-15')
      expect(remediation.url).toBe('https://example.com/fix')
    })

    it('should work with empty productIds array', () => {
      const remediation: TRemediation = {
        id: 'test-id',
        category: 'none_available',
        productIds: [],
      }

      expect(remediation.productIds).toEqual([])
    })

    it('should support all remediation categories', () => {
      remediationCategories.forEach((category) => {
        const remediation: TRemediation = {
          id: `test-${category}`,
          category,
          productIds: [],
        }
        
        expect(remediation.category).toBe(category)
      })
    })
  })

  describe('useRemediationGenerator', () => {
    const mockGetTemplateDefaultObject = vi.fn()

    beforeEach(() => {
      mockUseTemplate.mockReturnValue({
        getTemplateDefaultObject: mockGetTemplateDefaultObject,
        getTemplateValue: vi.fn(),
        getTemplateData: vi.fn(),
        isFieldReadonly: vi.fn(),
        getFieldPlaceholder: vi.fn(),
      })
      mockUid.mockReturnValue('generated-unique-id')
    })

    it('should generate remediation with default category when template has no category', () => {
      mockGetTemplateDefaultObject.mockReturnValue({})

      const result = useRemediationGenerator()

      expect(mockGetTemplateDefaultObject).toHaveBeenCalledWith('vulnerabilities.remediations')
      expect(mockUid).toHaveBeenCalled()
      expect(result).toEqual({
        id: 'generated-unique-id',
        category: 'mitigation',
        productIds: [],
      })
    })

    it('should use template category when provided', () => {
      mockGetTemplateDefaultObject.mockReturnValue({
        category: 'vendor_fix',
      })

      const result = useRemediationGenerator()

      expect(result).toEqual({
        id: 'generated-unique-id',
        category: 'vendor_fix',
        productIds: [],
      })
    })

    it('should handle template with all possible fields', () => {
      mockGetTemplateDefaultObject.mockReturnValue({
        category: 'workaround',
        details: 'Template details',
        date: '2025-09-15',
        url: 'https://template.example.com',
      })

      const result = useRemediationGenerator()

      expect(result).toEqual({
        id: 'generated-unique-id',
        category: 'workaround',
        productIds: [],
        // Note: The function only uses category from template, not other fields
      })
    })

    it('should generate unique IDs for multiple calls', () => {
      mockUid
        .mockReturnValueOnce('id-1')
        .mockReturnValueOnce('id-2')
        .mockReturnValueOnce('id-3')
      
      mockGetTemplateDefaultObject.mockReturnValue({})

      const result1 = useRemediationGenerator()
      const result2 = useRemediationGenerator()
      const result3 = useRemediationGenerator()

      expect(result1.id).toBe('id-1')
      expect(result2.id).toBe('id-2')
      expect(result3.id).toBe('id-3')
    })

    it('should handle all valid template categories', () => {
      remediationCategories.forEach((category) => {
        mockGetTemplateDefaultObject.mockReturnValue({ category })
        mockUid.mockReturnValue(`id-for-${category}`)

        const result = useRemediationGenerator()

        expect(result.category).toBe(category)
        expect(result.id).toBe(`id-for-${category}`)
        expect(result.productIds).toEqual([])
      })
    })

    it('should handle template returning null/undefined category', () => {
      mockGetTemplateDefaultObject.mockReturnValue({
        category: null,
      })

      const result = useRemediationGenerator()

      expect(result.category).toBe('mitigation') // Should fall back to default
    })

    it('should handle template returning undefined category', () => {
      mockGetTemplateDefaultObject.mockReturnValue({
        category: undefined,
      })

      const result = useRemediationGenerator()

      expect(result.category).toBe('mitigation') // Should fall back to default
    })

    it('should always initialize empty productIds array', () => {
      // Test with various template configurations
      const templateConfigs = [
        {},
        { category: 'mitigation' },
        { category: 'vendor_fix', details: 'test' },
        { productIds: ['should-be-ignored'] }, // Even if template has productIds, should be empty
      ]

      templateConfigs.forEach((config, index) => {
        mockGetTemplateDefaultObject.mockReturnValue(config)
        mockUid.mockReturnValue(`test-id-${index}`)

        const result = useRemediationGenerator()
        
        expect(result.productIds).toEqual([])
      })
    })
  })
})