import { TDocumentStore } from '@/utils/useDocumentStore'
import { createCSAFDocument } from './csafExport/csafExport'

import validate from '@secvisogram/csaf-validator-lib/validate.js'
import * as basic from '@secvisogram/csaf-validator-lib/basic.js'
import { ValidationMessage } from './useValidationStore'

const tests: unknown[] = [...Object.values(basic)]

export interface ValidationResult {
  isValid: boolean
  messages: ValidationMessage[]
}

export async function validateDocument(
  documentStore: TDocumentStore,
): Promise<ValidationResult> {
  try {
    const csafDocument = createCSAFDocument(documentStore)
    const result = await validate(tests, csafDocument)

    // Collect all messages with their severity
    const messages: ValidationMessage[] = []

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
      isValid: result.isValid,
      messages: messages,
    }
  } catch (error) {
    return {
      isValid: false,
      messages: [],
    }
  }
}
