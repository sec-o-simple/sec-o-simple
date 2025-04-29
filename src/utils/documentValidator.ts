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

    // Filter out messages for now that we have not implemented
    messages = messages.filter(m => (
      !m.path.startsWith('/product_tree/') &&
      !m.path.endsWith('/cwe/id') &&
      !m.path.endsWith('/product_status/fixed') &&
      !m.path.endsWith('/product_status/known_affected')
    ))

    return {
      // We want to use result.isValid when we implemented all fields
      // but for now we use the messages length to determine if the document is valid
      isValid: messages.filter(m => m.severity === 'error').length === 0,
      messages,
    }
  } catch (error) {
    return {
      isValid: false,
      messages: [],
    }
  }
}
