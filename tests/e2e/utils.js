/**
 * Compares downloaded CSAF JSON with expected JSON, sanitizing dynamic fields like product IDs and timestamps
 * @param {string} downloadPath - Path to the downloaded JSON file
 * @param {string} expectedPath - Path to the expected JSON file
 */
export function compareCSAFExport(downloadPath, expectedPath) {
  cy.readFile(downloadPath).then((downloadedJson) => {
    // Create a mapping for product IDs to make them consistent
    const idMapping = new Map()
    let idCounter = 1

    const sanitizeIds = (obj, path = '') => {
      if (Array.isArray(obj)) {
        return obj.map((item, index) => sanitizeIds(item, `${path}[${index}]`))
      } else if (obj && typeof obj === 'object') {
        const sanitized = { ...obj }

        // Handle product_id fields by creating consistent mappings
        if (sanitized.product_id) {
          if (!idMapping.has(sanitized.product_id)) {
            idMapping.set(sanitized.product_id, `product_${idCounter++}`)
          }
          sanitized.product_id = idMapping.get(sanitized.product_id)
        }

        // Handle product_reference fields
        if (sanitized.product_reference) {
          if (!idMapping.has(sanitized.product_reference)) {
            idMapping.set(sanitized.product_reference, `product_${idCounter++}`)
          }
          sanitized.product_reference = idMapping.get(sanitized.product_reference)
        }

        // Handle relates_to_product_reference fields
        if (sanitized.relates_to_product_reference) {
          if (!idMapping.has(sanitized.relates_to_product_reference)) {
            idMapping.set(
              sanitized.relates_to_product_reference,
              `product_${idCounter++}`,
            )
          }
          sanitized.relates_to_product_reference = idMapping.get(
            sanitized.relates_to_product_reference,
          )
        }

        // Handle arrays of product IDs (like in known_affected, product_ids, products)
        ;['known_affected', 'product_ids', 'products'].forEach((field) => {
          if (Array.isArray(sanitized[field])) {
            sanitized[field] = sanitized[field].map((id) => {
              if (!idMapping.has(id)) {
                idMapping.set(id, `product_${idCounter++}`)
              }
              return idMapping.get(id)
            })
          }
        })

        // Remove timestamp fields that change on each run
        if (path.includes('generator') && sanitized.date) {
          sanitized.date = 'TIMESTAMP_PLACEHOLDER'
        }
        if (
          (path.includes('tracking') || path.includes('revision_history')) &&
          sanitized.date
        ) {
          sanitized.date = 'TIMESTAMP_PLACEHOLDER'
        }
        if (sanitized.current_release_date) {
          sanitized.current_release_date = 'TIMESTAMP_PLACEHOLDER'
        }
        if (sanitized.initial_release_date) {
          sanitized.initial_release_date = 'TIMESTAMP_PLACEHOLDER'
        }

        // Recursively sanitize nested objects
        Object.keys(sanitized).forEach((key) => {
          sanitized[key] = sanitizeIds(sanitized[key], `${path}.${key}`)
        })

        return sanitized
      }
      return obj
    }

    const sanitizedJson = sanitizeIds(downloadedJson)

    return cy.task('fileExists', expectedPath).then((exists) => {
      if (!exists) {
        cy.writeFile(expectedPath, sanitizedJson)
        cy.log('Created expected CSAF JSON file: ' + expectedPath)
      } else {
        // Compare with expected
        return cy.readFile(expectedPath).then((expectedJson) => {
          expect(sanitizedJson).to.deep.equal(expectedJson)
        })
      }
    })
  })
}