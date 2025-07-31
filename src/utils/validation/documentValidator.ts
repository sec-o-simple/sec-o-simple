import { TDocumentStore } from '@/utils/useDocumentStore'
import { createCSAFDocument } from '../csafExport/csafExport'

import * as basic from '@secvisogram/csaf-validator-lib/basic.js'
import validate from '@secvisogram/csaf-validator-lib/validate.js'
import { TConfig } from '../useConfigStore'
import { ValidationMessage } from './useValidationStore'

const tests: unknown[] = [...Object.values(basic)]

export interface ValidationResult {
  isValid: boolean
  messages: ValidationMessage[]
}

export async function validateDocument(
  documentStore: TDocumentStore,
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

    return {
      // We want to use result.isValid when we implemented all fields
      // but for now we use the messages length to determine if the document is valid
      isValid: messages.filter((m) => m.severity === 'error').length === 0,
      messages,
    }
  } catch (error) {
    return {
      isValid: false,
      messages: [],
    }
  }
}
