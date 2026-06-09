import { TCSAFDocument } from '@/utils/csafExport/csafExport'
import { get, set } from 'lodash'
import { micromark } from 'micromark'
import { gfm, gfmHtml } from 'micromark-extension-gfm'

type MarkdownModifier = (value: string) => string

interface NestedObject {
  [key: string]: unknown
}

const markdownFields = [
  'document.acknowledgments.*.summary',
  'document.distribution.text',
  'document.notes.*.text',
  'document.publisher.issuing_authority',
  'document.references.*.summary',
  'document.tracking.revision_history.*.summary',
  'product_tree.product_groups.*.summary',
  'vulnerabilities.*.acknowledgments.*.summary',
  'vulnerabilities.*.involvements.*.summary',
  'vulnerabilities.*.notes.*.text',
  'vulnerabilities.*.references.*.summary',
  'vulnerabilities.*.remediations.*.details',
  'vulnerabilities.*.remediations.*.entitlements.*',
  'vulnerabilities.*.remediations.*.restart_required.details',
  'vulnerabilities.*.threats.*.details',
] as const

const modifyNestedValues = (
  object: NestedObject,
  key: string,
  modifierFunction: MarkdownModifier,
): void => {
  // check if key includes nested array
  if (key.indexOf('.*') !== -1) {
    const keyParts = key.split('.*')
    // get nested key without leading `.`
    const newKey = key.substring(keyParts[0].length + 2).replace(/^\./, '')
    // get arraylike object
    const elem = get(object, keyParts[0]) as unknown[]

    if (newKey) {
      // call function recursively for all array entries
      for (const x of elem ?? []) {
        if (x !== null && typeof x === 'object') {
          modifyNestedValues(x as NestedObject, newKey, modifierFunction)
        }
      }
    } else if (elem) {
      // apply modifierfunction to all array entries
      set(
        object,
        keyParts[0],
        elem.map((v: unknown) =>
          typeof v === 'string' ? modifierFunction(v) : v,
        ),
      )
    }
  } else {
    // apply modifierfunction to nested value
    const prevValue = get(object, key)
    if (typeof prevValue === 'string') {
      set(object, key, modifierFunction(prevValue))
    }
  }
}

export function parseMarkdown(doc: TCSAFDocument): TCSAFDocument {
  markdownFields.forEach((field) =>
    modifyNestedValues(doc, field, (x: string): string => {
      const parsedX = micromark(x, {
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()],
      })

      // only return parsed value if markdown was used
      return x === parsedX.match(/^<p>(.*)<\/p>$/)?.[1] ? x : parsedX
    }),
  )

  return doc
}
