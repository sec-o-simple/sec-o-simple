import Mustache from 'mustache'
import HTMLTemplateRaw from './HTMLTemplate/Template.html?raw'
import { TCSAFDocument } from '@/utils/csafExport/csafExport'
import { HTMLTemplateTranslations } from './htmlTemplateTranslations'

const getProductStatusHeader = () => `
<thead>
  <tr>
    <th>{{t_product}}</th>
    <th>{{t_cvss_vector}}</th>
    <th>{{t_cvss_base_score}}</th>
  </tr>
</thead>`

const PRODUCT_STATUS_ROW = `
<tr>
  <td>{{name}}</td>
  <td>{{vectorString}}</td>
  <td>{{baseScore}}</td>
</tr>`

const getRemediation = () => `
<h5>{{#replaceUnderscores}}{{#upperCase}}{{category}}{{/upperCase}}{{/replaceUnderscores}}{{#date}} ({{.}}){{/date}}</h5>
<p>{{{details}}}</p>
{{#product_ids.length}}
  <h6>{{t_for_products}}:</h6>
  <ul>
  {{#product_ids}}
    <li>{{name}}</li>
  {{/product_ids}}
  </ul>
{{/product_ids.length}}
{{#group_ids.length}}
  <h6>{{t_for_groups}}:</h6>
  <ul>
  {{#group_ids}}
   <li>{{name}}</li>
  {{/group_ids}}
  </ul>
{{/group_ids.length}}
<p>{{#url}}{{> url }}{{/url}}</p>
{{#entitlements}}
  <p>{{{.}}}</p>
{{/entitlements}}
{{#restart_required}}
  {{t_restart_required}}: <b>{{category}}</b>
  <p>{{{details}}}</p>
{{/restart_required}}`

const getThreat = () => `
<h5>{{#replaceUnderscores}}{{#upperCase}}{{category}}{{/upperCase}}{{/replaceUnderscores}}{{#date}} ({{.}}){{/date}}</h5>
<p>{{{details}}}</p>
{{#product_ids.length}}
  <h6>{{t_for_products}}:</h6>
  <ul>
  {{#product_ids}}
    <li>{{name}}</li>
  {{/product_ids}}
  </ul>
{{/product_ids.length}}
{{#group_ids.length}}
  <h6>{{t_for_groups}}:</h6>
  <ul>
  {{#group_ids}}
   <li>{{name}}</li>
  {{/group_ids}}
  </ul>
{{/group_ids.length}}`

const VULNERABILITY_NOTE = `{{#title}}<b>{{.}}</b>{{/title}}{{#audience}} ({{.}}){{/audience}}
{{#text}}<p>{{{text}}}</p>{{/text}}`

const DOCUMENT_NOTE = `{{#title}}<h2>{{.}}</h2>{{/title}}
{{#category}}<small>{{.}}</small>{{/category}}
{{#text}}<p>{{{text}}}</p>{{/text}}`

const ACKNOWLEDGEMENT = `
{{#.}}
  <li>{{#removeTrailingComma}}{{#names}}{{.}}, {{/names}}{{/removeTrailingComma}}{{#organization}}{{#names.length}} {{t_from}} {{/names.length}}{{.}} {{/organization}}{{#summary}} {{t_for}} {{{.}}}{{/summary}}{{#urls.length}} ({{t_see}}: {{#removeTrailingComma}}{{#urls}}{{> url}}, {{/urls}}{{/removeTrailingComma}}){{/urls.length}}</li>
{{/.}}`

const REFERENCE = `
{{#.}}
  <li>{{{summary}}} {{#category}} ({{#replaceUnderscores}}{{.}}{{/replaceUnderscores}}){{/category}}{{#url}}{{> url}}{{/url}}</li>
{{/.}}`

const URL = `
{{#.}}
  <a {{#secureHref}}{{.}}{{/secureHref}}>{{.}}</a>
{{/.}}
`

const PRODUCT_STATUS_FIELDS = [
  'known_affected',
  'first_affected',
  'last_affected',
  'known_not_affected',
  'recommended',
  'fixed',
  'first_fixed',
  'under_investigation',
] as const

type TProductScore = { vectorString: string; baseScore: string | number }

const asObject = (value: unknown): Record<string, unknown> | null => {
  if (value === null || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

const createNameMaps = (document: TCSAFDocument) => {
  const productNameMap = new Map<string, string>()
  const productGroupNameMap = new Map<string, string>()

  const collectProductNamesFromBranches = (branches: unknown) => {
    if (!Array.isArray(branches)) return

    branches.forEach((branch) => {
      const branchObject = asObject(branch)
      if (!branchObject) return

      const product = asObject(branchObject.product)
      const productId = product?.product_id
      const productName = product?.name
      if (typeof productId === 'string' && typeof productName === 'string') {
        productNameMap.set(productId, productName)
      }

      collectProductNamesFromBranches(branchObject.branches)
    })
  }

  collectProductNamesFromBranches(document.product_tree?.branches)

  document.product_tree?.relationships?.forEach((relationship) => {
    if (!relationship) return
    const productId = relationship.full_product_name?.product_id
    const productName = relationship.full_product_name?.name
    if (typeof productId === 'string' && typeof productName === 'string') {
      productNameMap.set(productId, productName)
    }
  })

  const productGroups = (
    document as { product_tree?: { product_groups?: unknown } }
  ).product_tree?.product_groups

  if (Array.isArray(productGroups)) {
    productGroups.forEach((group) => {
      const groupObject = asObject(group)
      if (!groupObject) return

      const groupId = groupObject.group_id
      const groupName = groupObject.summary || groupObject.group_id
      if (typeof groupId === 'string' && typeof groupName === 'string') {
        productGroupNameMap.set(groupId, groupName)
      }
    })
  }

  return { productNameMap, productGroupNameMap }
}

const expandNamedIds = (
  list: unknown,
  idToNameMap: Map<string, string>,
  idKey: 'product_id' | 'group_id',
  scoreByProductId?: Map<string, TProductScore>,
) => {
  if (!Array.isArray(list)) return list

  return list.map((entry) => {
    if (entry !== null && typeof entry === 'object') {
      return entry
    }

    const id = String(entry)
    const expanded: Record<string, unknown> = {
      [idKey]: id,
      name: idToNameMap.get(id) || id,
    }

    if (idKey === 'product_id') {
      const score = scoreByProductId?.get(id)
      expanded.vectorString = score?.vectorString || ''
      expanded.baseScore = score?.baseScore ?? ''
    }

    return expanded
  })
}

const createExpandedProductStatus = (document: TCSAFDocument) => {
  const { productNameMap, productGroupNameMap } = createNameMaps(document)

  return {
    ...document,
    vulnerabilities:
      document.vulnerabilities?.map((vulnerability) => {
        const scoreByProductId = new Map<string, TProductScore>()

        vulnerability.scores?.forEach((score) => {
          const vectorString = score.cvss_v3?.vectorString
          const baseScore = score.cvss_v3?.baseScore

          if (vectorString === undefined || baseScore === undefined) return

          score.products?.forEach((productId) => {
            if (!scoreByProductId.has(productId)) {
              scoreByProductId.set(productId, { vectorString, baseScore })
            }
          })
        })

        const currentProductStatus = vulnerability.product_status || {}

        const expandedProductStatus = PRODUCT_STATUS_FIELDS.reduce(
          (accumulator, field) => {
            const ids = currentProductStatus[field] as unknown[] | undefined
            if (!Array.isArray(ids)) return accumulator

            accumulator[field] = expandNamedIds(
              ids,
              productNameMap,
              'product_id',
              scoreByProductId,
            ) as unknown[]

            return accumulator
          },
          {} as Record<string, unknown[]>,
        )

        return {
          ...vulnerability,
          product_status: {
            ...currentProductStatus,
            ...expandedProductStatus,
          } as unknown as TCSAFDocument['vulnerabilities'][number]['product_status'],
          remediations: vulnerability.remediations?.map((remediation) => ({
            ...remediation,
            product_ids: expandNamedIds(
              remediation.product_ids,
              productNameMap,
              'product_id',
            ),
            group_ids: expandNamedIds(
              (remediation as { group_ids?: unknown }).group_ids,
              productGroupNameMap,
              'group_id',
            ),
          })) as unknown as TCSAFDocument['vulnerabilities'][number]['remediations'],
          threats: (vulnerability as { threats?: unknown[] }).threats?.map(
            (threat) => ({
              ...(threat as Record<string, unknown>),
              product_ids: expandNamedIds(
                (threat as { product_ids?: unknown }).product_ids,
                productNameMap,
                'product_id',
              ),
              group_ids: expandNamedIds(
                (threat as { group_ids?: unknown }).group_ids,
                productGroupNameMap,
                'group_id',
              ),
            }),
          ),
        }
      }) || [],
  }
}

const sanitizeForMustache = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined && item !== null)
      .map((item) => sanitizeForMustache(item))
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, sanitizeForMustache(item)]),
    )
  }

  return value
}

export default function HTMLTemplate({
  document,
  translations,
}: {
  document: TCSAFDocument
  translations: HTMLTemplateTranslations
}) {
  const expandedDocument = createExpandedProductStatus(document)

  const documentWithTranslations = {
    ...expandedDocument,
    ...translations,
    // Custom Mustache functions for template rendering
    removeTrailingComma: () => {
      return function (text: string, render: (text: string) => string) {
        var textWithTrailingComma = /** @type {string} */ render(text)
        const lastIndex = textWithTrailingComma.lastIndexOf(',')
        return lastIndex > 0
          ? textWithTrailingComma.substring(0, lastIndex)
          : textWithTrailingComma
      }
    },
    upperCase: () => {
      return function (text: string, render: (text: string) => string) {
        var renderedText = render(text)
        return renderedText.charAt(0).toUpperCase() + renderedText.slice(1)
      }
    },
    replaceUnderscores: () => {
      return function (text: string, render: (text: string) => string) {
        var renderedText = render(text)
        return renderedText.replaceAll('_', ' ')
      }
    },
    secureHref: () => {
      return function (text: string, render: (text: string) => string) {
        const href = render(text)
        let isValid = false

        const validStarts = ['#', 'mailto', 'tel', 'http', 'ftp']
        const validMimeTypes = [
          'image/png;base64,',
          'image/jpeg;base64,',
          'image/gif;base64,',
        ].map((x) => x.replaceAll('/', '&#x2F;'))
        validStarts.forEach((x) => (isValid = isValid || href.startsWith(x)))
        const isBase64 = (value: string) =>
          /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(
            value,
          )
        validMimeTypes.forEach((mimeType) => {
          const isValidDataHref =
            href.startsWith(`data:${mimeType}`) &&
            isBase64(href.split(',')[1]?.replaceAll('&#x3D;', '='))
          isValid = isValid || isValidDataHref
        })

        return isValid ? `href="${href}"` : ''
      }
    },
  }

  const sanitizedDocumentWithTranslations = sanitizeForMustache(
    documentWithTranslations,
  )

  return Mustache.render(HTMLTemplateRaw, sanitizedDocumentWithTranslations, {
    product_status_header: getProductStatusHeader(),
    product_status_row: PRODUCT_STATUS_ROW,
    remediation: getRemediation(),
    threat: getThreat(),
    vulnerability_note: VULNERABILITY_NOTE,
    document_note: DOCUMENT_NOTE,
    acknowledgment: ACKNOWLEDGEMENT,
    reference: REFERENCE,
    url: URL,
  })
}
