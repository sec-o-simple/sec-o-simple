declare module '@secvisogram/csaf-validator-lib/validate.js' {
  interface ValidationMessage {
    message: string
    instancePath: string
  }

  interface TestResult {
    isValid: boolean
    warnings: ValidationMessage[]
    errors: ValidationMessage[]
    infos: ValidationMessage[]
    name: string
  }

  interface Result {
    isValid: boolean
    tests: TestResult[]
  }

  export default function validate(
    tests: unknown,
    doc: unknown,
  ): Promise<Result>
}

declare module '@secvisogram/csaf-validator-lib/basic.js'
