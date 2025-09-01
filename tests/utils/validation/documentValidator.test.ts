import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { TConfig } from '../../../src/utils/useConfigStore'
import { TDocumentStore } from '../../../src/utils/useDocumentStore'
import {
  validateDocument,
  ValidationResult,
} from '../../../src/utils/validation/documentValidator'

// Mock the external dependencies
vi.mock('../../../src/utils/csafExport/csafExport')
vi.mock('@secvisogram/csaf-validator-lib/basic.js')
vi.mock('@secvisogram/csaf-validator-lib/validate.js')

import * as basic from '@secvisogram/csaf-validator-lib/basic.js'
import validate from '@secvisogram/csaf-validator-lib/validate.js'
import { createCSAFDocument } from '../../../src/utils/csafExport/csafExport'

describe('documentValidator', () => {
  let mockDocumentStore: TDocumentStore
  let mockGetFullProductName: (id: string) => string
  let mockGetRelationshipFullProductName: (
    sourceVersionId: string,
    targetVersionId: string,
    category: string,
  ) => string
  let mockConfig: TConfig

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock document store
    mockDocumentStore = {
      sosDocumentType: 'Software',
      setSOSDocumentType: vi.fn(),
      documentInformation: {
        title: 'Test Document',
        tlp: 'WHITE',
        category: 'csaf_security_advisory',
        publisher: {
          name: 'Test Publisher',
          namespace: 'https://test.com',
        },
        tracking: {
          id: 'TEST-001',
          status: 'draft',
          version: '1.0.0',
          revision_history: [],
          initial_release_date: '2025-01-01T00:00:00.000Z',
          current_release_date: '2025-01-01T00:00:00.000Z',
        },
      },
      products: [],
      relationships: [],
      vulnerabilities: [],
      importedCSAFDocument: {},
      setImportedCSAFDocument: vi.fn(),
      updateDocumentInformation: vi.fn(),
      updateProducts: vi.fn(),
      updateRelationships: vi.fn(),
      updateVulnerabilities: vi.fn(),
      reset: vi.fn(),
    } as TDocumentStore

    // Setup mock functions
    mockGetFullProductName = vi.fn((id: string) => `Product ${id}`)
    mockGetRelationshipFullProductName = vi.fn(
      (sourceId: string, targetId: string, category: string) =>
        `${sourceId} -> ${targetId} (${category})`,
    )

    mockConfig = {
      productDatabase: {
        enabled: false,
      },
      template: {},
    } as TConfig

    // Setup default mocks
    ;(createCSAFDocument as Mock).mockReturnValue({
      document: {
        title: 'Test Document',
        category: 'csaf_security_advisory',
      },
    })

    // Mock basic tests
    Object.defineProperty(basic, 'default', {
      value: {
        test1: { name: 'test1' },
        test2: { name: 'test2' },
      },
      writable: true,
    })
  })

  describe('validateDocument', () => {
    it('should return valid result when no validation errors exist', async () => {
      // Mock successful validation with no errors
      ;(validate as Mock).mockResolvedValue({
        isValid: true,
        tests: [
          {
            errors: [],
            warnings: [],
            infos: [],
          },
        ],
      })

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result.isValid).toBe(true)
      expect(result.messages).toEqual([])
      expect(createCSAFDocument).toHaveBeenCalledWith(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )
    })

    it('should return invalid result when validation errors exist', async () => {
      const mockValidationResult = {
        isValid: false,
        tests: [
          {
            errors: [
              {
                instancePath: '/document/title',
                message: 'Title is required',
              },
              {
                instancePath: '/document/category',
                message: 'Invalid category',
              },
            ],
            warnings: [],
            infos: [],
          },
        ],
      }

      ;(validate as Mock).mockResolvedValue(mockValidationResult)

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result.isValid).toBe(false)
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0]).toEqual({
        path: '/document/title',
        message: 'Title is required',
        severity: 'error',
      })
      expect(result.messages[1]).toEqual({
        path: '/document/category',
        message: 'Invalid category',
        severity: 'error',
      })
    })

    it('should collect warnings and infos along with errors', async () => {
      const mockValidationResult = {
        isValid: false,
        tests: [
          {
            errors: [
              {
                instancePath: '/document/title',
                message: 'Title is required',
              },
            ],
            warnings: [
              {
                instancePath: '/document/description',
                message: 'Description is recommended',
              },
              {
                instancePath: '/document/notes',
                message: 'Notes section is recommended',
              },
            ],
            infos: [
              {
                instancePath: '/document/publisher',
                message: 'Publisher information looks good',
              },
            ],
          },
        ],
      }

      ;(validate as Mock).mockResolvedValue(mockValidationResult)

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result.isValid).toBe(false) // Should be invalid due to errors
      expect(result.messages).toHaveLength(4)

      // Check error
      expect(result.messages[0]).toEqual({
        path: '/document/title',
        message: 'Title is required',
        severity: 'error',
      })

      // Check warnings
      expect(result.messages[1]).toEqual({
        path: '/document/description',
        message: 'Description is recommended',
        severity: 'warning',
      })
      expect(result.messages[2]).toEqual({
        path: '/document/notes',
        message: 'Notes section is recommended',
        severity: 'warning',
      })

      // Check info
      expect(result.messages[3]).toEqual({
        path: '/document/publisher',
        message: 'Publisher information looks good',
        severity: 'info',
      })
    })

    it('should handle multiple test results', async () => {
      const mockValidationResult = {
        isValid: false,
        tests: [
          {
            errors: [
              {
                instancePath: '/document/title',
                message: 'Title is required',
              },
            ],
            warnings: [],
            infos: [],
          },
          {
            errors: [],
            warnings: [
              {
                instancePath: '/vulnerabilities',
                message: 'No vulnerabilities defined',
              },
            ],
            infos: [
              {
                instancePath: '/product_tree',
                message: 'Product tree structure is valid',
              },
            ],
          },
        ],
      }

      ;(validate as Mock).mockResolvedValue(mockValidationResult)

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result.isValid).toBe(false)
      expect(result.messages).toHaveLength(3)

      expect(result.messages[0].severity).toBe('error')
      expect(result.messages[1].severity).toBe('warning')
      expect(result.messages[2].severity).toBe('info')
    })

    it('should return valid result when only warnings and infos exist', async () => {
      const mockValidationResult = {
        isValid: true,
        tests: [
          {
            errors: [], // No errors
            warnings: [
              {
                instancePath: '/document/description',
                message: 'Description is recommended',
              },
            ],
            infos: [
              {
                instancePath: '/document/publisher',
                message: 'Publisher information looks good',
              },
            ],
          },
        ],
      }

      ;(validate as Mock).mockResolvedValue(mockValidationResult)

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result.isValid).toBe(true) // Should be valid since no errors
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].severity).toBe('warning')
      expect(result.messages[1].severity).toBe('info')
    })

    it('should work without config parameter', async () => {
      ;(validate as Mock).mockResolvedValue({
        isValid: true,
        tests: [
          {
            errors: [],
            warnings: [],
            infos: [],
          },
        ],
      })

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        // No config parameter
      )

      expect(result.isValid).toBe(true)
      expect(result.messages).toEqual([])
      expect(createCSAFDocument).toHaveBeenCalledWith(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        undefined,
      )
    })

    it('should handle createCSAFDocument throwing an error', async () => {
      ;(createCSAFDocument as Mock).mockImplementation(() => {
        throw new Error('Failed to create CSAF document')
      })

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result.isValid).toBe(false)
      expect(result.messages).toEqual([
        {
          message:
            'Unknown validation error: Error: Failed to create CSAF document',
          path: '',
          severity: 'error',
        },
      ])
      expect(validate).not.toHaveBeenCalled()
    })

    it('should handle validate function throwing an error', async () => {
      ;(validate as Mock).mockRejectedValue(new Error('Validation failed'))

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result.isValid).toBe(false)
      expect(result.messages).toEqual([
        {
          message: 'Unknown validation error: Error: Validation failed',
          path: '',
          severity: 'error',
        },
      ])
      expect(createCSAFDocument).toHaveBeenCalled()
    })

    it('should handle empty test results', async () => {
      const mockValidationResult = {
        isValid: true,
        tests: [], // Empty tests array
      }

      ;(validate as Mock).mockResolvedValue(mockValidationResult)

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result.isValid).toBe(true)
      expect(result.messages).toEqual([])
    })

    it('should handle tests with empty message arrays', async () => {
      const mockValidationResult = {
        isValid: true,
        tests: [
          {
            errors: [],
            warnings: [],
            infos: [],
          },
          {
            errors: [],
            warnings: [],
            infos: [],
          },
        ],
      }

      ;(validate as Mock).mockResolvedValue(mockValidationResult)

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result.isValid).toBe(true)
      expect(result.messages).toEqual([])
    })

    it('should properly determine validity based on error count only', async () => {
      // Test case where we have warnings and infos but no errors - should be valid
      const mockValidationResult = {
        isValid: false, // This doesn't matter - we use our own logic
        tests: [
          {
            errors: [], // No errors
            warnings: [{ instancePath: '/test', message: 'Warning message' }],
            infos: [{ instancePath: '/test', message: 'Info message' }],
          },
        ],
      }

      ;(validate as Mock).mockResolvedValue(mockValidationResult)

      const result = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result.isValid).toBe(true) // Should be true because no errors
      expect(result.messages).toHaveLength(2)
    })

    it('should call helper functions with correct parameters', async () => {
      ;(validate as Mock).mockResolvedValue({
        isValid: true,
        tests: [{ errors: [], warnings: [], infos: [] }],
      })

      await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(createCSAFDocument).toHaveBeenCalledTimes(1)
      expect(createCSAFDocument).toHaveBeenCalledWith(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(validate).toHaveBeenCalledTimes(1)
      // The first argument should be the tests array from basic module
      expect(validate).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Object),
      )
    })
  })

  describe('ValidationResult interface', () => {
    it('should have correct structure', async () => {
      ;(validate as Mock).mockResolvedValue({
        isValid: true,
        tests: [{ errors: [], warnings: [], infos: [] }],
      })

      const result: ValidationResult = await validateDocument(
        mockDocumentStore,
        mockGetFullProductName,
        mockGetRelationshipFullProductName,
        mockConfig,
      )

      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('messages')
      expect(typeof result.isValid).toBe('boolean')
      expect(Array.isArray(result.messages)).toBe(true)
    })
  })
})
