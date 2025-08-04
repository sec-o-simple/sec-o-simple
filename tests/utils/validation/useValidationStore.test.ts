import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Unmock the module to test the actual implementation
vi.unmock('@/utils/validation/useValidationStore')
vi.unmock('../../../src/utils/validation/useValidationStore')

import useValidationStore, { ValidationMessage, ValidationSeverity } from '../../../src/utils/validation/useValidationStore'

// Helper function to get computed properties via store getter access
const getComputedProperties = () => {
  const store = useValidationStore.getState()
  return {
    errors: store.messages.filter(m => m.severity === 'error'),
    warnings: store.messages.filter(m => m.severity === 'warning'),
    infos: store.messages.filter(m => m.severity === 'info')
  }
}

describe('useValidationStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const { result } = renderHook(() => useValidationStore())
    act(() => {
      result.current.reset()
    })
  })

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useValidationStore())
      
      expect(result.current.messages).toEqual([])
      expect(result.current.touchedFields).toEqual(new Set())
      expect(result.current.visitedPages).toEqual(new Set())
      expect(result.current.isValidating).toBe(false)
      expect(result.current.isValid).toBe(true)
      
      // Test computed properties by filtering messages directly
      const errors = result.current.messages.filter(m => m.severity === 'error')
      const warnings = result.current.messages.filter(m => m.severity === 'warning')
      const infos = result.current.messages.filter(m => m.severity === 'info')
      
      expect(errors).toEqual([])
      expect(warnings).toEqual([])
      expect(infos).toEqual([])
    })
  })

  describe('setValidationState', () => {
    it('should update messages and isValid state', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const messages: ValidationMessage[] = [
        { path: 'field1', message: 'Error message', severity: 'error' },
        { path: 'field2', message: 'Warning message', severity: 'warning' }
      ]
      
      act(() => {
        result.current.setValidationState({
          messages,
          isValid: false
        })
      })
      
      expect(result.current.messages).toEqual(messages)
      expect(result.current.isValid).toBe(false)
    })

    it('should preserve other state when updating validation state', () => {
      const { result } = renderHook(() => useValidationStore())
      
      // Set some initial state
      act(() => {
        result.current.setIsValidating(true)
        result.current.markFieldAsTouched('field1')
        result.current.visitPage('/page1')
      })
      
      const messages: ValidationMessage[] = [
        { path: 'field1', message: 'Error message', severity: 'error' }
      ]
      
      act(() => {
        result.current.setValidationState({
          messages,
          isValid: false
        })
      })
      
      expect(result.current.messages).toEqual(messages)
      expect(result.current.isValid).toBe(false)
      expect(result.current.isValidating).toBe(true)
      expect(result.current.touchedFields.has('field1')).toBe(true)
      expect(result.current.visitedPages.has('/page1')).toBe(true)
    })
  })

  describe('setIsValidating', () => {
    it('should update isValidating state to true', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.setIsValidating(true)
      })
      
      expect(result.current.isValidating).toBe(true)
    })

    it('should update isValidating state to false', () => {
      const { result } = renderHook(() => useValidationStore())
      
      // First set to true
      act(() => {
        result.current.setIsValidating(true)
      })
      
      // Then set to false
      act(() => {
        result.current.setIsValidating(false)
      })
      
      expect(result.current.isValidating).toBe(false)
    })
  })

  describe('getMessagesForPath', () => {
    it('should return empty array when no messages exist for path', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const messages = result.current.getMessagesForPath('nonexistent')
      
      expect(messages).toEqual([])
    })

    it('should return messages for specific path', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const allMessages: ValidationMessage[] = [
        { path: 'field1', message: 'Error 1', severity: 'error' },
        { path: 'field2', message: 'Warning 1', severity: 'warning' },
        { path: 'field1', message: 'Info 1', severity: 'info' },
        { path: 'field3', message: 'Error 2', severity: 'error' }
      ]
      
      act(() => {
        result.current.setValidationState({
          messages: allMessages,
          isValid: false
        })
      })
      
      const field1Messages = result.current.getMessagesForPath('field1')
      
      expect(field1Messages).toHaveLength(2)
      expect(field1Messages).toEqual([
        { path: 'field1', message: 'Error 1', severity: 'error' },
        { path: 'field1', message: 'Info 1', severity: 'info' }
      ])
    })

    it('should return empty array for path with no messages', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const allMessages: ValidationMessage[] = [
        { path: 'field1', message: 'Error 1', severity: 'error' },
        { path: 'field2', message: 'Warning 1', severity: 'warning' }
      ]
      
      act(() => {
        result.current.setValidationState({
          messages: allMessages,
          isValid: false
        })
      })
      
      const field3Messages = result.current.getMessagesForPath('field3')
      
      expect(field3Messages).toEqual([])
    })
  })

  describe('isFieldTouched', () => {
    it('should return false for untouched field', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const isTouched = result.current.isFieldTouched('field1')
      
      expect(isTouched).toBe(false)
    })

    it('should return true for touched field', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.markFieldAsTouched('field1')
      })
      
      const isTouched = result.current.isFieldTouched('field1')
      
      expect(isTouched).toBe(true)
    })

    it('should return false for different untouched field', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.markFieldAsTouched('field1')
      })
      
      const isTouched = result.current.isFieldTouched('field2')
      
      expect(isTouched).toBe(false)
    })
  })

  describe('markFieldAsTouched', () => {
    it('should mark single field as touched', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.markFieldAsTouched('field1')
      })
      
      expect(result.current.touchedFields.has('field1')).toBe(true)
      expect(result.current.touchedFields.size).toBe(1)
    })

    it('should mark multiple fields as touched', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.markFieldAsTouched('field1')
        result.current.markFieldAsTouched('field2')
        result.current.markFieldAsTouched('field3')
      })
      
      expect(result.current.touchedFields.has('field1')).toBe(true)
      expect(result.current.touchedFields.has('field2')).toBe(true)
      expect(result.current.touchedFields.has('field3')).toBe(true)
      expect(result.current.touchedFields.size).toBe(3)
    })

    it('should not add duplicate touched fields', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.markFieldAsTouched('field1')
        result.current.markFieldAsTouched('field1')
        result.current.markFieldAsTouched('field1')
      })
      
      expect(result.current.touchedFields.has('field1')).toBe(true)
      expect(result.current.touchedFields.size).toBe(1)
    })
  })

  describe('visitPage', () => {
    it('should mark single page as visited', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.visitPage('/page1')
      })
      
      expect(result.current.visitedPages.has('/page1')).toBe(true)
      expect(result.current.visitedPages.size).toBe(1)
    })

    it('should mark multiple pages as visited', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.visitPage('/page1')
        result.current.visitPage('/page2')
        result.current.visitPage('/page3')
      })
      
      expect(result.current.visitedPages.has('/page1')).toBe(true)
      expect(result.current.visitedPages.has('/page2')).toBe(true)
      expect(result.current.visitedPages.has('/page3')).toBe(true)
      expect(result.current.visitedPages.size).toBe(3)
    })

    it('should not add duplicate visited pages', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.visitPage('/page1')
        result.current.visitPage('/page1')
        result.current.visitPage('/page1')
      })
      
      expect(result.current.visitedPages.has('/page1')).toBe(true)
      expect(result.current.visitedPages.size).toBe(1)
    })
  })

  describe('hasVisitedPage', () => {
    it('should return false for unvisited page', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const hasVisited = result.current.hasVisitedPage('/page1')
      
      expect(hasVisited).toBe(false)
    })

    it('should return true for visited page', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.visitPage('/page1')
      })
      
      const hasVisited = result.current.hasVisitedPage('/page1')
      
      expect(hasVisited).toBe(true)
    })

    it('should return false for different unvisited page', () => {
      const { result } = renderHook(() => useValidationStore())
      
      act(() => {
        result.current.visitPage('/page1')
      })
      
      const hasVisited = result.current.hasVisitedPage('/page2')
      
      expect(hasVisited).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useValidationStore())
      
      // Set up some state first
      const messages: ValidationMessage[] = [
        { path: 'field1', message: 'Error', severity: 'error' }
      ]
      
      act(() => {
        result.current.setValidationState({ messages, isValid: false })
        result.current.setIsValidating(true)
        result.current.markFieldAsTouched('field1')
        result.current.visitPage('/page1')
      })
      
      // Verify state was set
      expect(result.current.messages).toEqual(messages)
      expect(result.current.isValid).toBe(false)
      expect(result.current.isValidating).toBe(true)
      expect(result.current.touchedFields.has('field1')).toBe(true)
      expect(result.current.visitedPages.has('/page1')).toBe(true)
      
      // Reset
      act(() => {
        result.current.reset()
      })
      
      // Verify reset
      expect(result.current.messages).toEqual([])
      expect(result.current.touchedFields).toEqual(new Set())
      expect(result.current.visitedPages).toEqual(new Set())
      expect(result.current.isValidating).toBe(false)
      expect(result.current.isValid).toBe(true)
    })
  })

  describe('computed properties - errors', () => {
    it('should return empty array when no error messages exist', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const computed = getComputedProperties()
      expect(computed.errors).toEqual([])
    })

    it('should return only error messages', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const messages: ValidationMessage[] = [
        { path: 'field1', message: 'Error 1', severity: 'error' },
        { path: 'field2', message: 'Warning 1', severity: 'warning' },
        { path: 'field3', message: 'Error 2', severity: 'error' },
        { path: 'field4', message: 'Info 1', severity: 'info' }
      ]
      
      act(() => {
        result.current.setValidationState({
          messages,
          isValid: false
        })
      })
      
      const computed = getComputedProperties()
      expect(computed.errors).toHaveLength(2)
      expect(computed.errors).toEqual([
        { path: 'field1', message: 'Error 1', severity: 'error' },
        { path: 'field3', message: 'Error 2', severity: 'error' }
      ])
    })
  })

  describe('computed properties - warnings', () => {
    it('should return empty array when no warning messages exist', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const computed = getComputedProperties()
      expect(computed.warnings).toEqual([])
    })

    it('should return only warning messages', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const messages: ValidationMessage[] = [
        { path: 'field1', message: 'Error 1', severity: 'error' },
        { path: 'field2', message: 'Warning 1', severity: 'warning' },
        { path: 'field3', message: 'Warning 2', severity: 'warning' },
        { path: 'field4', message: 'Info 1', severity: 'info' }
      ]
      
      act(() => {
        result.current.setValidationState({
          messages,
          isValid: false
        })
      })
      
      const computed = getComputedProperties()
      expect(computed.warnings).toHaveLength(2)
      expect(computed.warnings).toEqual([
        { path: 'field2', message: 'Warning 1', severity: 'warning' },
        { path: 'field3', message: 'Warning 2', severity: 'warning' }
      ])
    })
  })

  describe('computed properties - infos', () => {
    it('should return empty array when no info messages exist', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const computed = getComputedProperties()
      expect(computed.infos).toEqual([])
    })

    it('should return only info messages', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const messages: ValidationMessage[] = [
        { path: 'field1', message: 'Error 1', severity: 'error' },
        { path: 'field2', message: 'Warning 1', severity: 'warning' },
        { path: 'field3', message: 'Info 1', severity: 'info' },
        { path: 'field4', message: 'Info 2', severity: 'info' }
      ]
      
      act(() => {
        result.current.setValidationState({
          messages,
          isValid: false
        })
      })
      
      const computed = getComputedProperties()
      expect(computed.infos).toHaveLength(2)
      expect(computed.infos).toEqual([
        { path: 'field3', message: 'Info 1', severity: 'info' },
        { path: 'field4', message: 'Info 2', severity: 'info' }
      ])
    })
  })

  describe('integration tests', () => {
    it('should handle complex workflow with all operations', () => {
      const { result } = renderHook(() => useValidationStore())
      
      // Start validation
      act(() => {
        result.current.setIsValidating(true)
      })
      
      // Visit some pages
      act(() => {
        result.current.visitPage('/page1')
        result.current.visitPage('/page2')
      })
      
      // Touch some fields
      act(() => {
        result.current.markFieldAsTouched('field1')
        result.current.markFieldAsTouched('field2')
      })
      
      // Set validation results
      const messages: ValidationMessage[] = [
        { path: 'field1', message: 'Required field', severity: 'error' },
        { path: 'field2', message: 'Consider review', severity: 'warning' },
        { path: 'field3', message: 'Optional enhancement', severity: 'info' }
      ]
      
      act(() => {
        result.current.setValidationState({
          messages,
          isValid: false
        })
      })
      
      // Finish validation
      act(() => {
        result.current.setIsValidating(false)
      })
      
      // Verify final state
      expect(result.current.isValidating).toBe(false)
      expect(result.current.isValid).toBe(false)
      expect(result.current.messages).toEqual(messages)
      
      const computed = getComputedProperties()
      expect(computed.errors).toHaveLength(1)
      expect(computed.warnings).toHaveLength(1)
      expect(computed.infos).toHaveLength(1)
      
      expect(result.current.hasVisitedPage('/page1')).toBe(true)
      expect(result.current.hasVisitedPage('/page2')).toBe(true)
      expect(result.current.isFieldTouched('field1')).toBe(true)
      expect(result.current.isFieldTouched('field2')).toBe(true)
      expect(result.current.getMessagesForPath('field1')).toHaveLength(1)
      expect(result.current.getMessagesForPath('field2')).toHaveLength(1)
      expect(result.current.getMessagesForPath('field3')).toHaveLength(1)
    })

    it('should handle edge cases with empty strings and special characters', () => {
      const { result } = renderHook(() => useValidationStore())
      
      // Test with empty strings
      act(() => {
        result.current.visitPage('')
        result.current.markFieldAsTouched('')
      })
      
      expect(result.current.hasVisitedPage('')).toBe(true)
      expect(result.current.isFieldTouched('')).toBe(true)
      
      // Test with special characters
      const specialPath = '/page-with-special-chars_123/éñ'
      const specialField = 'field.with.dots[0].nested'
      
      act(() => {
        result.current.visitPage(specialPath)
        result.current.markFieldAsTouched(specialField)
      })
      
      expect(result.current.hasVisitedPage(specialPath)).toBe(true)
      expect(result.current.isFieldTouched(specialField)).toBe(true)
      
      // Test messages with special characters
      const messages: ValidationMessage[] = [
        { path: specialField, message: 'Message with émojis 🚀 and special chars', severity: 'error' }
      ]
      
      act(() => {
        result.current.setValidationState({
          messages,
          isValid: false
        })
      })
      
      expect(result.current.getMessagesForPath(specialField)).toEqual(messages)
    })
  })

  describe('type safety and TypeScript coverage', () => {
    it('should handle all ValidationSeverity values', () => {
      const { result } = renderHook(() => useValidationStore())
      
      const severities: ValidationSeverity[] = ['error', 'warning', 'info']
      const messages: ValidationMessage[] = severities.map((severity, index) => ({
        path: `field${index}`,
        message: `Message ${index}`,
        severity
      }))
      
      act(() => {
        result.current.setValidationState({
          messages,
          isValid: false
        })
      })
      
      const computed = getComputedProperties()
      expect(computed.errors).toHaveLength(1)
      expect(computed.warnings).toHaveLength(1)
      expect(computed.infos).toHaveLength(1)
      expect(result.current.messages).toHaveLength(3)
    })
  })
})
