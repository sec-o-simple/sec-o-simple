import { TDocumentStore } from '@/utils/useDocumentStore'
import { createCSAFDocument } from '../csafExport/csafExport'

import * as basic from '@secvisogram/csaf-validator-lib/csaf_2_1/basic.js'
import validate from '@secvisogram/csaf-validator-lib/validate.js'
import { TConfig } from '../useConfigStore'
import { ValidationMessage } from './useValidationStore'
import i18next from 'i18next'

const tests: unknown[] = [...Object.values(basic)]

export interface ValidationResult {
  isValid: boolean
  messages: ValidationMessage[]
}

const TEMPLATE_REQUIRED_ERROR_FALLBACK =
  'This field is required by template configuration'

function getTemplateRequiredErrorMessage(): string {
  return i18next.t('validation.requiredByTemplate', {
    defaultValue: TEMPLATE_REQUIRED_ERROR_FALLBACK,
  })
}

function decodeJsonPointerSegment(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

function encodeJsonPointerSegment(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1')
}

function normalizeJsonPointerPath(path: string): string {
  const trimmedPath = path.trim()
  if (!trimmedPath) {
    return ''
  }
  return trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`
}

function getTemplateRequiredPaths(config?: TConfig): string[] {
  if (!config?.template || !Array.isArray(config.template.required)) {
    return []
  }

  return config.template.required
    .map((path) => normalizeJsonPointerPath(path))
    .filter((path) => path.length > 0)
}

function getValueAtPath(document: unknown, path: string): unknown {
  if (!path || path === '/') {
    return document
  }

  const segments = path
    .split('/')
    .slice(1)
    .map((segment) => decodeJsonPointerSegment(segment))

  let currentValue = document
  for (const segment of segments) {
    if (
      currentValue === null ||
      currentValue === undefined ||
      typeof currentValue !== 'object' ||
      !(segment in currentValue)
    ) {
      return undefined
    }

    currentValue = currentValue[segment as keyof typeof currentValue]
  }

  return currentValue
}

function hasValueForRequiredValidation(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length > 0
  }

  return true
}

function resolveJsonPointerPattern(
  document: unknown,
  pattern: string,
): string[] {
  const normalizedPattern = normalizeJsonPointerPath(pattern)
  if (!normalizedPattern) {
    return []
  }

  const segments = normalizedPattern
    .split('/')
    .slice(1)
    .map((segment) => decodeJsonPointerSegment(segment))
  const resolvedPaths = new Set<string>()

  const traverse = (
    currentValue: unknown,
    index: number,
    currentPath: string,
  ) => {
    if (index === segments.length) {
      resolvedPaths.add(currentPath || '/')
      return
    }

    const segment = segments[index]

    if (segment === '*') {
      if (Array.isArray(currentValue)) {
        currentValue.forEach((item, arrayIndex) => {
          traverse(item, index + 1, `${currentPath}/${arrayIndex}`)
        })
      } else if (currentValue && typeof currentValue === 'object') {
        Object.entries(currentValue).forEach(([key, value]) => {
          traverse(
            value,
            index + 1,
            `${currentPath}/${encodeJsonPointerSegment(key)}`,
          )
        })
      }
      return
    }

    if (
      currentValue &&
      typeof currentValue === 'object' &&
      segment in currentValue
    ) {
      traverse(
        currentValue[segment as keyof typeof currentValue],
        index + 1,
        `${currentPath}/${encodeJsonPointerSegment(segment)}`,
      )
      return
    }

    if (!segments.slice(index).includes('*')) {
      const missingPath = [
        currentPath,
        ...segments
          .slice(index)
          .map((value) => encodeJsonPointerSegment(value)),
      ].join('/')
      resolvedPaths.add(missingPath)
    }
  }

  traverse(document, 0, '')

  return Array.from(resolvedPaths)
}

function getRequiredFieldMessages(
  csafDocument: unknown,
  config: TConfig | undefined,
  existingMessages: ValidationMessage[],
): ValidationMessage[] {
  const requiredPaths = getTemplateRequiredPaths(config)
  if (requiredPaths.length === 0) {
    return []
  }

  const existingErrorPaths = new Set(
    existingMessages
      .filter((message) => message.severity === 'error')
      .map((message) => message.path),
  )
  const requiredMessages = new Map<string, ValidationMessage>()

  requiredPaths.forEach((requiredPath) => {
    const resolvedPaths = requiredPath.includes('*')
      ? resolveJsonPointerPattern(csafDocument, requiredPath)
      : [normalizeJsonPointerPath(requiredPath)]

    resolvedPaths.forEach((path) => {
      if (!path || existingErrorPaths.has(path) || requiredMessages.has(path)) {
        return
      }

      const value = getValueAtPath(csafDocument, path)
      if (!hasValueForRequiredValidation(value)) {
        requiredMessages.set(path, {
          path,
          message: getTemplateRequiredErrorMessage(),
          severity: 'error',
        })
      }
    })
  })

  return Array.from(requiredMessages.values())
}

export async function validateDocument(
  documentStore: TDocumentStore,
  getFullProductName: (id: string) => string,
  getRelationshipFullProductName: (
    sourceVersionId: string,
    targetVersionId: string,
    category: string,
  ) => string,
  config?: TConfig,
): Promise<ValidationResult> {
  try {
    const csafDocument = createCSAFDocument(
      documentStore,
      getFullProductName,
      getRelationshipFullProductName,
      config,
    )
    const result = await validate(tests, csafDocument)

    // Collect all messages with their severity
    let messages: ValidationMessage[] = []

    result.tests.forEach((test) => {
      test.errors.forEach((error) => {
        messages.push({
          path: error.instancePath,
          message: error.message,
          severity: 'error',
        })
      })

      test.warnings.forEach((warning) => {
        messages.push({
          path: warning.instancePath,
          message: warning.message,
          severity: 'warning',
        })
      })

      test.infos.forEach((info) => {
        messages.push({
          path: info.instancePath,
          message: info.message,
          severity: 'info',
        })
      })
    })

    messages = [
      ...messages,
      ...getRequiredFieldMessages(csafDocument, config, messages),
    ]

    return {
      // We want to use result.isValid when we implemented all fields
      // but for now we use the messages length to determine if the document is valid
      isValid: messages.filter((m) => m.severity === 'error').length === 0,
      messages,
    }
  } catch (error) {
    return {
      isValid: false,
      messages: [
        {
          path: '',
          message: `Unknown validation error: ${error}`,
          severity: 'error',
        },
      ],
    }
  }
}
